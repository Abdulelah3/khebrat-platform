"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { Loader2, LogOut, BarChart3, Users, FileCheck, ShieldAlert, Trash2, Shield, Plus, Building } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  
  // Admin only states
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCerts: 0,
    activeCerts: 0,
    totalCompanies: 0
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push("/auth");
        return;
      }
      
      setUser(u);
      
      try {
        // Fetch user document
        const userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          if (data.role === "admin") {
            await loadAdminData();
          } else {
            await loadCompanyData(u.uid);
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || err.code === 'cancelled' || err.message?.includes('abort')) return;
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadCompanyData = async (uid: string) => {
    try {
      const q = query(collection(db, "certificates"), where("uid", "==", uid));
      const snapshot = await getDocs(q);
      const certs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by createdAt descending
      certs.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setCertificates(certs);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'cancelled' || err.message?.includes('abort')) return;
      console.error("Error loading company data:", err);
    }
  };

  const loadAdminData = async () => {
    try {
      // Load all certificates
      const certsSnapshot = await getDocs(collection(db, "certificates"));
      const certs = certsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      certs.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setCertificates(certs);

      // Load all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(usersList);

      // Calculate stats
      setStats({
        totalCerts: certs.length,
        activeCerts: certs.filter((c: any) => c.status === "active").length,
        totalCompanies: usersList.filter((u: any) => u.role === "company").length
      });
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'cancelled' || err.message?.includes('abort')) return;
      console.error("Error loading admin data:", err);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/auth");
  };

  const handleRevoke = async (docId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "revoked" : "active";
    const confirmMessage = newStatus === "revoked" ? "هل أنت متأكد من إبطال هذه الشهادة؟ لن تكون صالحة عند التحقق." : "هل أنت متأكد من إعادة تفعيل الشهادة؟";
    
    if (confirm(confirmMessage)) {
      try {
        await updateDoc(doc(db, "certificates", docId), {
          status: newStatus
        });
        
        // Update local state
        setCertificates(certs => certs.map(c => 
          c.id === docId ? { ...c, status: newStatus } : c
        ));
      } catch (err) {
        console.error("Error updating certificate status:", err);
        alert("حدث خطأ أثناء تعديل حالة الشهادة.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50" dir="rtl">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  const isAdmin = userData?.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-black text-green-600 tracking-tight">خـبـرات</Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <span className="text-gray-600 font-bold">
              {isAdmin ? "لوحة تحكم الإدارة" : "لوحة تحكم الشركة"}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-bold text-gray-800">{userData?.companyName || user?.email}</span>
              <span className="text-xs text-gray-500">{isAdmin ? "مدير النظام" : "حساب شركة"}</span>
            </div>
            <Link href="/" className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> إصدار شهادة جديدة
            </Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Stats */}
        {isAdmin && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <FileCheck className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">إجمالي الشهادات المصدرة</p>
                <p className="text-3xl font-black text-gray-800">{stats.totalCerts}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">الشهادات الفعالة</p>
                <p className="text-3xl font-black text-gray-800">{stats.activeCerts}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                <Building className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">الشركات المسجلة</p>
                <p className="text-3xl font-black text-gray-800">{stats.totalCompanies}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Certificates Table */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              {isAdmin ? "سجل جميع الشهادات" : "سجل الشهادات الصادرة"}
            </h2>
            <div className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold">
              الإجمالي: {certificates.length}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">رقم الاعتماد</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">اسم الموظف</th>
                  {isAdmin && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الشركة المصدرة</th>}
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">تاريخ الإصدار</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{cert.certId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-800">{cert.employeeName}</div>
                      <div className="text-xs text-gray-500">{cert.employeeId}</div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{cert.companyName}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {cert.createdAt?.toDate ? cert.createdAt.toDate().toLocaleDateString('ar-SA') : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${cert.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {cert.status === 'active' ? 'مفعلة' : 'مبطلة (ملغاة)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleRevoke(cert.id, cert.status)}
                        className={`font-bold hover:underline ${cert.status === 'active' ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {cert.status === 'active' ? 'إبطال الشهادة' : 'إعادة التفعيل'}
                      </button>
                    </td>
                  </tr>
                ))}
                
                {certificates.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                      لا يوجد شهادات مصدرة حتى الآن.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
