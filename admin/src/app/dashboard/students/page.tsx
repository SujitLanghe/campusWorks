"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Loader2, 
  Building2, 
  Mail, 
  User,
  Fingerprint,
  Calendar,
  ExternalLink,
  Target
} from "lucide-react";

interface Student {
  _id: string;
  name: { firstname: string; lastname: string };
  email: string;
  department: string;
  enrollmentno: string;
  year: number;
  appliedProjects: { 
    _id: string; 
    title: string; 
    status: string;
    professor: {
      name: { firstname: string; lastname: string };
      department: string;
    };
  }[];
}

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchStudents = async (page = 1) => {
    try {
      const { data } = await api.get(`/students?page=${page}`);
      setStudents(data.students);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages
      });
    } catch (error) {
      toast.error("Failed to load student registry");
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Matrix</h1>
          <p className="text-gray-500 font-medium italic text-sm">Managing undergraduate research participation and performance.</p>
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
        <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50/50 border-b border-gray-100 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                  <th className="px-8 py-5">Student Identity</th>
                  <th className="px-8 py-5">Academic Detail</th>
                  <th className="px-8 py-5">Contact</th>
                  <th className="px-8 py-5 text-center">Engagement</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold">
                {filteredStudents.map((student: Student) => (
                  <tr key={student._id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black shadow-sm group-hover:rotate-6 transition-transform">
                          {student.name.firstname[0]}{student.name.lastname[0]}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-black text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {student.name.firstname} {student.name.lastname}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black flex items-center gap-1">
                            <Fingerprint className="w-2.5 h-2.5" /> {student.enrollmentno}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2 text-gray-500 uppercase tracking-tighter">
                            <Building2 className="w-3.5 h-3.5 text-blue-400" /> {student.department}
                         </div>
                         <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <Calendar className="w-3.5 h-3.5" /> Year {student.year}
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-500 lowercase font-medium">
                        <Mail className="w-3.5 h-3.5 text-gray-300" />
                        <span className="truncate max-w-[180px]">{student.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className="px-3 py-1 bg-white border border-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1.5">
                          <Target className="w-3 h-3" /> {student.appliedProjects?.length || 0} Apps
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end">
                        <Link 
                          href={`/dashboard/students/${student._id}`}
                          className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm group/btn"
                          title="View History"
                        >
                          <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => fetchStudents(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-black shadow-lg shadow-blue-200">
              {pagination.currentPage}
            </span>
            <span className="text-gray-400 font-bold text-xs">of {pagination.totalPages}</span>
          </div>
          <button
            onClick={() => fetchStudents(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
