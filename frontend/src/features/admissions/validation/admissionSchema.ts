import { z } from "zod";

const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const MIN_AGE_YEARS = 3;

function hasMinAge(dobValue: string): boolean {
  const dob = new Date(dobValue);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= MIN_AGE_YEARS;
}

export const admissionSchema = z
  .object({
    student_name: z
      .string()
      .trim()
      .min(2, "Student name must be at least 2 characters")
      .max(120, "Student name must be 120 characters or less")
      .regex(/^[a-zA-Z .'-]+$/, "Student name contains invalid characters"),
    dob: z
      .string()
      .min(1, "Date of birth is required")
      .refine((value) => !Number.isNaN(new Date(value).getTime()), "Date of birth is invalid")
      .refine((value) => new Date(value) <= new Date(), "Date of birth cannot be in the future")
      .refine((value) => hasMinAge(value), `Student must be at least ${MIN_AGE_YEARS} years old`),
    gender: z.string().min(1, "Gender is required"),
    parent_name: z
      .string()
      .trim()
      .min(2, "Parent or guardian name must be at least 2 characters")
      .max(120, "Parent or guardian name must be 120 characters or less"),
    address: z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters")
      .max(240, "Address must be 240 characters or less"),
    transfer_student: z.boolean(),
    previous_school: z.string().trim().max(120, "Previous school must be 120 characters or less"),
    grade_applying_for: z.string().min(1, "Grade applying for is required"),
    contact_number: z
      .string()
      .trim()
      .min(7, "Contact number is too short")
      .max(20, "Contact number is too long")
      .regex(/^[+0-9()\-\s]+$/, "Contact number format is invalid"),
    email: z.string().trim().email("Email format is invalid"),
    fee_total: z.coerce.number().min(0, "Total fee must be zero or more"),
    fee_paid: z.coerce.number().min(0, "Paid fee must be zero or more"),
    fee_pending: z.coerce.number().min(0, "Pending fee must be zero or more"),
    document: z
      .custom<FileList | undefined>((value) => value === undefined || value instanceof FileList)
      .optional()
      .refine((fileList) => !fileList || fileList.length <= 1, "Only one document can be uploaded")
      .refine(
        (fileList) => !fileList || fileList.length === 0 || ALLOWED_DOCUMENT_TYPES.includes(fileList[0].type),
        "Document must be a PDF, PNG, or JPEG file",
      )
      .refine(
        (fileList) => !fileList || fileList.length === 0 || fileList[0].size <= MAX_DOCUMENT_BYTES,
        "Document size must be 5MB or less",
      ),
  })
  .superRefine((values, ctx) => {
    if (values.transfer_student && !values.previous_school) {
      ctx.addIssue({
        code: "custom",
        message: "Previous school is required for transfer students",
        path: ["previous_school"],
      });
    }

    const needsDocument = values.transfer_student || values.grade_applying_for.toLowerCase().startsWith("grade");
    const hasDocument = values.document && values.document.length > 0;
    if (needsDocument && !hasDocument) {
      ctx.addIssue({
        code: "custom",
        message: "Supporting document is required for this application",
        path: ["document"],
      });
    }

    if (values.fee_paid > values.fee_total) {
      ctx.addIssue({
        code: "custom",
        message: "Paid fee cannot exceed total fee",
        path: ["fee_paid"],
      });
    }

    const expectedPending = Number((values.fee_total - values.fee_paid).toFixed(2));
    if (Math.abs(values.fee_pending - expectedPending) > 0.01) {
      ctx.addIssue({
        code: "custom",
        message: "Pending fee must equal Total fee minus Paid fee",
        path: ["fee_pending"],
      });
    }
  });

export type AdmissionFormSchemaInput = z.input<typeof admissionSchema>;
export type AdmissionFormSchemaValues = z.output<typeof admissionSchema>;
