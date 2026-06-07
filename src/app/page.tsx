"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ShieldAlert, FileText, LayoutDashboard, X, Palette } from "lucide-react";
import FullscreenToggle from "@/components/FullscreenToggle";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppUser, DesignSettings, ExtraField, FormData } from "../types";
import { DataForm } from "../components/certificate/DataForm";
import { DesignSettingsForm } from "../components/certificate/DesignSettings";
import { CertificatePreview } from "../components/certificate/CertificatePreview";
import { ActionButtons } from "../components/certificate/ActionButtons";
import { useBulkUpload } from "../hooks/useBulkUpload";
import { useCertificate } from "../hooks/useCertificate";

type TabType = "data" | "design";

export default function Home() {
  const [agreed, setAgreed] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("data");
  
  // States
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    employeeName: "",
    employeeEmail: "",
    employeeId: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    issueDate: "",
    managerName: "",
  });
  
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [origin, setOrigin] = useState("https://khebrat.vercel.app");
  
  const [user, setUser] = useState<AppUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  // Design Customization
  const [design, setDesign] = useState<DesignSettings>({
    bgColor: "#ffffff",
    borderColor: "#16a34a",
    innerBorderColor: "#bbf7d0",
    titleColor: "#15803d",
    textColor: "#374151",
    strongColor: "#111827",
    subtitleColor: "#6b7280",
    titleFontSize: 32,
    bodyFontSize: 15,
    headerFontSize: 22,
    certTitle: "شـهـادة خـبـرة",
    certSubtitle: "إدارة الموارد البشرية",
    certBodyIntro: "تشهد إدارة",
    certBodyIntro2: "بأن السيد/ة:",
    certBodyJob: "والذي يحمل هوية رقم:",
    certBodyJob2: "، قد عمل لدينا بمسمى وظيفي:",
    certBodyPeriod: "وذلك خلال الفترة من",
    certBodyPeriod2: "وحتى تاريخ",
    certIssueDateText: "حررت بتاريخ:",
    certFooterText: "وقد أعطيت له هذه الشهادة بناءً على طلبه لتقديمها لمن يهمه الأمر، دون أدنى مسؤولية على الجهة تجاه الغير.",
    showBorder: true,
    showInnerBorder: true,
    showPattern: true,
    showQR: true,
    showSeal: true,
    showLogo: true,
    showManagerSection: true,
    sealText: "مُعتمد",
    sealSubText: "منصة خبرات",
    sealColor: "#16a34a",
    sealImage: "", 
    logoImage: "", 
    qrColor: "#15803d",
    qrSize: 70,
    certPadding: 50,
    borderWidth: 2,
    lineHeight: 2.2,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u as AppUser);
      setLoadingAuth(false);
      if (!u) {
        router.push("/auth");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setOrigin(window.location.origin);
    const savedDesign = localStorage.getItem("khebrat_design");
    const savedFormData = localStorage.getItem("khebrat_formData");
    const savedExtraFields = localStorage.getItem("khebrat_extraFields");
    
    if (savedDesign) setDesign(JSON.parse(savedDesign));
    if (savedFormData) setFormData(JSON.parse(savedFormData));
    if (savedExtraFields) setExtraFields(JSON.parse(savedExtraFields));
  }, []);

  useEffect(() => {
    if (!loadingAuth) localStorage.setItem("khebrat_design", JSON.stringify(design));
  }, [design, loadingAuth]);

  useEffect(() => {
    if (!loadingAuth) localStorage.setItem("khebrat_formData", JSON.stringify(formData));
  }, [formData, loadingAuth]);

  useEffect(() => {
    if (!loadingAuth) localStorage.setItem("khebrat_extraFields", JSON.stringify(extraFields));
  }, [extraFields, loadingAuth]);

  const generateCertId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'KH-';
    for (let i = 0; i < 8; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
    return id;
  };

  const { isBulking, handleBulkUpload: triggerBulkUpload } = useBulkUpload(user, formData, design, extraFields, generateCertId);
  
  const {
    isAuthenticating,
    isAuthenticated,
    certId,
    isGenerating,
    certRef,
    handleAuthenticate: triggerAuth,
    handleGenerate: triggerGenerate
  } = useCertificate(user, formData, design, extraFields, generateCertId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDesignChange = (key: string, value: string | number | boolean) => {
    setDesign({ ...design, [key]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, propKey: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDesign({ ...design, [propKey]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addExtraField = () => setExtraFields([...extraFields, { id: Date.now().toString(), label: "حقل جديد", value: "" }]);
  const removeExtraField = (id: string) => setExtraFields(extraFields.filter(f => f.id !== id));
  const updateExtraField = (id: string, key: "label" | "value", val: string) => setExtraFields(extraFields.map(f => f.id === id ? { ...f, [key]: val } : f));

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50" dir="rtl">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold">جاري التحقق من الحساب...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f1f5f9" }}>
      {/* ===== Disclaimer Modal ===== */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: "#16a34a" }}></div>
              <button onClick={() => setShowDisclaimer(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              <ShieldAlert className="w-16 h-16 mx-auto mb-4" style={{ color: "#16a34a" }} />
              <h2 className="text-2xl font-bold mb-4 text-gray-800">إخلاء مسؤولية والتزام</h2>
              <div className="text-gray-600 mb-6 leading-relaxed text-sm text-right space-y-3">
                <p>• "منصة خبرات" هي أداة إلكترونية عامة لتصميم قوالب الشهادات فقط ولا تمثل أي جهة رسمية حكومية أو خاصة.</p>
                <p>• أنت بصفتك المستخدم تقر بأنك المسؤول الأول والأخير قانونياً وأخلاقياً أمام الجهات المختصة عن صحة جميع البيانات المدخلة.</p>
                <p>• إدارة المنصة تُخلي مسؤوليتها الكاملة عن أي تزوير أو تلاعب في المعلومات أو إساءة استخدام للأداة.</p>
                <p>• أي استخدام غير قانوني أو مخالف للأنظمة يتحمله المستخدم وحده أمام الجهات الرسمية.</p>
              </div>
              <label className="flex items-start gap-3 p-4 rounded-xl cursor-pointer border border-gray-200 text-right" style={{ backgroundColor: "#f0fdf4" }}>
                <input type="checkbox" className="mt-1 w-5 h-5 rounded cursor-pointer accent-green-600" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span className="text-sm font-medium text-gray-700">أقر وأوافق على جميع الشروط والأحكام وأتحمل كامل المسؤولية عن صحة البيانات.</span>
              </label>
              <button onClick={() => { if (agreed) setShowDisclaimer(false); }} disabled={!agreed}
                className="mt-6 w-full py-3 px-4 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: agreed ? "#16a34a" : "#d1d5db", cursor: agreed ? "pointer" : "not-allowed" }}>
                {agreed ? <CheckCircle2 className="w-5 h-5" /> : null}
                {agreed ? "موافق ومتابعة" : "يجب الموافقة أولاً"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Terms Modal ===== */}
      <AnimatePresence>
        {showTerms && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative overflow-hidden max-h-[80vh] overflow-y-auto">
              <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: "#16a34a" }}></div>
              <button onClick={() => setShowTerms(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6" style={{ color: "#16a34a" }} /> الشروط والأحكام
              </h2>
              <div className="text-gray-600 leading-loose text-sm text-right space-y-4">
                <h3 className="font-bold text-gray-800 text-base">1. طبيعة المنصة</h3>
                <p>منصة خبرات هي أداة إلكترونية عامة تتيح للمستخدمين تصميم وإنشاء شهادات خبرة. المنصة لا تمثل أي جهة رسمية.</p>
                <h3 className="font-bold text-gray-800 text-base">2. مسؤولية المستخدم</h3>
                <p>يتحمل المستخدم كامل المسؤولية القانونية والأخلاقية عن صحة ودقة جميع البيانات المدخلة.</p>
                <h3 className="font-bold text-gray-800 text-base">3. إخلاء المسؤولية</h3>
                <p>تُخلي إدارة منصة خبرات مسؤوليتها الكاملة عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام الأداة.</p>
                <h3 className="font-bold text-gray-800 text-base">4. الاستخدام المشروع</h3>
                <p>يلتزم المستخدم باستخدام المنصة للأغراض المشروعة فقط وبما يتوافق مع الأنظمة والقوانين المعمول بها.</p>
                <h3 className="font-bold text-gray-800 text-base">5. حقوق الملكية الفكرية</h3>
                <p>جميع حقوق التصميم والبرمجة محفوظة لمنصة خبرات.</p>
              </div>
              <button onClick={() => setShowTerms(false)} className="mt-6 w-full py-3 px-4 text-white font-bold rounded-xl" style={{ backgroundColor: "#16a34a" }}>فهمت</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Header ===== */}
      <header className="text-white py-5 shadow-lg" style={{ background: "linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%)" }}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-9 h-9" />
            <div>
              <h1 className="text-2xl font-bold">منصة خبرات</h1>
              <p className="opacity-80 text-xs">أداة احترافية لإصدار وتوثيق شهادات الخبرة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FullscreenToggle variant="light" />
            <Link href="/dashboard" className="flex items-center gap-1 text-xs py-2 px-3 rounded-lg transition-all hover:bg-white text-green-700 bg-white font-bold shadow-sm">
              <LayoutDashboard className="w-4 h-4" /> لوحة التحكم
            </Link>
            <button onClick={() => setShowTerms(true)} className="flex items-center gap-1 text-xs py-2 px-3 rounded-lg transition-all hover:bg-white/20" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
              <FileText className="w-4 h-4" /> الشروط والأحكام
            </button>
            <button onClick={() => setShowDisclaimer(true)} className="flex items-center gap-1 text-xs py-2 px-3 rounded-lg transition-all hover:bg-white/20" style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
              <ShieldAlert className="w-4 h-4" /> إخلاء المسؤولية
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ===== Sidebar Panel ===== */}
        <div className="lg:col-span-4 rounded-2xl shadow-sm overflow-hidden lg:sticky lg:top-4" style={{ border: "1px solid #e5e7eb", backgroundColor: "rgba(255,255,255,0.95)", minHeight: "85vh" }}>
          <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab("data")}
              className="flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{ borderBottom: activeTab === "data" ? "3px solid #16a34a" : "3px solid transparent", color: activeTab === "data" ? "#16a34a" : "#6b7280" }}>
              📝 البيانات
            </button>
            <button onClick={() => setActiveTab("design")}
              className="flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{ borderBottom: activeTab === "design" ? "3px solid #16a34a" : "3px solid transparent", color: activeTab === "design" ? "#16a34a" : "#6b7280" }}>
              <Palette className="w-4 h-4" /> التخصيص
            </button>
          </div>

          <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(85vh - 50px)" }}>
            {activeTab === "data" && (
              <DataForm 
                formData={formData} 
                handleInputChange={handleInputChange} 
                extraFields={extraFields} 
                addExtraField={addExtraField} 
                removeExtraField={removeExtraField} 
                updateExtraField={updateExtraField} 
                handleImageUpload={handleImageUpload} 
              />
            )}
            
            {activeTab === "design" && (
              <DesignSettingsForm 
                design={design} 
                handleDesignChange={handleDesignChange} 
                handleImageUpload={handleImageUpload} 
              />
            )}

            <ActionButtons 
              isAuthenticated={isAuthenticated}
              isAuthenticating={isAuthenticating}
              isBulking={isBulking}
              isGenerating={isGenerating}
              certId={certId}
              agreed={agreed}
              handleAuthenticate={() => triggerAuth(agreed, setShowDisclaimer)}
              handleBulkUpload={(e) => triggerBulkUpload(e.target.files?.[0], agreed, () => {
                if (e.target) e.target.value = '';
              })}
              handleGenerate={(type) => triggerGenerate(type, agreed, setShowDisclaimer)}
            />
          </div>
        </div>

        {/* ===== Preview Panel ===== */}
        <div className="lg:col-span-8 flex items-center justify-center relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto min-h-[85vh] p-8">
          <CertificatePreview 
            certRef={certRef}
            design={design}
            formData={formData}
            extraFields={extraFields}
            isAuthenticated={isAuthenticated}
            certId={certId}
            origin={origin}
          />
        </div>
      </main>
      
      {/* ===== Footer ===== */}
      <footer className="mt-16 relative overflow-hidden shrink-0" style={{ background: "linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%)" }}>
        <div style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "20px 20px", position: "absolute", inset: 0, pointerEvents: "none" }}></div>
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-bold">منصة خبرات</h3>
                <p className="text-xs opacity-70">أداة احترافية لإصدار وتوثيق شهادات الخبرة</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowTerms(true)} className="text-sm text-white/80 hover:text-white transition-all hover:underline">الشروط والأحكام</button>
              <span className="text-white/30">|</span>
              <button onClick={() => setShowDisclaimer(true)} className="text-sm text-white/80 hover:text-white transition-all hover:underline">إخلاء المسؤولية</button>
            </div>
          </div>
          <div className="mt-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
            <p className="text-sm text-white/70">&copy; {new Date().getFullYear()} منصة خبرات - جميع الحقوق محفوظة.</p>
            <p className="text-sm text-white/70">تم التطوير بواسطة <span className="font-bold text-white">عبدالإله هاني بلخي</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
