"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CheckCircle2, XCircle, ShieldAlert, Calendar, User, Building2, Briefcase, Loader2, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
      // Try searching by certId first
      let q = query(collection(db, "certificates"), where("certId", "==", searchQuery.trim()));
      let querySnapshot = await getDocs(q);
      
      // If not found, try searching by employeeId
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#f1f5f9" }} dir="rtl">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-700 animate-pulse">جاري التحقق من السجلات...</h2>
        <p className="text-gray-500 mt-2 text-sm">يرجى الانتظار بينما نتأكد من صحة الشهادة في قاعدة البيانات</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#f1f5f9" }} dir="rtl">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border-t-8 border-red-500">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">شهادة غير صالحة</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            عذراً، لم نتمكن من العثور على أي شهادة بهذا الرقم. تأكد من إدخال رقم الاعتماد أو الهوية بشكل صحيح.
          </p>
          <button onClick={() => { setError(false); setSearchQuery(""); }} className="inline-flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-bold mb-3">
            <Search className="w-5 h-5" /> بحث مرة أخرى
          </button>
          <Link href="/" className="inline-flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-600 py-3 rounded-xl hover:bg-gray-200 transition-colors font-bold">
            <ArrowRight className="w-5 h-5" /> العودة للمنصة الرئيسية
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!certData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#f1f5f9" }} dir="rtl">
        <Link href="/" className="absolute top-8 right-8 flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors font-medium">
          <ArrowRight className="w-5 h-5" /> العودة للرئيسية
        </Link>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">التحقق من الشهادات</h1>
            <p className="text-gray-500 text-sm">أدخل رقم الاعتماد الخاص بالشهادة أو رقم الهوية الوطنية للموظف للتحقق من صحتها.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم الاعتماد أو الهوية</label>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="مثال: KH-XYZ123 أو 1000000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={searchLoading || !searchQuery.trim()}
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {searchLoading ? "جاري البحث..." : "بحث وتحقق"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const issueDate = certData.createdAt?.toDate ? certData.createdAt.toDate().toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' }) : "تاريخ غير متوفر";

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4" style={{ backgroundColor: "#f1f5f9" }} dir="rtl">
      
      <button onClick={() => setCertData(null)} className="self-start md:absolute md:top-8 md:right-8 flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors mb-8 md:mb-0 font-medium">
        <Search className="w-5 h-5" /> بحث جديد
      </button>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100 mt-4 md:mt-10">
        
        {/* Header */}
        <div className={`p-8 text-center text-white relative overflow-hidden ${certData.status === 'revoked' ? 'bg-red-600' : 'bg-green-600'}`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px" }}></div>
          {certData.status === 'revoked' ? (
            <XCircle className="w-24 h-24 text-white mx-auto mb-4 relative z-10" />
          ) : (
            <CheckCircle2 className="w-24 h-24 text-white mx-auto mb-4 relative z-10" />
          )}
          <h1 className="text-3xl font-bold relative z-10">
            {certData.status === 'revoked' ? 'شهادة ملغاة (مبطلة)' : 'شهادة معتمدة'}
          </h1>
          <p className={`${certData.status === 'revoked' ? 'text-red-100' : 'text-green-100'} mt-2 relative z-10 opacity-90`}>
            {certData.status === 'revoked' 
              ? 'تم إلغاء أو إبطال هذه الشهادة من قبل الجهة المصدرة ولتعد غير صالحة' 
              : 'هذه الشهادة مسجلة وموثقة رسمياً في نظام خبرات'}
          </p>
        </div>

        {/* Details */}
        <div className="p-8">
          <div className="bg-green-50 text-green-800 p-4 rounded-xl text-center font-mono tracking-widest mb-8 border border-green-100 flex flex-col gap-1">
            <span className="text-xs text-green-600 font-sans font-bold">رقم الاعتماد</span>
            <span className="text-xl font-bold">{certData.certId}</span>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-gray-100 p-3 rounded-xl text-gray-500 shrink-0"><User className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-1">اسم صاحب الشهادة</p>
                <p className="text-lg font-bold text-gray-800">{certData.employeeName}</p>
                {certData.employeeId && <p className="text-sm text-gray-500 mt-1">هوية / إقامة: {certData.employeeId}</p>}
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            <div className="flex items-start gap-4">
              <div className="bg-gray-100 p-3 rounded-xl text-gray-500 shrink-0"><Building2 className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-1">جهة الإصدار (الشركة)</p>
                <p className="text-base font-bold text-gray-800">{certData.companyName || "غير محدد"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-gray-100 p-3 rounded-xl text-gray-500 shrink-0"><Briefcase className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-1">المسمى الوظيفي</p>
                <p className="text-base font-bold text-gray-800">{certData.jobTitle}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-gray-100 p-3 rounded-xl text-gray-500 shrink-0"><Calendar className="w-6 h-6" /></div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-1">تاريخ إصدار الشهادة</p>
                <p className="text-base font-bold text-gray-800">{issueDate}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-6 flex items-start gap-3 border-t border-gray-100">
          <ShieldAlert className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">
            تم إصدار هذه الشهادة والتحقق منها آلياً عبر منصة خبرات. أي كشط أو تعديل على هذه البيانات بعد طباعة الشهادة يعتبر تزويراً يعاقب عليه النظام.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: "#f1f5f9" }} dir="rtl">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <p className="text-gray-500 text-sm">جاري تحميل الصفحة...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
