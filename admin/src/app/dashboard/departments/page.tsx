"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
  Building2,
  BookOpen,
  PlusCircle,
  Trash2,
  Loader2,
  XCircle,
  Users,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Hash,
  Layers
} from "lucide-react";

interface Course {
  _id: string;
  name: string;
  code: string;
  semester?: number;
  credits?: number;
  department: { _id: string; name: string; code: string };
}

interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  studentCount: number;
  professorCount: number;
  courseCount: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  // Modals
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const [deptForm, setDeptForm] = useState({ name: "", code: "", description: "", headOfDepartment: "" });
  const [courseForm, setCourseForm] = useState({ name: "", code: "", department: "", semester: 1, credits: 3 });

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/departments");
      setDepartments(data.departments);
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async (departmentId?: string) => {
    try {
      const url = departmentId ? `/courses?departmentId=${departmentId}` : "/courses";
      const { data } = await api.get(url);
      setCourses(data.courses);
    } catch {
      toast.error("Failed to load courses");
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/departments", deptForm);
      toast.success("Department created successfully");
      setShowDeptModal(false);
      setDeptForm({ name: "", code: "", description: "", headOfDepartment: "" });
      fetchDepartments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/courses", courseForm);
      toast.success("Course created successfully");
      setShowCourseModal(false);
      setCourseForm({ name: "", code: "", department: "", semester: 1, credits: 3 });
      fetchDepartments();
      fetchCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm("Delete this department and all its courses?")) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success("Department deleted");
      fetchDepartments();
      fetchCourses();
    } catch {
      toast.error("Failed to delete department");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted");
      fetchDepartments();
      fetchCourses();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  const toggleExpand = (deptId: string) => {
    setExpandedDept(expandedDept === deptId ? null : deptId);
  };

  const getCoursesForDept = (deptId: string) => courses.filter(c => c.department?._id === deptId || (c.department as any) === deptId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <div className="flex flex-col items-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Loading</p>
          <p className="text-slate-900 font-bold text-sm">Department Registry</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Admin Control Center</span>
            <span className="text-slate-200">/</span>
            <span className="text-slate-900">Departments & Courses</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Architecture</h1>
          <p className="text-slate-500 font-medium tracking-tight">Organize departments, courses, and academic structure.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCourseModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Add Course
          </button>
          <button
            onClick={() => setShowDeptModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 rounded-2xl text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
          >
            <PlusCircle className="w-4 h-4" />
            New Department
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Departments", value: departments.length, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Courses", value: courses.length, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Total Faculty", value: departments.reduce((a, d) => a + d.professorCount, 0), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`${card.bg} p-3.5 rounded-2xl`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tighter">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Department Cards */}
      {departments.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center shadow-sm">
          <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No departments yet</h3>
          <p className="text-slate-500">Create your first department to organize academic units.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {departments.map((dept) => (
            <div key={dept._id} className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
              {/* Dept Header */}
              <div
                className="flex items-center justify-between p-6 md:p-8 cursor-pointer group"
                onClick={() => toggleExpand(dept._id)}
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-3 transition-transform">
                    <span className="text-white font-black text-lg">{dept.code}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{dept.name}</h3>
                    {dept.description && <p className="text-sm text-slate-500 font-medium mt-0.5 line-clamp-1">{dept.description}</p>}
                    {dept.headOfDepartment && (
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">HOD: {dept.headOfDepartment}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      <span>{dept.studentCount} Students</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>{dept.professorCount} Faculty</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>{dept.courseCount} Courses</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteDept(dept._id); }}
                      className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedDept === dept._id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Courses */}
              {expandedDept === dept._id && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Courses in {dept.code}</h4>
                    <button
                      onClick={() => { setCourseForm({ ...courseForm, department: dept._id }); setShowCourseModal(true); }}
                      className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      <PlusCircle className="w-3 h-3" /> Add Course
                    </button>
                  </div>
                  {getCoursesForDept(dept._id).length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No courses added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {getCoursesForDept(dept._id).map((course) => (
                        <div key={course._id} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between group/card hover:shadow-sm transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                              <Hash className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{course.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.code} · Sem {course.semester || "—"} · {course.credits || 3}cr</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="p-2 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover/card:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowDeptModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl relative z-20 flex flex-col max-h-[90vh] animate-in zoom-in duration-300 border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">New Department</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Define an academic unit</p>
              </div>
              <button onClick={() => setShowDeptModal(false)} className="p-2 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleCreateDept} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Name</label>
                    <input
                      type="text" required value={deptForm.name}
                      onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code</label>
                    <input
                      type="text" required value={deptForm.code}
                      onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 uppercase"
                      placeholder="e.g. CS"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HOD</label>
                    <input
                      type="text" value={deptForm.headOfDepartment}
                      onChange={(e) => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                      placeholder="e.g. Dr. Smith"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      value={deptForm.description}
                      onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 resize-none h-24"
                      placeholder="Brief description..."
                    />
                  </div>
                </div>
                <button
                  type="submit" disabled={isSubmitting}
                  className="w-full mt-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Department"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowCourseModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl relative z-20 flex flex-col max-h-[90vh] animate-in zoom-in duration-300 border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Add Course</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Assign to a department</p>
              </div>
              <button onClick={() => setShowCourseModal(false)} className="p-2 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900">
                <XCircle className="w-8 h-8" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleCreateCourse} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Name</label>
                    <input
                      type="text" required value={courseForm.name}
                      onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                      placeholder="e.g. Data Structures"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code</label>
                    <input
                      type="text" required value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 uppercase"
                      placeholder="CS201"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <select
                      required value={courseForm.department}
                      onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 appearance-none"
                    >
                      <option value="">Select</option>
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                    <input
                      type="number" min={1} max={8} value={courseForm.semester}
                      onChange={(e) => setCourseForm({ ...courseForm, semester: Number(e.target.value) })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Credits</label>
                    <input
                      type="number" min={1} max={6} value={courseForm.credits}
                      onChange={(e) => setCourseForm({ ...courseForm, credits: Number(e.target.value) })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>
                <button
                  type="submit" disabled={isSubmitting}
                  className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Course"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
