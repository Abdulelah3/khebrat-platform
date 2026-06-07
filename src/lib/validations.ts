import { z } from "zod";

export const CertificateFormSchema = z.object({
  companyName: z.string().optional(),
  employeeName: z.string().min(2, "الاسم يجب أن يحتوي على الأقل حرفين"),
  employeeEmail: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal("")),
  employeeId: z.string().optional(),
  jobTitle: z.string().min(2, "المسمى الوظيفي مطلوب"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  issueDate: z.string().optional(),
  managerName: z.string().optional(),
});

export type CertificateFormValues = z.infer<typeof CertificateFormSchema>;
