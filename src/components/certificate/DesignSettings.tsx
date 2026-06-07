import React from "react";
import { Palette, Type, FileText, Layout } from "lucide-react";
import { DesignSettings } from "../../types";

interface DesignSettingsProps {
  design: DesignSettings;
  handleDesignChange: (key: string, value: string | number | boolean) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, propKey: string) => void;
}

export function DesignSettingsForm({ design, handleDesignChange, handleImageUpload }: DesignSettingsProps) {
  const ColorInput = ({ label, value, propKey }: { label: string; value: string; propKey: keyof DesignSettings }) => (
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs text-gray-600">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => handleDesignChange(propKey as string, e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
        <input type="text" value={value} onChange={(e) => handleDesignChange(propKey as string, e.target.value)} className="w-20 text-xs px-2 py-1 border border-gray-300 rounded text-center font-mono" />
      </div>
    </div>
  );

  const RangeInput = ({ label, value, propKey, min, max, unit }: { label: string; value: number; propKey: keyof DesignSettings; min: number; max: number; unit?: string }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-600">{label}</label>
        <span className="text-xs font-bold text-gray-800">{value}{unit || "px"}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => handleDesignChange(propKey as string, Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-green-600" />
    </div>
  );

  const ToggleSwitch = ({ label, value, propKey, icon }: { label: string; value: boolean; propKey: keyof DesignSettings; icon?: React.ReactNode }) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-gray-700">{label}</span>
      </div>
      <button
        onClick={() => handleDesignChange(propKey as string, !value)}
        className="relative w-10 h-5 rounded-full transition-colors"
        style={{ backgroundColor: value ? "#16a34a" : "#d1d5db" }}
      >
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ left: value ? "22px" : "2px" }}></span>
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Colors Section */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Palette className="w-4 h-4" style={{ color: "#16a34a" }} /> الألوان</h3>
        <div className="space-y-3 p-3 rounded-xl" style={{ backgroundColor: "#f9fafb" }}>
          <ColorInput label="خلفية الشهادة" value={design.bgColor} propKey="bgColor" />
          <ColorInput label="لون الإطار" value={design.borderColor} propKey="borderColor" />
          <ColorInput label="لون الإطار الداخلي" value={design.innerBorderColor} propKey="innerBorderColor" />
          <ColorInput label="لون العنوان" value={design.titleColor} propKey="titleColor" />
          <ColorInput label="لون النص" value={design.textColor} propKey="textColor" />
          <ColorInput label="لون النص الغامق" value={design.strongColor} propKey="strongColor" />
          <ColorInput label="لون الختم" value={design.sealColor} propKey="sealColor" />
          <ColorInput label="لون الباركود" value={design.qrColor} propKey="qrColor" />
        </div>
      </div>

      {/* Typography Section */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Type className="w-4 h-4" style={{ color: "#16a34a" }} /> الخطوط والأحجام</h3>
        <div className="space-y-3 p-3 rounded-xl" style={{ backgroundColor: "#f9fafb" }}>
          <RangeInput label="حجم العنوان الرئيسي" value={design.titleFontSize} propKey="titleFontSize" min={18} max={50} />
          <RangeInput label="حجم اسم الشركة" value={design.headerFontSize} propKey="headerFontSize" min={14} max={36} />
          <RangeInput label="حجم نص الشهادة" value={design.bodyFontSize} propKey="bodyFontSize" min={10} max={24} />
          <RangeInput label="تباعد الأسطر" value={design.lineHeight} propKey="lineHeight" min={1} max={3} unit="" />
        </div>
      </div>

      {/* Text Editing Section */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><FileText className="w-4 h-4" style={{ color: "#16a34a" }} /> تعديل النصوص</h3>
        <div className="space-y-3 p-3 rounded-xl" style={{ backgroundColor: "#f9fafb" }}>
          <div>
            <label className="block text-xs text-gray-600 mb-1">عنوان الشهادة</label>
            <input type="text" value={design.certTitle} onChange={(e) => handleDesignChange("certTitle", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">العنوان الفرعي</label>
            <input type="text" value={design.certSubtitle} onChange={(e) => handleDesignChange("certSubtitle", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">نص المقدمة (الجزء الأول)</label>
            <input type="text" value={design.certBodyIntro} onChange={(e) => handleDesignChange("certBodyIntro", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">نص المقدمة (الجزء الثاني)</label>
            <input type="text" value={design.certBodyIntro2} onChange={(e) => handleDesignChange("certBodyIntro2", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">نص الهوية</label>
            <input type="text" value={design.certBodyJob} onChange={(e) => handleDesignChange("certBodyJob", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">نص المسمى الوظيفي</label>
            <input type="text" value={design.certBodyJob2} onChange={(e) => handleDesignChange("certBodyJob2", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">نص بداية الفترة</label>
            <input type="text" value={design.certBodyPeriod} onChange={(e) => handleDesignChange("certBodyPeriod", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">نص نهاية الفترة</label>
            <input type="text" value={design.certBodyPeriod2} onChange={(e) => handleDesignChange("certBodyPeriod2", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">نص تاريخ التحرير</label>
            <input type="text" value={design.certIssueDateText} onChange={(e) => handleDesignChange("certIssueDateText", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">نص الختم</label>
            <input type="text" value={design.sealText} onChange={(e) => handleDesignChange("sealText", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">نص الختم الفرعي</label>
            <input type="text" value={design.sealSubText} onChange={(e) => handleDesignChange("sealSubText", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">نهاية الشهادة</label>
            <textarea value={design.certFooterText} onChange={(e) => handleDesignChange("certFooterText", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg h-20 resize-none" />
          </div>
        </div>
      </div>

      {/* ===== Layout Section ===== */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Layout className="w-4 h-4" style={{ color: "#16a34a" }} /> إظهار / إخفاء العناصر</h3>
        <div className="space-y-2 p-3 rounded-xl" style={{ backgroundColor: "#f9fafb" }}>
          <ToggleSwitch label="الإطار الخارجي" value={design.showBorder} propKey="showBorder" />
          <ToggleSwitch label="الإطار الداخلي" value={design.showInnerBorder} propKey="showInnerBorder" />
          <ToggleSwitch label="النمط الخلفي (النقاط)" value={design.showPattern} propKey="showPattern" />
          <ToggleSwitch label="الشعار" value={design.showLogo} propKey="showLogo" />
          <ToggleSwitch label="الباركود (QR)" value={design.showQR} propKey="showQR" />
          <ToggleSwitch label="الختم الإلكتروني" value={design.showSeal} propKey="showSeal" />
          <ToggleSwitch label="قسم المدير والتوقيع" value={design.showManagerSection} propKey="showManagerSection" />
        </div>
      </div>

      {/* Images Section */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">🖼️ الصور والشعارات</h3>
        <div className="space-y-3 p-3 rounded-xl" style={{ backgroundColor: "#f9fafb" }}>
          <div>
            <label className="block text-xs text-gray-600 mb-1">شعار الجهة (Logo)</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "logoImage")} className="w-full text-xs" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">صورة الختم (Seal)</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "sealImage")} className="w-full text-xs" />
          </div>
        </div>
      </div>

      {/* Spacing Section */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3">📐 المسافات</h3>
        <div className="space-y-3 p-3 rounded-xl" style={{ backgroundColor: "#f9fafb" }}>
          <RangeInput label="هوامش الشهادة" value={design.certPadding} propKey="certPadding" min={20} max={80} />
          <RangeInput label="سمك الإطار" value={design.borderWidth} propKey="borderWidth" min={1} max={6} />
          <RangeInput label="حجم الباركود" value={design.qrSize} propKey="qrSize" min={40} max={120} />
        </div>
      </div>
    </div>
  );
}
