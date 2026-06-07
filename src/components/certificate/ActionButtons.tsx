import React, { useRef } from "react";
import { CheckCircle2, ShieldAlert, FileSpreadsheet, Download, Image as ImageIcon } from "lucide-react";

interface ActionButtonsProps {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  isBulking: boolean;
  isGenerating: boolean;
  certId: string | null;
  agreed: boolean;
  handleAuthenticate: () => void;
  handleBulkUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerate: (type: 'pdf' | 'image') => void;
}

export function ActionButtons({
  isAuthenticated,
  isAuthenticating,
  isBulking,
  isGenerating,
  certId,
  agreed,
  handleAuthenticate,
  handleBulkUpload,
  handleGenerate
}: ActionButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="pt-5 mt-5 border-t border-gray-200 space-y-3">
      <button onClick={handleAuthenticate} disabled={isAuthenticating || isAuthenticated || isBulking}
        className={`w-full font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${isAuthenticated ? 'bg-green-50 text-green-700 cursor-not-allowed border-2 border-green-200' : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:shadow-lg'}`}
        style={isAuthenticated ? {} : { border: "2px solid #eab308" }}>
        {isAuthenticating ? <span className="animate-pulse">جاري التوثيق...</span> : isAuthenticated ? <><CheckCircle2 className="w-5 h-5" /> تم توثيق الشهادة بنجاح ({certId})</> : <><ShieldAlert className="w-5 h-5" /> توثيق الشهادة رسمياً</>}
      </button>

      <div className="flex gap-3">
        <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleBulkUpload} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} disabled={isBulking || isAuthenticating}
          className="w-full text-blue-700 bg-blue-50 border-2 border-blue-200 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:bg-blue-100">
          {isBulking ? <span className="animate-pulse">جاري الإصدار الجماعي...</span> : <><FileSpreadsheet className="w-5 h-5" /> إصدار جماعي (Excel)</>}
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={() => handleGenerate('pdf')} disabled={isGenerating}
          className="flex-1 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          style={{ backgroundColor: "#16a34a" }}>
          {isGenerating ? <span className="animate-pulse">جاري...</span> : <><Download className="w-5 h-5" /> تحميل PDF</>}
        </button>
        <button onClick={() => handleGenerate('image')} disabled={isGenerating}
          className="flex-1 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          style={{ backgroundColor: "#16a34a" }}>
          {isGenerating ? <span className="animate-pulse">جاري...</span> : <><ImageIcon className="w-5 h-5" /> حفظ كصورة</>}
        </button>
      </div>

      {!agreed && (
        <p className="text-xs text-center text-orange-600 flex items-center justify-center gap-1">
          <ShieldAlert className="w-4 h-4" /> يجب الموافقة على إخلاء المسؤولية أولاً
        </p>
      )}
    </div>
  );
}
