import React from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsChartProps {
  chartData: { name: string; count: number }[];
}

export default function AnalyticsChart({ chartData }: AnalyticsChartProps) {
  if (chartData.length === 0) return null;

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-green-600" />
        إحصائيات إصدار الشهادات
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} name="الشهادات الصادرة" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
