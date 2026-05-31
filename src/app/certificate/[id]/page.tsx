"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { QRCodeSVG } from "qrcode.react";
import { Download, Image as ImageIcon, ArrowRight, Printer } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

export default function CertificateView() {
  const params = useParams();
  const router = useRouter();
  const certId = params.id as string;
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    const fetchCert = async () => {
      try {
        const q = query(collection(db, "certificates"), where("certId", "==", certId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setCertData(querySnapshot.docs[0].data());
        } else {
          const docRef = doc(db, "certificates", certId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCertData(docSnap.data());
          } else {
            toast.error("الشهادة غير موجودة");
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("حدث خطأ أثناء جلب الشهادة");
      } finally {
        setLoading(false);
      }
    };
    if (certId) fetchCert();
  }, [certId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleGenerate = async (type: 'pdf' | 'image') => {
    if (!certRef.current) return;
    setIsGenerating(true);

    try {
      const dataUrl = await toPng(certRef.current, {
        quality: 1,
        pixelRatio: 3,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });

      if (type === 'image') {
        const link = document.createElement("a");
        link.download = `certificate_${certId}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("تم تنزيل الشهادة كصورة.");
      } else {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [800, 580],
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, 800, 580);
        pdf.save(`certificate_${certId}.pdf`);
        toast.success("تم تنزيل الشهادة كملف PDF.");
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("حدث خطأ أثناء تحميل الشهادة. حاول مرة أخرى.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      window.close();
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!certData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">الشهادة غير موجودة</h1>
        <button onClick={() => router.push('/')} className="bg-green-600 text-white px-6 py-2 rounded-lg">العودة للرئيسية</button>
      </div>
    );
  }

  const { design, ...formData } = certData;
  const extraFields = formData.extraFields || [];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-cert, #printable-cert * {
            visibility: visible;
          }
          #printable-cert {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
          @page { size: landscape; margin: 0; }
        }
      `}} />
      <div className="w-full max-w-5xl mb-8 flex justify-between items-center">
        <button onClick={handleBack} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
          <ArrowRight className="w-5 h-5" /> رجوع
        </button>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="bg-white text-gray-800 font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
            <Printer className="w-5 h-5" /> طباعة
          </button>
          <button onClick={() => handleGenerate('pdf')} disabled={isGenerating} className="bg-green-600 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-md hover:bg-green-700 transition-colors">
            {isGenerating ? "جاري..." : <><Download className="w-5 h-5" /> تحميل PDF</>}
          </button>
          <button onClick={() => handleGenerate('image')} disabled={isGenerating} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-md hover:bg-blue-700 transition-colors">
            {isGenerating ? "جاري..." : <><ImageIcon className="w-5 h-5" /> حفظ صورة</>}
          </button>
        </div>
      </div>

      <div className="w-full overflow-auto flex justify-center pb-10" dir="ltr">
        <div id="printable-cert" ref={certRef} style={{
          width: "800px", minHeight: "580px", backgroundColor: design.bgColor,
          position: "relative", overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)", borderRadius: "4px",
          padding: `${design.certPadding}px`, direction: "rtl",
          margin: "0 auto"
        }}>
          {/* Pattern */}
          {design.showPattern && (
            <div style={{ backgroundImage: `radial-gradient(${design.borderColor} 0.5px, transparent 0.5px)`, backgroundSize: "20px 20px", opacity: 0.03, position: "absolute", inset: 0, pointerEvents: "none" }}></div>
          )}
          {/* Border */}
          {design.showBorder && (
            <div style={{ position: "absolute", top: "12px", left: "12px", right: "12px", bottom: "12px", border: `${design.borderWidth}px solid ${design.borderColor}`, pointerEvents: "none", borderRadius: "2px" }}></div>
          )}
          {/* Inner Border */}
          {design.showInnerBorder && (
            <div style={{ position: "absolute", top: `${12 + design.borderWidth + 2}px`, left: `${12 + design.borderWidth + 2}px`, right: `${12 + design.borderWidth + 2}px`, bottom: `${12 + design.borderWidth + 2}px`, border: `1px solid ${design.innerBorderColor}`, pointerEvents: "none", borderRadius: "2px" }}></div>
          )}

          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ textAlign: "right" }}>
                <h1 style={{ fontSize: `${design.headerFontSize}px`, fontWeight: "bold", color: design.strongColor }}>{formData.companyName || "اسم الشركة / الجهة"}</h1>
                <p style={{ color: design.subtitleColor, fontSize: "13px", marginTop: "4px" }}>{design.certSubtitle}</p>
              </div>
              {design.showLogo && design.logoImage && (
                <img src={design.logoImage} alt="Logo" style={{ height: "70px", width: "70px", objectFit: "contain" }} />
              )}
            </div>

            {/* Title */}
            <div style={{ textAlign: "center", margin: "25px 0" }}>
              <h2 style={{ fontSize: `${design.titleFontSize}px`, fontWeight: "bold", color: design.titleColor, letterSpacing: "6px" }}>{design.certTitle}</h2>
            </div>

            {/* Content */}
            <div style={{ textAlign: "center", lineHeight: design.lineHeight, fontSize: `${design.bodyFontSize}px`, color: design.textColor, padding: "0 20px" }}>
              <p>
                {design.certBodyIntro} {formData.companyName || "الموارد البشرية"} {design.certBodyIntro2} {formData.employeeName ? <strong style={{ fontSize: `${design.bodyFontSize + 2}px`, color: design.strongColor, borderBottom: `1px dashed ${design.subtitleColor}`, paddingBottom: "2px", paddingRight: "6px", paddingLeft: "6px" }}>{formData.employeeName}</strong> : null}
              </p>
              <p style={{ marginTop: "12px" }}>
                {design.certBodyJob} {formData.employeeId ? <strong style={{ color: design.strongColor }}>{formData.employeeId}</strong> : null}{design.certBodyJob2} {formData.jobTitle ? <strong style={{ color: design.strongColor, borderBottom: `1px dashed ${design.subtitleColor}`, paddingBottom: "2px", paddingRight: "6px", paddingLeft: "6px" }}>{formData.jobTitle}</strong> : null}
              </p>
              <p style={{ marginTop: "12px" }}>
                {design.certBodyPeriod} {formData.startDate ? <strong style={{ color: design.strongColor }}>{formatDate(formData.startDate)}</strong> : null} {design.certBodyPeriod2} {formData.endDate ? <strong style={{ color: design.strongColor }}>{formatDate(formData.endDate)}</strong> : null}.
              </p>
              {/* Extra Fields */}
              {extraFields.map((field: any) => (
                <p key={field.id} style={{ marginTop: "12px" }}>
                  {field.label}: {field.value ? <strong style={{ color: design.strongColor }}>{field.value}</strong> : null}
                </p>
              ))}
              <p style={{ marginTop: "24px", fontSize: `${design.bodyFontSize - 2}px`, color: design.subtitleColor }}>
                {design.certFooterText}
              </p>
              {formData.issueDate && (
                <p style={{ marginTop: "8px", fontSize: `${design.bodyFontSize - 2}px`, color: design.subtitleColor, fontWeight: "bold" }}>
                  {design.certIssueDateText} <span style={{ color: design.strongColor }}>{formatDate(formData.issueDate)}</span>
                </p>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "30px" }}>
              {design.showManagerSection && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: "bold", color: design.strongColor, fontSize: "13px" }}>مدير المركز / الشركة</p>
                  {formData.managerName && (
                    <p style={{ marginTop: "4px", color: design.strongColor, fontSize: "12px", fontWeight: "bold" }}>الاسم: {formData.managerName}</p>
                  )}
                  <p style={{ marginTop: "6px", color: design.subtitleColor, fontSize: "12px" }}>التوقيع: _________________</p>
                </div>
              )}
              {design.showQR && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ border: `3px solid ${design.innerBorderColor}`, borderRadius: "8px", padding: "4px", backgroundColor: "white" }}>
                    <QRCodeSVG 
                      value={`${origin}/verify?id=${certId}`} 
                      size={design.qrSize} 
                      level="L" 
                      fgColor={design.qrColor} 
                    />
                  </div>
                  <p style={{ fontSize: "10px", color: design.textColor, fontFamily: "monospace", fontWeight: "bold" }}>{certId}</p>
                  <p style={{ fontSize: "8px", color: "#9ca3af", fontWeight: "bold" }}>امسح للتحقق</p>
                </div>
              )}
              {design.showSeal && (
                <div style={{ textAlign: "center", opacity: 0.85, transform: "rotate(-5deg)", position: "relative" }}>
                  {design.sealImage ? (
                    <img src={design.sealImage} alt="Seal" style={{ height: "90px", width: "90px", objectFit: "contain" }} />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      {design.sealText && <p style={{ color: design.subtitleColor, fontWeight: "bold", fontSize: "14px" }}>{design.sealText}</p>}
                      {design.sealSubText && <p style={{ color: design.subtitleColor, fontSize: "10px", marginTop: "4px" }}>{design.sealSubText}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
