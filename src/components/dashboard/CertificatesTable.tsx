import React from "react";
import { motion } from "framer-motion";
import { BarChart3, ChevronDown, ChevronUp, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { Certificate } from "../../types";

interface CertificatesTableProps {
  isAdmin: boolean;
  certificates: Certificate[];
  selectedCerts: string[];
  handleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelect: (id: string) => void;
  handleBulkDelete: () => void;
  handleMove: (index: number, direction: 'up' | 'down') => void;
  handleRevoke: (docId: string, currentStatus: string) => void;
  handleDelete: (docId: string) => void;
}

export default function CertificatesTable({
  isAdmin, certificates, selectedCerts, handleSelectAll, handleSelect,
  handleBulkDelete, handleMove, handleRevoke, handleDelete
}: CertificatesTableProps) {
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-600" />
          {isAdmin ? "سجل جميع الشهادات" : "سجل الشهادات الصادرة"}
        </h2>
        <div className="flex items-center gap-4">
          {selectedCerts.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> حذف المحدد ({selectedCerts.length})
            </button>
          )}
          <div className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold">
            الإجمالي: {certificates.length}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-center">
          <thead className="bg-slate-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-10 text-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
                  checked={certificates.length > 0 && selectedCerts.length === certificates.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">رقم الاعتماد</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">اسم الموظف</th>
              {isAdmin && <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">الشركة المصدرة</th>}
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">تاريخ الإصدار</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">الحالة</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {certificates.map((cert) => (
              <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
                    checked={selectedCerts.includes(cert.id || '')}
                    onChange={() => handleSelect(cert.id || '')}
                  />
                </td>
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
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex flex-col gap-1 ml-2">
                      <button 
                        onClick={() => handleMove(certificates.indexOf(cert), 'up')}
                        disabled={certificates.indexOf(cert) === 0}
                        className="text-gray-400 hover:text-green-600 disabled:opacity-30 transition-colors"
                        title="تحريك لأعلى"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleMove(certificates.indexOf(cert), 'down')}
                        disabled={certificates.indexOf(cert) === certificates.length - 1}
                        className="text-gray-400 hover:text-green-600 disabled:opacity-30 transition-colors"
                        title="تحريك لأسفل"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleRevoke(cert.id || '', cert.status)}
                      className={`font-bold hover:underline ml-2 ${cert.status === 'active' ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {cert.status === 'active' ? 'إبطال الشهادة' : 'إعادة التفعيل'}
                    </button>
                    <Link 
                      href={`/certificate/${cert.certId}`}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="معاينة الشهادة"
                      target="_blank"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(cert.id || '')}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="حذف نهائي"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {certificates.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                  لا يوجد شهادات مصدرة حتى الآن.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
