export interface AdmissionRecord {
  id: number;
  application_number: string;
  student_name: string;
  class_name?: string | null;
  email?: string | null;
  contact_number?: string | null;
  reviewer_name?: string | null;
  notes_json?: string;
  created_at?: string;
  status: string;
}

export interface AdmissionNote {
  author: string;
  note: string;
  timestamp: string;
}

export interface AdmissionFormValues {
  student_name: string;
  dob: string;
  gender: string;
  parent_name: string;
  address: string;
  transfer_student: boolean;
  previous_school: string;
  grade_applying_for: string;
  contact_number: string;
  email: string;
  document?: FileList;
}

export const ADMISSION_STATUS_OPTIONS = ["all", "pending", "accepted", "rejected"] as const;

export type AdmissionStatusOption = (typeof ADMISSION_STATUS_OPTIONS)[number];

export interface AdmissionManagementFilters {
  search: string;
  status: AdmissionStatusOption;
  className: string;
  fromDate: string;
  toDate: string;
}
