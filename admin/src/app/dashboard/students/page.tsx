"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  GraduationCap, 
  Mail, 
  Search, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  User,
  Activity,
  Award,
  Fingerprint,
  Building2,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";

interface Student {
  _id: string;
  name: { firstname: string; lastname: string };
  email: string;
  department: string;
  enrollmentno: string;
  year: number;
  appliedProjects: { title: string; status: string }[];
}

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/students?page=${page}&limit=8`);
      setStudents(data.students);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load student directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s: Student) => 
    `${s.name.firstname} ${s.name.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.enrollmentno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-blue-600">Student Directory</h1>
          <p className="text-gray-500 font-medium">Global tracking of student participation and research progress.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search enrollment or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Querying Student Matrix</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Registry is empty</h3>
          <p className="text-gray-500">No student records match your current oversight filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student: Student) => (
            <div key={student._id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col group p-6 border-b-4 border-b-blue-500/20 active:border-b-blue-500">
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:rotate-6">
                  {student.name.firstname[0].toUpperCase()}{student.name.lastname[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 leading-tight">{student.name.firstname} {student.name.lastname}</h3>
                  <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    <Fingerprint className="w-3 h-3 mr-1" /> {student.enrollmentno}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="truncate">{student.department} Department</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="truncate font-medium">{student.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Year {student.year} Undergraduate</span>
                </div>
              </div>

              <div className="mt-auto border-t border-gray-50 pt-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Participation</span>
                  <p className="text-sm font-black text-gray-900">{student.appliedProjects?.length || 0} Project Apps</p>
                </div>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination View */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-12">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => fetchStudents(pagination.currentPage - 1)}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 disabled:opacity-30 transition-all hover:shadow-lg shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-2">
            <span className="text-sm font-black text-gray-900">{pagination.currentPage}</span>
            <span className="text-gray-300 font-bold">/</span>
            <span className="text-sm font-black text-gray-400">{pagination.totalPages}</span>
          </div>
          <button 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => fetchStudents(pagination.currentPage + 1)}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 disabled:opacity-30 transition-all hover:shadow-lg shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
