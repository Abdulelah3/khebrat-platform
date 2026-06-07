"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { Loader2, LogOut, ShieldCheck, Plus, AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import FullscreenToggle from "@/components/FullscreenToggle";

import { AppUser, Certificate } from "../../types";
import StatsCards from "@/components/dashboard/StatsCards";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import CertificatesTable from "@/components/dashboard/CertificatesTable";

export default function Dashboard() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  
  // Admin only states
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [stats, setStats] = useState({
    totalCerts: 0,
    activeCerts: 0,
    totalCompanies: 0
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => {}
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
      const certs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certificate));
      certs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setCertificates(certs);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'cancelled' || err.message?.includes('abort')) return;
      console.error("Error loading company data:", err);
    }
  };

  const loadAdminData = async () => {
    try {
      const certsSnapshot = await getDocs(collection(db, "certificates"));
      const certs = certsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certificate));
      certs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setCertificates(certs);

      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
      setAllUsers(usersList);

      setStats({
        totalCerts: certs.length,
        activeCerts: certs.filter(c => c.status === "active").length,
        totalCompanies: usersList.filter(u => u.role === "company" || u.role === "individual").length
      });
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'cancelled' || err.message?.includes('abort')) return;
      console.error("Error loading admin data:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const chartData = React.useMemo(() => {
    const data: Record<string, number> = {};
    certificates.forEach(cert => {
      if (!cert.createdAt) return;
      const date = new Date(cert.createdAt.toMillis());
      const month = date.toLocaleString('ar-SA', { month: 'short', year: 'numeric' });
      data[month] = (data[month] || 0) + 1;
    });
    return Object.entries(data).map(([name, count]) => ({ name, count })).reverse();
  }, [certificates]);

  const handleRevoke = (docId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "revoked" : "active";
    const isRevoking = newStatus === "revoked";
    
    setConfirmModal({
      isOpen: true,
      title: isRevoking ? "إبطال الشهادة" : "إعادة تفعيل الشهادة",
      message: isRevoking 
        ? "هل أنت متأكد من إبطال هذه الشهادة؟ لن تكون صالحة عند التحقق عبر الباركود." 
        : "هل أنت متأكد من إعادة تفعيل الشهادة؟ ستعود للظهور كشهادة معتمدة.",
      type: "warning",
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, "certificates", docId), { status: newStatus });
          setCertificates(certs => certs.map(c => c.id === docId ? { ...c, status: newStatus } : c));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error("Error updating certificate status:", err);
          toast.error("حدث خطأ أثناء تحديث حالة الشهادة.");
        }
      }
    });
  };

  const handleDelete = (docId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "حذف الشهادة نهائياً",
      message: "هل أنت متأكد من حذف هذه الشهادة نهائياً من قاعدة البيانات؟ هذا الإجراء لا يمكن التراجع عنه بأي شكل.",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "certificates", docId));
          setCertificates(certs => certs.filter(c => c.id !== docId));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error("Error deleting certificate:", err);
          toast.error("حدث خطأ أثناء حذف الشهادة.");
        }
      }
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCerts(certificates.map(c => c.id || ''));
    } else {
      setSelectedCerts([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedCerts(prev => 
      prev.includes(id) ? prev.filter(certId => certId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedCerts.length === 0) return;
    
    setConfirmModal({
      isOpen: true,
      title: "حذف الشهادات المحددة",
      message: `هل أنت متأكد من حذف ${selectedCerts.length} شهادة نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`,
      type: "danger",
      onConfirm: async () => {
        try {
          const deletePromises = selectedCerts.map(id => deleteDoc(doc(db, "certificates", id)));
          await Promise.all(deletePromises);
          
          setCertificates(certs => certs.filter(c => !selectedCerts.includes(c.id || '')));
          setSelectedCerts([]);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          toast.success("تم حذف الشهادات المحددة بنجاح");
        } catch (err) {
          console.error("Error deleting certificates:", err);
          toast.error("حدث خطأ أثناء حذف الشهادات.");
        }
      }
    });
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === certificates.length - 1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const cert1 = certificates[index];
    const cert2 = certificates[targetIndex];
    
    let time1 = cert1.createdAt?.toMillis() || Date.now();
    let time2 = cert2.createdAt?.toMillis() || Date.now();
    
    if (time1 === time2) {
      time1 += direction === 'up' ? 1000 : -1000;
    }

    try {
      const newTime1 = Timestamp.fromMillis(time2);
      const newTime2 = Timestamp.fromMillis(time1);
      
      await Promise.all([
        updateDoc(doc(db, "certificates", cert1.id || ''), { createdAt: newTime1 }),
        updateDoc(doc(db, "certificates", cert2.id || ''), { createdAt: newTime2 })
      ]);
      
      const newCerts = [...certificates];
      newCerts[index] = { ...cert1, createdAt: newTime1 };
      newCerts[targetIndex] = { ...cert2, createdAt: newTime2 };
      
      newCerts.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setCertificates(newCerts);
      toast.success("تم الترتيب بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء الترتيب");
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
  const userRoleText = userData?.role === "individual" ? "حساب أفراد" : (isAdmin ? "مدير النظام" : "حساب شركة");

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-black text-green-600 tracking-tight">خـبـرات</Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <span className="text-gray-600 font-bold">
              {isAdmin ? "لوحة تحكم الإدارة" : "لوحة التحكم"}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <FullscreenToggle variant="dark" />
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-bold text-gray-800">{userData?.companyName || user?.email}</span>
              <span className="text-xs text-gray-500">{userRoleText}</span>
            </div>
            <Link href="/verify" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <ShieldCheck className="w-4 h-4" /> صفحة التحقق
            </Link>
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
        
        {isAdmin && <StatsCards {...stats} />}

        <AnalyticsChart chartData={chartData} />

        <CertificatesTable
          isAdmin={isAdmin}
          certificates={certificates}
          selectedCerts={selectedCerts}
          handleSelectAll={handleSelectAll}
          handleSelect={handleSelect}
          handleBulkDelete={handleBulkDelete}
          handleMove={handleMove}
          handleRevoke={handleRevoke}
          handleDelete={handleDelete}
        />
      </main>

      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl border border-gray-100">
              <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${confirmModal.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                <AlertTriangle className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-gray-800 mb-3">{confirmModal.title}</h3>
              <p className="text-gray-600 font-medium leading-relaxed mb-8">{confirmModal.message}</p>

              <div className="flex gap-3">
                <button 
                  onClick={confirmModal.onConfirm}
                  className={`flex-1 font-bold py-3 px-4 rounded-xl text-white transition-colors ${confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-200' : 'bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-200'}`}
                >
                  تأكيد
                </button>
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 font-bold py-3 px-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
