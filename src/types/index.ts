export interface ExtraField {
  id: string;
  label: string;
  value: string;
}

export interface DesignSettings {
  bgColor: string;
  borderColor: string;
  innerBorderColor: string;
  titleColor: string;
  textColor: string;
  strongColor: string;
  subtitleColor: string;
  titleFontSize: number;
  bodyFontSize: number;
  headerFontSize: number;
  certTitle: string;
  certSubtitle: string;
  certBodyIntro: string;
  certBodyIntro2: string;
  certBodyJob: string;
  certBodyJob2: string;
  certBodyPeriod: string;
  certBodyPeriod2: string;
  certIssueDateText: string;
  certFooterText: string;
  showBorder: boolean;
  showInnerBorder: boolean;
  showPattern: boolean;
  showQR: boolean;
  showSeal: boolean;
  showLogo: boolean;
  showManagerSection: boolean;
  sealText: string;
  sealSubText: string;
  sealColor: string;
  sealImage: string;
  logoImage: string;
  qrColor: string;
  qrSize: number;
  certPadding: number;
  borderWidth: number;
  lineHeight: number;
}

export interface FormData {
  companyName: string;
  employeeName: string;
  employeeEmail: string;
  employeeId: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  managerName: string;
}

export interface Certificate extends FormData {
  id?: string;
  certId: string;
  uid: string;
  createdAt: any;
  status: "active" | "revoked";
  design: DesignSettings;
  extraFields: ExtraField[];
}

export interface AppUser {
  id?: string;
  uid?: string;
  email?: string;
  companyName?: string;
  role?: "admin" | "company" | "individual";
  fullName?: string;
  nationalId?: string;
}
