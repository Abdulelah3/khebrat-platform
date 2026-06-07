import { useState } from "react";
import * as XLSX from "xlsx";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import toast from "react-hot-toast";
import { CertificateFormSchema } from "../lib/validations";
import { AppUser, DesignSettings, ExtraField, FormData } from "../types";

export function useBulkUpload(
  user: AppUser | null, 
  formData: FormData, 
  design: DesignSettings, 
  extraFields: ExtraField[],
  generateCertId: () => string
) {
  const [isBulking, setIsBulking] = useState(false);

  const handleBulkUpload = async (file: File | undefined, agreed: boolean, onComplete: () => void) => {
    if (!file) return;

    if (!agreed) {
      toast.error("يجب الموافقة أولاً على إخلاء المسؤولية");
      onComplete();
      return;
    }

    setIsBulking(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error("الملف فارغ");
        setIsBulking(false);
        onComplete();
        return;
      }

      if (!window.confirm(`تم العثور على ${jsonData.length} موظف. هل أنت متأكد من إصدار الشهادات لهم جميعاً؟`)) {
        setIsBulking(false);
        onComplete();
        return;
      }

      toast.loading(`جاري إصدار ${jsonData.length} شهادة...`, { id: 'bulk' });
      
      let successCount = 0;
      let errorCount = 0;

      // Helper function to delay execution
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

      // Batch processing to prevent UI blocking and server rate limits
      const BATCH_SIZE = 5;
      for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
        const batch = jsonData.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (row: any, index: number) => {
          const email = row["الايميل"] || row["البريد"] || row["email"] || row["Email"] || "";
          const empName = row["الاسم"] || row["name"] || row["Name"] || "";
          const compName = formData.companyName || user?.companyName || "الشركة";
          const jobTitle = row["المسمى الوظيفي"] || row["job"] || row["Job"] || formData.jobTitle || "";
          const empId = String(row["رقم الهوية"] || row["id"] || row["ID"] || "");

          const validationResult = CertificateFormSchema.safeParse({
            companyName: compName,
            employeeName: empName,
            employeeEmail: email,
            employeeId: empId,
            jobTitle: jobTitle
          });

          if (!validationResult.success) {
            console.warn(`تخطى الموظف ${empName} بسبب بيانات غير صحيحة`);
            errorCount++;
            return;
          }

          const newCertId = generateCertId();

          try {
            await addDoc(collection(db, "certificates"), {
              ...formData, 
              employeeName: empName,
              employeeId: empId,
              employeeEmail: email,
              jobTitle: jobTitle,
              companyName: compName,
              certId: newCertId,
              uid: user?.uid || "",
              createdAt: serverTimestamp(),
              status: "active",
              design: design,
              extraFields: extraFields
            });

            if (email) {
              // Add a small delay based on index to prevent hitting Vercel/Resend rate limits simultaneously
              await delay(index * 200); 
              
              await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  certId: newCertId,
                  url: `${window.location.origin}/certificate/${newCertId}`
                })
              }).catch(e => console.error("Email send error", e));
            }
            successCount++;
          } catch (e) {
            console.error("Firebase save error", e);
            errorCount++;
          }
        }));
        
        // Add a delay between batches
        if (i + BATCH_SIZE < jsonData.length) {
          await delay(1000);
        }
      }

      toast.success(`تم إصدار ${successCount} شهادة بنجاح! ${errorCount > 0 ? `(فشل ${errorCount})` : ''}`, { id: 'bulk' });
    } catch (error) {
      console.error("Bulk upload error:", error);
      toast.error("حدث خطأ أثناء قراءة الملف", { id: 'bulk' });
    } finally {
      setIsBulking(false);
      onComplete();
    }
  };

  return { isBulking, handleBulkUpload };
}
