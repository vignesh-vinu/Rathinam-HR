export type OrganizationId = 'RGU' | 'RTC' | 'RPHARM' | 'ALL';

export type UserRole = 'SUPER_ADMIN' | 'HR_ADMIN' | 'HR_STAFF' | 'VIEWER';

export type ApplicationStatus = 
  | 'NEW'
  | 'UNDER REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW SCHEDULED'
  | 'INTERVIEW COMPLETED'
  | 'SELECTED'
  | 'ON HOLD'
  | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: OrganizationId | null;
  avatar?: string;
}

export interface Organization {
  id: OrganizationId;
  name: string;
  code: string;
  subtitle: string;
  description: string;
  icon: string;
  badgeColor: string;
  accentColor: string;
  active: boolean;
}

export interface PersonalDetails {
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  dob: string;
  age?: number;
  gender: 'Male' | 'Female' | 'Other' | '';
  maritalStatus: 'Single' | 'Married' | 'Other' | '';
  nationality: string;
  category: string;
  photoUrl?: string;
}

export interface ContactDetails {
  address: string;
  pincode: string;
  city: string;
  state: string;
  email: string;
  phone?: string;
  mobile: string;
  altMobile?: string;
}

export interface FinancialDetails {
  currentCompany: string;
  noticePeriod: string;
  totalExperienceYears: string;
  currentSalary: string;
  expectedSalary: string;
}

export interface EducationDetail {
  id: string;
  degree: string;
  division: string;
  institution: string;
  boardUniversity: string;
  majorSubjects: string;
  yearOfPassing: string;
  percentage: string;
}

export interface ExperienceDetail {
  id: string;
  organization: string;
  designation: string;
  periodFrom: string;
  periodTo: string;
  grossAnnualSalary: string;
  ctcPerMonth: string;
  reasonForLeaving: string;
  careerBreak?: string;
}

export interface LanguageKnown {
  language: string;
  read: boolean;
  write: boolean;
  speak: boolean;
  understand: boolean;
}

export interface FamilyDetail {
  id: string;
  name: string;
  age: number | string;
  relationship: string;
  occupation: string;
  dependent: 'Yes' | 'No' | string;
  contactNo: string;
}

export interface ReferenceDetail {
  name: string;
  designation: string;
  mobile: string;
  phone?: string;
}

export interface ReferredFriend {
  name: string;
  relationship: string;
  mobile: string;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface AdditionalInfo {
  workSundays: 'Yes' | 'No' | '';
  joiningTimeRequired: string;
  litigationDetails?: string;
  rathinamAcquaintance: 'Yes' | 'No' | '';
  rathinamAcquaintanceDetails?: string;
}

export interface Application {
  id: string;
  applicationId: string;
  organizationId: OrganizationId;
  positionApplied: string;
  source: string;
  status: ApplicationStatus;
  personalDetails: PersonalDetails;
  contactDetails: ContactDetails;
  financialDetails: FinancialDetails;
  educationDetails: EducationDetail[];
  experienceDetails: ExperienceDetail[];
  certifications: string;
  languagesKnown: LanguageKnown[];
  familyDetails: FamilyDetail[];
  additionalInfo: AdditionalInfo;
  references: ReferenceDetail[];
  referredFriends: ReferredFriend[];
  documents: ApplicationDocument[];
  declarationAccepted: boolean;
  declarationDate: string;
  declarationPlace: string;
  submissionDate?: string;
  submissionTime?: string;
  submittedAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface StatusHistory {
  id: string;
  applicationId: string;
  fromStatus: string;
  toStatus: string;
  updatedBy: string;
  remarks: string;
  timestamp: string;
}

export interface HRNote {
  id: string;
  applicationId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  applicationId: string;
  applicantName: string;
  organizationId: OrganizationId;
  title: string;
  message: string;
  status: string;
  isRead: boolean;
  timestamp: string;
}

export interface AuditLogItem {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface PDFFieldMapping {
  pdfField: string;
  webFormField: string;
  category: string;
  pdfRef: string;
}
