import { useState, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { CertificateFormSchema } from "../lib/validations";
import { AppUser, DesignSettings, ExtraField, FormData } from "../types";

export function useCertificate(
  user: AppUser | null,
  formData: FormData,
  design: DesignSettings,
  extraFields: ExtraField[],
  generateCertId: () => string
) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [certId, setCertId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleAuthenticate = async (agreed: boolean, setShowDisclaimer: (val: boolean) => void) => {
    if (!agreed) {
      setShowDisclaimer(true);
      return;
    }

    const validationResult = CertificateFormSchema.safeParse(formData);

    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    setIsAuthenticating(true);
    try {
      const newCertId = generateCertId();
      await addDoc(collection(db, "certificates"), {
        ...formData,
        companyName: formData.companyName || user?.companyName || "الشركة",
        certId: newCertId,
        uid: user?.uid,
        createdAt: serverTimestamp(),
        status: "active",
        design: design,
        extraFields: extraFields
      });
      setCertId(newCertId);
      setIsAuthenticated(true);
      toast.success(`تم توثيق الشهادة بنجاح!\nرقم الاعتماد: ${newCertId}`);

      if (formData.employeeEmail) {
        try {
          toast.loading("جاري إرسال الإيميل...", { id: "email-toast" });
          const res = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              certId: newCertId,
              url: `${window.location.origin}/certificate/${newCertId}`
            })
          });
          const data = await res.json();
          if (res.ok) {
            toast.success("تم إرسال الشهادة بالإيميل للموظف بنجاح! 📧", { id: "email-toast" });
          } else {
            toast.error(data.error || "حدث خطأ في إرسال الإيميل", { id: "email-toast" });
          }
        } catch (emailErr) {
          console.error("Error sending email:", emailErr);
          toast.error("فشل إرسال الإيميل.", { id: "email-toast" });
        }
      }
    } catch (e) {
      console.error("Firebase save error:", e);
      toast.error("حدث خطأ أثناء التوثيق! تأكد من اتصالك.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGenerate = async (type: 'pdf' | 'image', agreed: boolean, setShowDisclaimer: (val: boolean) => void) => {
    if (!agreed) {
      setShowDisclaimer(true);
      return;
    }
    if (!formData.employeeName || !formData.jobTitle) {
      toast.error("يرجى تعبئة اسم الموظف والمسمى الوظيفي على الأقل.");
      return;
    }

    setIsGenerating(true);

    try {
      if (!certRef.current) { setIsGenerating(false); return; }

      const el = certRef.current;
      const originalPosition = el.style.position;
      const originalTop = el.style.top;
      const originalLeft = el.style.left;
      const originalTransform = el.style.transform;
      const originalMargin = el.style.margin;

      el.style.position = "fixed";
      el.style.top = "0";
      el.style.left = "0";
      el.style.margin = "0";
      el.style.transform = "none";

      const dataUrl = await toPng(el, {
        quality: 1,
        pixelRatio: 3,
        width: 800,
        height: el.offsetHeight || 580,
      });

      el.style.position = originalPosition;
      el.style.top = originalTop;
      el.style.left = originalLeft;
      el.style.margin = originalMargin;
      el.style.transform = originalTransform;
      
      if (type === 'image') {
        const link = document.createElement("a");
        link.download = `شهادة_خبرة_${formData.employeeName}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const img = new Image();
        img.src = dataUrl;
        await new Promise(resolve => { img.onload = resolve; });
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [img.width / 2, img.height / 2]
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, img.width / 2, img.height / 2);
        pdf.save(`شهادة_خبرة_${formData.employeeName}.pdf`);
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("حدث خطأ أثناء توليد الشهادة. حاول مرة أخرى.");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isAuthenticating,
    isAuthenticated,
    certId,
    isGenerating,
    certRef,
    handleAuthenticate,
    handleGenerate
  };
}
