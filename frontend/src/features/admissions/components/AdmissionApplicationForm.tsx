import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateAdmission } from "@/features/admissions/hooks/useCreateAdmission";
import {
  admissionSchema,
  type AdmissionFormSchemaInput,
  type AdmissionFormSchemaValues,
} from "@/features/admissions/validation/admissionSchema";
import { mapApiError } from "@/lib/api/client";

function formatPhoneInput(value: string): string {
  const raw = value.replace(/[^\d+]/g, "").slice(0, 15);
  return raw;
}

function formatIndianCurrencyInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!cleaned) {
    return "";
  }

  const [integerPartRaw, decimalPartRaw = ""] = cleaned.split(".");
  const integerPart = integerPartRaw.replace(/^0+(?=\d)/, "") || "0";
  const lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);
  const formattedInt = otherNumbers ? `${otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}` : lastThree;
  const formattedDecimal = decimalPartRaw ? `.${decimalPartRaw.slice(0, 2)}` : "";
  return `${formattedInt}${formattedDecimal}`;
}

function formatCurrencyForReview(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function AdmissionApplicationForm() {
  const summaryId = useId();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const createAdmission = useCreateAdmission();
  const [reviewValues, setReviewValues] = useState<AdmissionFormSchemaValues | null>(null);

  const {
    register,
    watch,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<AdmissionFormSchemaInput, unknown, AdmissionFormSchemaValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      student_name: "",
      dob: "",
      gender: "",
      parent_name: "",
      address: "",
      transfer_student: false,
      previous_school: "",
      grade_applying_for: "",
      contact_number: "",
      email: "",
      fee_total: "0",
      fee_paid: "0",
      fee_pending: "0",
    },
  });

  const transferStudent = watch("transfer_student");

  function printReview(values: AdmissionFormSchemaValues): void {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      return;
    }
    popup.document.write(`
      <html>
        <head>
          <title>Admission Application Review</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; }
            h1 { margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #d0d0d0; padding: 8px; text-align: left; }
            th { width: 35%; background: #f3f7ff; }
          </style>
        </head>
        <body>
          <h1>Admission Application Review</h1>
          <table>
            <tr><th>Student Name</th><td>${values.student_name}</td></tr>
            <tr><th>Date of Birth</th><td>${values.dob}</td></tr>
            <tr><th>Gender</th><td>${values.gender}</td></tr>
            <tr><th>Parent/Guardian</th><td>${values.parent_name}</td></tr>
            <tr><th>Address</th><td>${values.address}</td></tr>
            <tr><th>Grade</th><td>${values.grade_applying_for}</td></tr>
            <tr><th>Contact</th><td>${values.contact_number}</td></tr>
            <tr><th>Email</th><td>${values.email}</td></tr>
            <tr><th>Total Fee</th><td>Rs. ${formatCurrencyForReview(values.fee_total)}</td></tr>
            <tr><th>Paid Fee</th><td>Rs. ${formatCurrencyForReview(values.fee_paid)}</td></tr>
            <tr><th>Pending Fee</th><td>Rs. ${formatCurrencyForReview(values.fee_pending)}</td></tr>
            <tr><th>Transfer Student</th><td>${values.transfer_student ? "Yes" : "No"}</td></tr>
            <tr><th>Previous School</th><td>${values.previous_school || "-"}</td></tr>
            <tr><th>Supporting Documents</th><td>${values.document?.length ?? 0} file(s)</td></tr>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  useEffect(() => {
    if (Object.keys(errors).length > 0 && isSubmitted) {
      errorSummaryRef.current?.focus();
    }
  }, [errors, isSubmitted]);

  return (
    <form
      aria-describedby={Object.keys(errors).length ? summaryId : undefined}
      className="form-grid"
      onSubmit={handleSubmit((values) => {
        setReviewValues(values);
      })}
    >
      {createAdmission.isSuccess ? (
        <div className="form-success-summary" role="status" aria-live="polite">
          <strong>Application submitted successfully.</strong>
        </div>
      ) : null}

      {createAdmission.isError ? (
        <div className="form-error-summary" role="alert">
          <strong>Submission failed.</strong> {mapApiError(createAdmission.error).message}
        </div>
      ) : null}

      {Object.keys(errors).length > 0 && (
        <div
          ref={errorSummaryRef}
          id={summaryId}
          className="form-error-summary"
          role="alert"
          tabIndex={-1}
        >
          <strong>Please correct the highlighted fields.</strong>
        </div>
      )}

      <label className="field-wrap" htmlFor="student_name">
        <span>Student Name</span>
        <input
          id="student_name"
          aria-invalid={Boolean(errors.student_name)}
          aria-describedby={errors.student_name ? "student_name_error" : undefined}
          {...register("student_name")}
          placeholder="Student Name"
        />
        {errors.student_name && (
          <small id="student_name_error" className="field-error">
            {errors.student_name.message}
          </small>
        )}
      </label>

      <label className="field-wrap" htmlFor="dob">
        <span>Date of Birth</span>
        <input
          id="dob"
          type="date"
          aria-invalid={Boolean(errors.dob)}
          aria-describedby={errors.dob ? "dob_error" : undefined}
          {...register("dob")}
        />
        {errors.dob && (
          <small id="dob_error" className="field-error">
            {errors.dob.message}
          </small>
        )}
      </label>

      <label className="field-wrap" htmlFor="gender">
        <span>Gender</span>
        <select
          id="gender"
          aria-invalid={Boolean(errors.gender)}
          aria-describedby={errors.gender ? "gender_error" : undefined}
          {...register("gender")}
        >
          <option value="">Select gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        {errors.gender && (
          <small id="gender_error" className="field-error">
            {errors.gender.message}
          </small>
        )}
      </label>

      <label className="field-wrap" htmlFor="parent_name">
        <span>Parent or Guardian Name</span>
        <input
          id="parent_name"
          aria-invalid={Boolean(errors.parent_name)}
          aria-describedby={errors.parent_name ? "parent_name_error" : undefined}
          {...register("parent_name")}
          placeholder="Parent or Guardian Name"
        />
        {errors.parent_name && (
          <small id="parent_name_error" className="field-error">
            {errors.parent_name.message}
          </small>
        )}
      </label>

      <label className="field-wrap" htmlFor="address">
        <span>Address</span>
        <input
          id="address"
          aria-invalid={Boolean(errors.address)}
          aria-describedby={errors.address ? "address_error" : undefined}
          {...register("address")}
          placeholder="Address"
        />
        {errors.address && (
          <small id="address_error" className="field-error">
            {errors.address.message}
          </small>
        )}
      </label>

      <label className="field-wrap" htmlFor="grade_applying_for">
        <span>Grade Applying For</span>
        <select
          id="grade_applying_for"
          aria-invalid={Boolean(errors.grade_applying_for)}
          aria-describedby={errors.grade_applying_for ? "grade_applying_for_error" : undefined}
          {...register("grade_applying_for")}
        >
          <option value="">Select grade</option>
          <option value="nursery">Nursery</option>
          <option value="kindergarten">Kindergarten</option>
          <option value="grade_1">Grade 1</option>
          <option value="grade_2">Grade 2</option>
          <option value="grade_3">Grade 3</option>
          <option value="grade_4">Grade 4</option>
          <option value="grade_5">Grade 5</option>
          <option value="grade_6">Grade 6</option>
          <option value="grade_7">Grade 7</option>
          <option value="grade_8">Grade 8</option>
          <option value="grade_9">Grade 9</option>
          <option value="grade_10">Grade 10</option>
          <option value="grade_11">Grade 11</option>
          <option value="grade_12">Grade 12</option>
        </select>
        {errors.grade_applying_for && (
          <small id="grade_applying_for_error" className="field-error">
            {errors.grade_applying_for.message}
          </small>
        )}
      </label>

      <label className="field-wrap" htmlFor="contact_number">
        <span>Contact Number</span>
        <input
          id="contact_number"
          type="tel"
          aria-invalid={Boolean(errors.contact_number)}
          aria-describedby={errors.contact_number ? "contact_number_error" : undefined}
          {...register("contact_number", {
            onChange: (event) => {
              setValue("contact_number", formatPhoneInput(event.target.value), {
                shouldValidate: true,
              });
            },
          })}
          placeholder="+9111234567890"
        />
        {errors.contact_number && (
          <small id="contact_number_error" className="field-error">
            {errors.contact_number.message}
          </small>
        )}
      </label>

      <label className="field-wrap" htmlFor="email">
        <span>Email</span>
        <input
          id="email"
          type="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email_error" : undefined}
          {...register("email")}
          placeholder="Email"
        />
        {errors.email && (
          <small id="email_error" className="field-error">
            {errors.email.message}
          </small>
        )}
      </label>

      <label className="field-wrap" htmlFor="fee_total">
        <span>Total Fee</span>
        <input
          id="fee_total"
          type="text"
          inputMode="decimal"
          aria-invalid={Boolean(errors.fee_total)}
          aria-describedby={errors.fee_total ? "fee_total_error" : undefined}
          {...register("fee_total", {
            onBlur: (event) => {
              setValue("fee_total", formatIndianCurrencyInput(event.target.value), { shouldValidate: true });
            },
          })}
          placeholder="1,00,00,000.00"
        />
        {errors.fee_total && (
          <small id="fee_total_error" className="field-error">
            {errors.fee_total.message}
          </small>
        )}
      </label>

      <label className="field-wrap" htmlFor="fee_paid">
        <span>Paid Fee</span>
        <input
          id="fee_paid"
          type="text"
          inputMode="decimal"
          aria-invalid={Boolean(errors.fee_paid)}
          aria-describedby={errors.fee_paid ? "fee_paid_error" : undefined}
          {...register("fee_paid", {
            onBlur: (event) => {
              setValue("fee_paid", formatIndianCurrencyInput(event.target.value), { shouldValidate: true });
            },
          })}
          placeholder="1,00,00,000.00"
        />
        {errors.fee_paid && (
          <small id="fee_paid_error" className="field-error">
            {errors.fee_paid.message}
          </small>
        )}
      </label>

      <label className="field-wrap" htmlFor="fee_pending">
        <span>Pending Fee</span>
        <input
          id="fee_pending"
          type="text"
          inputMode="decimal"
          aria-invalid={Boolean(errors.fee_pending)}
          aria-describedby={errors.fee_pending ? "fee_pending_error" : undefined}
          {...register("fee_pending", {
            onBlur: (event) => {
              setValue("fee_pending", formatIndianCurrencyInput(event.target.value), { shouldValidate: true });
            },
          })}
          placeholder="1,00,00,000.00"
        />
        {errors.fee_pending && (
          <small id="fee_pending_error" className="field-error">
            {errors.fee_pending.message}
          </small>
        )}
      </label>

      <label className="field-wrap checkbox-wrap" htmlFor="transfer_student">
        <input id="transfer_student" type="checkbox" {...register("transfer_student")} />
        <span>Transfer Student</span>
      </label>

      {transferStudent && (
        <label className="field-wrap" htmlFor="previous_school">
          <span>Previous School</span>
          <input
            id="previous_school"
            aria-invalid={Boolean(errors.previous_school)}
            aria-describedby={errors.previous_school ? "previous_school_error" : undefined}
            {...register("previous_school")}
            placeholder="Previous School"
          />
          {errors.previous_school && (
            <small id="previous_school_error" className="field-error">
              {errors.previous_school.message}
            </small>
          )}
        </label>
      )}

      <label className="field-wrap" htmlFor="document">
        <span>Supporting Document (PDF, PNG, JPG)</span>
        <input
          id="document"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          aria-invalid={Boolean(errors.document)}
          aria-describedby={errors.document ? "document_error" : undefined}
          {...register("document")}
        />
        {errors.document && (
          <small id="document_error" className="field-error">
            {errors.document.message}
          </small>
        )}
      </label>

      <div className="form-submit-row">
        <button type="submit" disabled={createAdmission.isPending}>
          {createAdmission.isPending ? "Submitting..." : "Submit Application"}
        </button>
      </div>

      {reviewValues ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Review application before submit">
          <section className="panel modal-panel">
            <div className="modal-header-row">
              <h2>Review Application</h2>
              <button type="button" onClick={() => printReview(reviewValues)}>
                Print
              </button>
            </div>
            <table className="table">
              <tbody>
                <tr><th>Student Name</th><td>{reviewValues.student_name}</td></tr>
                <tr><th>Date of Birth</th><td>{reviewValues.dob}</td></tr>
                <tr><th>Gender</th><td>{reviewValues.gender}</td></tr>
                <tr><th>Parent/Guardian</th><td>{reviewValues.parent_name}</td></tr>
                <tr><th>Address</th><td>{reviewValues.address}</td></tr>
                <tr><th>Grade</th><td>{reviewValues.grade_applying_for}</td></tr>
                <tr><th>Contact</th><td>{reviewValues.contact_number}</td></tr>
                <tr><th>Email</th><td>{reviewValues.email}</td></tr>
                <tr><th>Total Fee</th><td>Rs. {formatCurrencyForReview(reviewValues.fee_total)}</td></tr>
                <tr><th>Paid Fee</th><td>Rs. {formatCurrencyForReview(reviewValues.fee_paid)}</td></tr>
                <tr><th>Pending Fee</th><td>Rs. {formatCurrencyForReview(reviewValues.fee_pending)}</td></tr>
                <tr><th>Transfer Student</th><td>{reviewValues.transfer_student ? "Yes" : "No"}</td></tr>
                <tr><th>Previous School</th><td>{reviewValues.previous_school || "-"}</td></tr>
                <tr><th>Files Selected</th><td>{reviewValues.document?.length ?? 0}</td></tr>
              </tbody>
            </table>
            <div className="toolbar">
              <button
                type="button"
                onClick={() => {
                  createAdmission.mutate(reviewValues, {
                    onSuccess: () => {
                      reset();
                      setReviewValues(null);
                    },
                  });
                }}
              >
                Confirm & Submit
              </button>
              <button type="button" onClick={() => setReviewValues(null)}>
                Back to Edit
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </form>
  );
}
