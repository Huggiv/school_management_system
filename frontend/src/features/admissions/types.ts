export interface AdmissionRecord {
  id: number;
  application_number: string;
  student_name: string;
  status: string;
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
