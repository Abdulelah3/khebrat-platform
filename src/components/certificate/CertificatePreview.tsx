import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { DesignSettings, ExtraField, FormData } from "../../types";

interface CertificatePreviewProps {
  certRef: React.RefObject<HTMLDivElement | null>;
  design: DesignSettings;
  formData: FormData;
  extraFields: ExtraField[];
  isAuthenticated: boolean;
  certId: string | null;
  origin: string;
}

export function CertificatePreview({
  certRef,
  design,
  formData,
  extraFields,
  isAuthenticated,
  certId,
  origin
}: CertificatePreviewProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "____/____/________";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div
      ref={certRef}
      style={{
        backgroundColor: design.bgColor,
        padding: `${design.certPadding}px`,
        position: "relative",
        overflow: "hidden",
        width: "100%",
        minHeight: "600px",
      }}
    >
      {/* Background Pattern */}
      {design.showPattern && (
        <div style={{ backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)", backgroundSize: "20px 20px", position: "absolute", inset: 0, opacity: 0.5, pointerEvents: "none" }}></div>
      )}

      {/* Borders */}
      {design.showBorder && (
        <div style={{ position: "absolute", inset: "16px", border: `${design.borderWidth + 2}px solid ${design.borderColor}`, pointerEvents: "none" }}></div>
      )}
      {design.showInnerBorder && (
        <div style={{ position: "absolute", inset: "24px", border: `${design.borderWidth}px solid ${design.innerBorderColor}`, pointerEvents: "none" }}></div>
      )}

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ fontSize: `${design.headerFontSize}px`, fontWeight: "bold", color: design.strongColor }}>{formData.companyName || "اسم الشركة / الجهة"}</h1>
            <p style={{ color: design.subtitleColor, fontSize: "13px", marginTop: "4px" }}>{design.certSubtitle}</p>
          </div>
          {design.showLogo && (
            design.logoImage ? (
              <img src={design.logoImage} alt="Logo" style={{ height: "70px", width: "70px", objectFit: "contain" }} />
            ) : (
              <div style={{ height: "70px", width: "70px", border: "2px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "10px", borderRadius: "8px", textAlign: "center" }}>شعار<br />الجهة</div>
            )
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
          {extraFields.map(field => (
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
              {isAuthenticated && certId ? (
                <>
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
                </>
              ) : (
                <>
                  <div style={{ width: `${design.qrSize + 8}px`, height: `${design.qrSize + 8}px`, border: `2px dashed ${design.innerBorderColor}50`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.5)" }}>
                    <span style={{ fontSize: "10px", color: design.textColor, textAlign: "center", opacity: 0.5, fontWeight: "bold" }}>مسودة<br/>غير موثقة</span>
                  </div>
                </>
              )}
            </div>
          )}
          {design.showSeal && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "80px", height: "80px" }}>
              {design.sealImage ? (
                <img src={design.sealImage} alt="Seal" style={{ height: "100%", width: "100%", objectFit: "contain" }} />
              ) : (
                <>
                  <p style={{ fontSize: "14px", color: design.subtitleColor, fontWeight: "bold" }}>{design.sealText || "ختم"}</p>
                  {design.sealSubText && <p style={{ fontSize: "10px", color: design.subtitleColor, marginTop: "2px" }}>{design.sealSubText}</p>}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
