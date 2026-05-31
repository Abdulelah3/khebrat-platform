"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Lock, Mail, Building, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
      } else {
        if (!companyName.trim()) {
          throw new Error("الرجاء إدخال اسم الشركة");
        }
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          companyName: companyName,
          role: "company", // Default role
          createdAt: serverTimestamp(),
          status: "active"
        });

        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      // Simplify error messages for Arabic users
      if (err.code === "auth/invalid-credential") {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("هذا البريد الإلكتروني مسجل مسبقاً.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("حدث خطأ أثناء المصادقة. الرجاء المحاولة مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50" dir="rtl">
      <Link href="/" className="absolute top-8 right-8 flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors font-medium">
        <ArrowRight className="w-5 h-5" /> العودة للرئيسية
      </Link>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-8 text-center text-white relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px" }}></div>
          <Lock className="w-16 h-16 text-white mx-auto mb-4 relative z-10" />
          <h1 className="text-3xl font-bold relative z-10">{isLogin ? "تسجيل الدخول" : "إنشاء حساب شركة"}</h1>
          <p className="text-green-100 mt-2 relative z-10 text-sm">
            {isLogin ? "مرحباً بك مجدداً في منصة خبرات" : "انضم لمنصة خبرات وابدأ في إصدار الشهادات"}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم الجهة / الشركة</label>
                <div className="relative">
                  <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="مثال: شركة أبل"
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-left"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-left"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setError(""); }} 
                className="text-green-600 font-bold mr-2 hover:underline"
              >
                {isLogin ? "سجل كشركة جديدة" : "تسجيل الدخول"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
