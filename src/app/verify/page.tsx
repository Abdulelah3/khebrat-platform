"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CheckCircle2, XCircle, ShieldAlert, Calendar, User, Building2, Briefcase, Loader2, ArrowRight, Search, Check, FileCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function VerifyContent() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");
  
  const [loading, setLoading] = useState(!!urlId);
  const [certData, setCertData] = useState<any>(null);
  const [error, setError] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!urlId) return;
    
    const verifyCertificate = async () => {
      try {
        const q = query(collection(db, "certificates"), where("certId", "==", urlId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError(true);
        } else {
          setCertData(querySnapshot.docs[0].data());
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [urlId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setError(false);
    setCertData(null);
    
    try {
      let q = query(collection(db, "certificates"), where("certId", "==", searchQuery.trim()));
      let querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        q = query(collection(db, "certificates"), where("employeeId", "==", searchQuery.trim()));
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty) {
        setError(true);
      } else {
        setCertData(querySnapshot.docs[0].data());
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(true);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900" dir="rtl">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }} className="relative">
          <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20"></div>
          <div className="w-24 h-24 bg-slate-800 rounded-3xl border border-slate-700 flex items-center justify-center relative z-10 shadow-2xl">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
          </div>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl font-bold text-slate-200 mt-8">جاري مطابقة السجلات...</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-slate-400 mt-2 text-sm">الاتصال بقاعدة البيانات الآمنة</motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden" dir="rtl">
        <div className="absolute top-0 inset-x-0 h-1 bg-red-500"></div>
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white rounded-[2rem] shadow-2xl shadow-red-900/5 p-8 max-w-md w-full text-center border border-red-100 relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-500" />
          </motion.div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">السجل غير متطابق</h1>
          <p className="text-gray-500 mb-8 leading-relaxed font-medium">
            لم نتمكن من العثور على أي شهادة موثقة بهذا الرقم في سجلاتنا. قد يكون الرقم خاطئاً أو أن الشهادة مزورة.
          </p>
          <div className="space-y-3">
            <button onClick={() => { setError(false); setSearchQuery(""); }} className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3.5 rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5">
              <Search className="w-5 h-5" /> محاولة بحث أخرى
            </button>
            <Link href="/" className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-600 py-3.5 rounded-xl hover:bg-slate-200 transition-colors font-bold">
              العودة للمنصة <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!certData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 relative" dir="rtl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <Link href="/" className="absolute top-8 right-8 flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors font-bold bg-white/50 backdrop-blur px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <ArrowRight className="w-4 h-4" /> العودة للرئيسية
        </Link>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 max-w-md w-full p-8 border border-white relative z-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-100 text-green-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-200/50">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">التحقق الآمن</h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">أدخل رقم الاعتماد أو الهوية الوطنية للتحقق من السجلات الرسمية لمنصة خبرات.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-green-500 transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="KH-XYZ123 أو رقم الهوية"
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all font-mono text-lg text-slate-800 placeholder:font-sans placeholder:text-sm"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={searchLoading || !searchQuery.trim()}
              className="w-full bg-slate-900 text-white font-bold py-4 px-4 rounded-2xl hover:bg-green-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:bg-slate-900 shadow-xl shadow-slate-900/10 hover:shadow-green-600/20 hover:-translate-y-1"
            >
              {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              {searchLoading ? "جاري مطابقة السجلات..." : "تحقق الآن"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const issueDate = certData.createdAt?.toDate ? certData.createdAt.toDate().toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' }) : "تاريخ غير متوفر";
  const isRevoked = certData.status === 'revoked';

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-slate-50 relative overflow-hidden" dir="rtl">
      
      {/* Background glowing effects */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none ${isRevoked ? 'bg-red-500' : 'bg-green-500'}`}></div>

      <div className="self-start md:absolute md:top-8 md:right-8 flex flex-wrap items-center gap-3 z-20 mb-8 md:mb-0">
        <button onClick={() => setCertData(null)} className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors font-bold bg-white shadow-sm px-5 py-2.5 rounded-full border border-slate-200">
          <Search className="w-4 h-4" /> بحث جديد
        </button>
        <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors font-bold bg-white shadow-sm px-5 py-2.5 rounded-full border border-slate-200">
          <ArrowRight className="w-4 h-4" /> المنصة
        </Link>
      </div>

      <motion.div initial={{ y: 40, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="w-full max-w-md relative z-10 mt-4 md:mt-10">
        
        {/* The Digital ID Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200/50 backdrop-blur-xl">
          
          {/* Card Header (Status) */}
          <div className={`p-8 text-center relative overflow-hidden ${isRevoked ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-emerald-500 to-green-600'}`}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
              {isRevoked ? <XCircle className="w-10 h-10 text-white" /> : <CheckCircle2 className="w-10 h-10 text-white" />}
            </motion.div>
            
            <h1 className="text-2xl font-black text-white relative z-10 tracking-tight drop-shadow-md">
              {isRevoked ? 'شهادة مُبطلة' : 'سجل موثق رسمياً'}
            </h1>
            <div className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold relative z-10 backdrop-blur-md border ${isRevoked ? 'bg-red-900/30 text-red-100 border-red-400/30' : 'bg-green-900/30 text-green-100 border-green-400/30'}`}>
              {isRevoked ? 'غير صالحة للاستخدام' : 'حالة الاعتماد: نشطة'}
            </div>
          </div>

          {/* Card Body (Details) */}
          <div className="p-8 pb-6">
            <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">رقم الاعتماد (ID)</span>
                <span className="font-mono text-lg font-bold text-slate-800 tracking-wider">{certData.certId}</span>
              </div>
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative pr-4">
                <div className="absolute right-0 top-1.5 w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <p className="text-xs text-slate-400 font-bold mb-1">الاسم الكامل للمستفيد</p>
                <p className="text-xl font-black text-slate-800">{certData.employeeName}</p>
                {certData.employeeId && <p className="text-sm font-mono text-slate-500 mt-1">{certData.employeeId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-slate-400"><Building2 className="w-3.5 h-3.5" /><span className="text-[10px] font-bold uppercase">الجهة المصدرة</span></div>
                  <p className="font-bold text-slate-800">{certData.companyName || "خبرات"}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-slate-400"><Briefcase className="w-3.5 h-3.5" /><span className="text-[10px] font-bold uppercase">المسمى الوظيفي</span></div>
                  <p className="font-bold text-slate-800">{certData.jobTitle}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-1 text-slate-400"><Calendar className="w-3.5 h-3.5" /><span className="text-[10px] font-bold uppercase">تاريخ الاعتماد</span></div>
                <p className="font-bold text-slate-800">{issueDate}</p>
              </div>
            </div>
          </div>
          
          {/* Card Footer */}
          <div className="bg-slate-50 px-8 py-5 flex items-center gap-3 border-t border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              هذه الوثيقة الرقمية مسجلة ومحفوظة بآلية التشفير. أي كشط أو تعديل ورقي يعتبر لاغياً أمام هذا السجل الرقمي المعتمد.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900"></div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
