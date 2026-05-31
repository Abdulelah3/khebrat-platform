"use client";

import React, { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Image as ImageIcon, ShieldAlert, CheckCircle2, Building2, User, Briefcase, Calendar, X, FileText, Palette, Type, Layout, Eye, EyeOff, Plus, Trash2, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TabType = "data" | "design";

interface ExtraField {
  id: string;
  label: string;
  value: string;
}

export default function Home() {
  const [agreed, setAgreed] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("data");
  
  // Form Data
  const [formData, setFormData] = useState({
    companyName: "",
    employeeName: "",
    employeeId: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    issueDate: "",
    managerName: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [certId, setCertId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [origin, setOrigin] = useState("https://khebrat.vercel.app");
  
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoadingAuth(false);
      if (!u) {
        router.push("/auth");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setOrigin(window.location.origin);
    // Load from LocalStorage
    const savedDesign = localStorage.getItem("khebrat_design");
    const savedFormData = localStorage.getItem("khebrat_formData");
    const savedExtraFields = localStorage.getItem("khebrat_extraFields");
    
    if (savedDesign) setDesign(JSON.parse(savedDesign));
    if (savedFormData) setFormData(JSON.parse(savedFormData));
    if (savedExtraFields) setExtraFields(JSON.parse(savedExtraFields));
  }, []);

  // Design Customization
  const [design, setDesign] = useState({
    // Colors
    bgColor: "#ffffff",
    borderColor: "#16a34a",
    innerBorderColor: "#bbf7d0",
    titleColor: "#15803d",
    textColor: "#374151",
    strongColor: "#111827",
    subtitleColor: "#6b7280",
    // Fonts
    titleFontSize: 32,
    bodyFontSize: 15,
    headerFontSize: 22,
    // Title
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
    // Visibility
    showBorder: true,
    showInnerBorder: true,
    showPattern: true,
    showQR: true,
    showSeal: true,
    showLogo: true,
    showManagerSection: true,
    // Seal
    sealText: "مُعتمد",
    sealSubText: "منصة خبرات",
    sealColor: "#16a34a",
    sealImage: "", // Base64 image
    logoImage: "", // Base64 image
    // QR
    qrColor: "#15803d",
    qrSize: 70,
    // Padding
    certPadding: 50,
    // Border
    borderWidth: 2,
    // Line height
    lineHeight: 2.2,
  });

  // Save to LocalStorage whenever they change
  useEffect(() => {
    if (!loadingAuth) localStorage.setItem("khebrat_design", JSON.stringify(design));
  }, [design, loadingAuth]);

  useEffect(() => {
    if (!loadingAuth) localStorage.setItem("khebrat_formData", JSON.stringify(formData));
  }, [formData, loadingAuth]);

  useEffect(() => {
    if (!loadingAuth) localStorage.setItem("khebrat_extraFields", JSON.stringify(extraFields));
  }, [extraFields, loadingAuth]);

  const certRef = useRef<HTMLDivElement>(null);

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



  const addExtraField = () => {
    setExtraFields([...extraFields, { id: Date.now().toString(), label: "حقل جديد", value: "" }]);
  };

  const removeExtraField = (id: string) => {
    setExtraFields(extraFields.filter(f => f.id !== id));
  };

  const updateExtraField = (id: string, key: "label" | "value", val: string) => {
    setExtraFields(extraFields.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  const generateCertId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'KH-';
    for (let i = 0; i < 8; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
    return id;
  };

  const handleAuthenticate = async () => {
    if (!agreed) {
      setShowDisclaimer(true);
      return;
    }
    if (!formData.employeeName || !formData.jobTitle) {
      alert("الرجاء تعبئة الاسم والمسمى الوظيفي على الأقل لتتمكن من التوثيق.");
      return;
    }
    setIsAuthenticating(true);
    try {
      const newCertId = generateCertId();
      await addDoc(collection(db, "certificates"), {
        ...formData,
        companyName: formData.companyName || user?.companyName || "الشركة",
        certId: newCertId,
        uid: user.uid,
        createdAt: serverTimestamp(),
        status: "active",
        design: design,
        extraFields: extraFields
      });
      setCertId(newCertId);
      setIsAuthenticated(true);
      alert(`تم توثيق الشهادة وحفظها بقاعدة البيانات بنجاح!\nرقم الاعتماد: ${newCertId}`);
    } catch (e) {
      console.error("Firebase save error:", e);
      alert("فشل توثيق الشهادة، تأكد من إعدادات قاعدة البيانات في Firebase.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGenerate = async (type: 'pdf' | 'image') => {
    if (!agreed) {
      setShowDisclaimer(true);
      return;
    }
    if (!formData.employeeName || !formData.jobTitle) {
      alert("الرجاء تعبئة الاسم والمسمى الوظيفي على الأقل.");
      return;
    }

    setIsGenerating(true);

    try {
      if (!certRef.current) { setIsGenerating(false); return; }

      const dataUrl = await toPng(certRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: design.bgColor
      });
      
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
      alert("حدث خطأ أثناء توليد الشهادة. حاول مرة أخرى.");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "____/____/________";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  };

  // Color input helper
  const ColorInput = ({ label, value, propKey }: { label: string; value: string; propKey: string }) => (
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs text-gray-600">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => handleDesignChange(propKey, e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
        <input type="text" value={value} onChange={(e) => handleDesignChange(propKey, e.target.value)} className="w-20 text-xs px-2 py-1 border border-gray-300 rounded text-center font-mono" />
      </div>
    </div>
  );

  // Range input helper
  const RangeInput = ({ label, value, propKey, min, max, unit }: { label: string; value: number; propKey: string; min: number; max: number; unit?: string }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-gray-600">{label}</label>
        <span className="text-xs font-bold text-gray-800">{value}{unit || "px"}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => handleDesignChange(propKey, Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-green-600" />
    </div>
  );

  // Toggle helper
  const ToggleSwitch = ({ label, value, propKey, icon }: { label: string; value: boolean; propKey: string; icon?: React.ReactNode }) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-gray-700">{label}</span>
      </div>
      <button
        onClick={() => handleDesignChange(propKey, !value)}
        className="relative w-10 h-5 rounded-full transition-colors"
        style={{ backgroundColor: value ? "#16a34a" : "#d1d5db" }}
      >
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ left: value ? "22px" : "2px" }}></span>
      </button>
    </div>
  );

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50" dir="rtl">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold">جاري التحقق من الحساب...</p>
      </div>
    );
  }

  if (!user) return null; // Will redirect

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
          
          {/* Tabs */}
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
            
            {/* ===== DATA TAB ===== */}
            {activeTab === "data" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">شعار الجهة (اختياري)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "logoImage")} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:cursor-pointer cursor-pointer file:bg-green-600 file:text-white hover:file:bg-green-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم الجهة / الشركة</label>
                  <div className="relative">
                    <Building2 className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="مثال: شركة هوليداي إن" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم الموظف الثلاثي</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
                    <input type="text" name="employeeName" value={formData.employeeName} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="الاسم كاملاً" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية / الإقامة</label>
                  <input type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="1000000000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي</label>
                  <div className="relative">
                    <Briefcase className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
                    <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="مثال: موظف استقبال" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التحرير (الإصدار)</label>
                  <input type="date" name="issueDate" value={formData.issueDate} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المدير أو المصدر</label>
                  <input type="text" name="managerName" value={formData.managerName} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="اسم مدير الموارد البشرية (اختياري)" />
                </div>

                {/* Extra Fields */}
                {extraFields.map(field => (
                  <div key={field.id} className="p-3 rounded-lg border border-dashed border-gray-300" style={{ backgroundColor: "#f9fafb" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="text" value={field.label} onChange={(e) => updateExtraField(field.id, "label", e.target.value)} className="flex-1 text-sm font-medium px-2 py-1 border border-gray-300 rounded" placeholder="اسم الحقل" />
                      <button onClick={() => removeExtraField(field.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <input type="text" value={field.value} onChange={(e) => updateExtraField(field.id, "value", e.target.value)} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg" placeholder="القيمة" />
                  </div>
                ))}
                <button onClick={addExtraField} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-green-500 hover:text-green-600 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> إضافة حقل جديد
                </button>
              </div>
            )}

            {/* ===== DESIGN TAB ===== */}
            {activeTab === "design" && (
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
            )}

            {/* ===== Action Buttons (Always visible) ===== */}
            <div className="pt-5 mt-5 border-t border-gray-200 space-y-3">
              <button onClick={handleAuthenticate} disabled={isAuthenticating || isAuthenticated}
                className={`w-full font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${isAuthenticated ? 'bg-green-50 text-green-700 cursor-not-allowed border-2 border-green-200' : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 hover:shadow-lg'}`}
                style={isAuthenticated ? {} : { border: "2px solid #eab308" }}>
                {isAuthenticating ? <span className="animate-pulse">جاري التوثيق...</span> : isAuthenticated ? <><CheckCircle2 className="w-5 h-5" /> تم توثيق الشهادة بنجاح ({certId})</> : <><ShieldAlert className="w-5 h-5" /> توثيق الشهادة رسمياً</>}
              </button>

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
          </div>
        </div>

        {/* ===== Certificate Preview ===== */}
        <div className="lg:col-span-8 flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold text-gray-700 self-start">👁️ معاينة مباشرة</h2>
          <div className="w-full overflow-auto rounded-2xl shadow-inner p-6" style={{ backgroundColor: "#e2e8f0" }}>
            <div className="flex justify-center">
              <div ref={certRef} style={{
                width: "800px", minHeight: "580px", backgroundColor: design.bgColor,
                position: "relative", overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)", borderRadius: "4px",
                padding: `${design.certPadding}px`, direction: "rtl"
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
                    {/* QR Code removed from here, moved to footer */}
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
                        {isAuthenticated ? (
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
            </div>
          </div>
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
