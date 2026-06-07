import React from "react";
import { motion } from "framer-motion";
import { FileCheck, Shield, Building } from "lucide-react";

interface StatsCardsProps {
  totalCerts: number;
  activeCerts: number;
  totalCompanies: number;
}

export default function StatsCards({ totalCerts, activeCerts, totalCompanies }: StatsCardsProps) {
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <FileCheck className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-bold mb-1">إجمالي الشهادات المصدرة</p>
          <p className="text-3xl font-black text-gray-800">{totalCerts}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
          <Shield className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-bold mb-1">الشهادات الفعالة</p>
          <p className="text-3xl font-black text-gray-800">{activeCerts}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
          <Building className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-bold mb-1">الشركات والجهات المسجلة</p>
          <p className="text-3xl font-black text-gray-800">{totalCompanies}</p>
        </div>
      </div>
    </motion.div>
  );
}
