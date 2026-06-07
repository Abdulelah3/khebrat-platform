import React from "react";
import { Building2, User, Mail, Briefcase, Plus, Trash2 } from "lucide-react";
import { ExtraField, FormData } from "../../types";

interface DataFormProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  extraFields: ExtraField[];
  addExtraField: () => void;
  removeExtraField: (id: string) => void;
  updateExtraField: (id: string, key: "label" | "value", val: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, propKey: string) => void;
}

export function DataForm({
  formData,
  handleInputChange,
  extraFields,
  addExtraField,
  removeExtraField,
  updateExtraField,
  handleImageUpload
}: DataFormProps) {
  return (
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
        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني (اختياري)</label>
        <div className="relative">
          <Mail className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
          <input type="email" name="employeeEmail" value={formData.employeeEmail} onChange={handleInputChange} className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="employee@example.com" />
        </div>
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
  );
}
