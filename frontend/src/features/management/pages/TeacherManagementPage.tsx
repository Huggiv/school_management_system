import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TablePagination } from "@/components/data/TablePagination";
import { TableQueryControls } from "@/components/data/TableQueryControls";
import { apiClient } from "@/lib/api/client";

interface TeacherRecord {
  id: number;
  user_id?: number | null;
  employee_id: string;
  department?: string | null;
  qualification?: string | null;
}

interface SubjectRecord {
  id: number;
  code: string;
  name: string;
}

interface StudentRecord {
  id: number;
  class_name: string;
  section: string;
}

interface TeacherForm {
  user_id?: number;
  employee_id: string;
  department: string;
  qualification: string;
}

interface TeacherAssignment {
  id: string;
  teacher_id: number;
  subject_id: number;
  class_name: string;
  section: string;
}

interface AssignmentForm {
  teacher_id: number;
  subject_id: number;
  class_name: string;
  section: string;
}

const ASSIGNMENTS_STORAGE_KEY = "sms.teacher.assignments.v1";

function loadAssignments(): TeacherAssignment[] {
  try {
    const raw = window.localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TeacherAssignment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAssignments(items: TeacherAssignment[]): void {
  window.localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(items));
}

export function TeacherManagementPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("-id");
  const [search, setSearch] = useState("");
  const [assignmentPage, setAssignmentPage] = useState(1);

  const { register, handleSubmit, reset } = useForm<TeacherForm>();
  const assignmentForm = useForm<AssignmentForm>();

  const { data, isLoading } = useQuery({
    queryKey: ["management-teachers", page, size, sort, search],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: TeacherRecord[]; total: number }>("/api/v1/teachers/", {
        params: { page, size, sort, search: search || undefined },
      });
      return response;
    },
  });

  const { data: subjectsData } = useQuery({
    queryKey: ["management-teacher-subject-options"],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: SubjectRecord[] }>("/api/v1/subjects/", {
        params: { page: 1, size: 100, sort: "code" },
      });
      return response.items;
    },
  });

  const { data: studentsData } = useQuery({
    queryKey: ["management-teacher-class-options"],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: StudentRecord[] }>("/api/v1/students", {
        params: { page: 1, size: 100, sort: "class_name" },
      });
      return response.items;
    },
  });

  const teachers = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const subjects = useMemo(() => subjectsData ?? [], [subjectsData]);

  const classOptions = useMemo(() => {
    const unique = new Set<string>();
    for (const row of studentsData ?? []) {
      unique.add(`${row.class_name}||${row.section}`);
    }
    return [...unique]
      .map((item) => {
        const [class_name, section] = item.split("||");
        return { class_name, section };
      })
      .sort((a, b) => `${a.class_name}-${a.section}`.localeCompare(`${b.class_name}-${b.section}`));
  }, [studentsData]);

  const [assignments, setAssignments] = useState<TeacherAssignment[]>(() => loadAssignments());

  const upsert = useMutation({
    mutationFn: async (payload: TeacherForm) => {
      const body = {
        user_id: payload.user_id || null,
        employee_id: payload.employee_id.trim(),
        department: payload.department.trim() || null,
        qualification: payload.qualification.trim() || null,
      };
      if (selectedId) {
        await apiClient.put(`/api/v1/teachers/${selectedId}`, body);
      } else {
        await apiClient.post("/api/v1/teachers/", body);
      }
    },
    onSuccess: () => {
      setSelectedId(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ["management-teachers"] });
    },
  });

  const removeTeacher = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/api/v1/teachers/${id}`),
    onSuccess: (_, teacherId) => {
      queryClient.invalidateQueries({ queryKey: ["management-teachers"] });
      const next = assignments.filter((item) => item.teacher_id !== teacherId);
      setAssignments(next);
      saveAssignments(next);
    },
  });

  function createAssignment(values: AssignmentForm) {
    const subject = subjects.find((item) => item.id === values.subject_id);
    if (!subject) return;

    const newItem: TeacherAssignment = {
      id: `${values.teacher_id}-${values.subject_id}-${values.class_name}-${values.section}-${Date.now()}`,
      teacher_id: values.teacher_id,
      subject_id: values.subject_id,
      class_name: values.class_name,
      section: values.section,
    };

    const alreadyExists = assignments.some(
      (item) =>
        item.teacher_id === newItem.teacher_id &&
        item.subject_id === newItem.subject_id &&
        item.class_name === newItem.class_name &&
        item.section === newItem.section,
    );
    if (alreadyExists) {
      return;
    }

    const next = [newItem, ...assignments];
    setAssignments(next);
    saveAssignments(next);
    assignmentForm.reset({
      teacher_id: values.teacher_id,
      subject_id: subject.id,
      class_name: values.class_name,
      section: values.section,
    });
    setAssignmentPage(1);
  }

  const assignmentRows = useMemo(() => {
    return assignments.map((item) => {
      const teacher = teachers.find((t) => t.id === item.teacher_id);
      const subject = subjects.find((s) => s.id === item.subject_id);
      return {
        ...item,
        teacher_label: teacher ? `${teacher.employee_id}` : `Teacher #${item.teacher_id}`,
        subject_label: subject ? `${subject.code} - ${subject.name}` : `Subject #${item.subject_id}`,
      };
    });
  }, [assignments, teachers, subjects]);

  const assignmentTotal = assignmentRows.length;
  const assignmentSize = 10;
  const assignmentStart = (assignmentPage - 1) * assignmentSize;
  const assignmentPageRows = assignmentRows.slice(assignmentStart, assignmentStart + assignmentSize);

  function deleteAssignment(id: string) {
    const next = assignments.filter((item) => item.id !== id);
    setAssignments(next);
    saveAssignments(next);
    if (assignmentPage > 1 && assignmentStart >= next.length) {
      setAssignmentPage((value) => Math.max(1, value - 1));
    }
  }

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Teacher Management</h1>
        <p>Manage teacher profiles and assign subject-class responsibilities.</p>
      </section>

      <section className="panel">
        <h2>{selectedId ? `Edit Teacher #${selectedId}` : "Create Teacher"}</h2>
        <form className="form-grid" onSubmit={handleSubmit((values) => upsert.mutate(values))}>
          <input {...register("user_id", { valueAsNumber: true })} min={1} placeholder="Linked user ID" type="number" />
          <input {...register("employee_id", { required: true })} placeholder="Employee ID" />
          <input {...register("department")} placeholder="Department" />
          <input {...register("qualification")} placeholder="Qualification" />
          <button disabled={upsert.isPending} type="submit">
            {upsert.isPending ? "Saving..." : selectedId ? "Update Teacher" : "Create Teacher"}
          </button>
        </form>
      </section>

      <section className="panel table-wrap">
        <h2>Teacher Directory {isLoading ? "(loading...)" : `(${total})`}</h2>
        <TableQueryControls
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onSizeChange={(value) => {
            setSize(value);
            setPage(1);
          }}
          onSortChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          search={search}
          searchPlaceholder="Search employee ID, department, qualification"
          size={size}
          sort={sort}
          sortOptions={[
            { value: "-id", label: "Newest" },
            { value: "id", label: "Oldest" },
            { value: "employee_id", label: "Employee ID (A-Z)" },
            { value: "-employee_id", label: "Employee ID (Z-A)" },
            { value: "department", label: "Department (A-Z)" },
            { value: "-department", label: "Department (Z-A)" },
          ]}
        />
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User ID</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Qualification</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.user_id ?? "-"}</td>
                <td>{item.employee_id}</td>
                <td>{item.department ?? "-"}</td>
                <td>{item.qualification ?? "-"}</td>
                <td>
                  <div className="grid-row-actions">
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        reset({
                          user_id: item.user_id ?? undefined,
                          employee_id: item.employee_id,
                          department: item.department ?? "",
                          qualification: item.qualification ?? "",
                        });
                        assignmentForm.setValue("teacher_id", item.id);
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button onClick={() => removeTeacher.mutate(item.id)} type="button">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TablePagination onPageChange={setPage} page={page} size={size} total={total} />
      </section>

      <section className="panel">
        <h2>Subject and Class Assignment</h2>
        <p className="muted-note">Assignments are stored in browser cache until backend assignment APIs are introduced.</p>
        <form className="form-grid" onSubmit={assignmentForm.handleSubmit(createAssignment)}>
          <select {...assignmentForm.register("teacher_id", { required: true, valueAsNumber: true })}>
            <option value="">Select teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.employee_id} (#{teacher.id})
              </option>
            ))}
          </select>
          <select {...assignmentForm.register("subject_id", { required: true, valueAsNumber: true })}>
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.code} - {subject.name}
              </option>
            ))}
          </select>
          <select {...assignmentForm.register("class_name", { required: true })}>
            <option value="">Select class</option>
            {classOptions.map((item) => (
              <option key={`${item.class_name}-${item.section}`} value={item.class_name}>
                {item.class_name}
              </option>
            ))}
          </select>
          <select {...assignmentForm.register("section", { required: true })}>
            <option value="">Select section</option>
            {classOptions.map((item) => (
              <option key={`${item.class_name}-${item.section}`} value={item.section}>
                {item.section}
              </option>
            ))}
          </select>
          <button type="submit">Assign Teacher</button>
        </form>
      </section>

      <section className="panel table-wrap">
        <h2>Teacher Assignments ({assignmentTotal})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Subject</th>
              <th>Class</th>
              <th>Section</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignmentPageRows.map((item) => (
              <tr key={item.id}>
                <td>{item.teacher_label}</td>
                <td>{item.subject_label}</td>
                <td>{item.class_name}</td>
                <td>{item.section}</td>
                <td>
                  <button onClick={() => deleteAssignment(item.id)} type="button">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TablePagination
          onPageChange={setAssignmentPage}
          page={assignmentPage}
          size={assignmentSize}
          total={assignmentTotal}
        />
      </section>
    </main>
  );
}
