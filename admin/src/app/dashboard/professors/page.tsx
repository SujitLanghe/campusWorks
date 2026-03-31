"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { 
  Briefcase, 
  Search, 
  Loader2, 
  Building2, 
  Mail, 
  User,
  ExternalLink,
  Target
} from "lucide-react";

interface Professor {
  _id: string;
  name: { firstname: string; lastname: string };
  email: string;
  department: string;
  designation: string;
  publishedProjects: any[];
}

export default function ProfessorsManagement() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchProfessors = async (page = 1) => {
    try {
      const { data } = await api.get(`/professors?page=${page}`);
      setProfessors(data.professors);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages
      });
    } catch (error) {
      toast.error("Failed to load faculty records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  const filteredProfessors = professors.filter(p => 
    `${p.name.firstname} ${p.name.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Faculty Directory</h1>
          <p className="text-gray-500 font-medium italic text-sm">Overseeing university research leads and academic contributions.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-bold shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Synchronizing Records</p>
        </div>
      ) : filteredProfessors.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-500">No faculty members match your search criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-100 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                  <th className="px-8 py-5">Faculty Member</th>
                  <th className="px-8 py-5">Contact Details</th>
                  <th className="px-8 py-5">Department</th>
                  <th className="px-8 py-5 text-center">Portfolio</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold">
                {filteredProfessors.map((prof) => (
                  <tr key={prof._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform">
                          {prof.name.firstname[0]}{prof.name.lastname[0]}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-black text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                            Prof. {prof.name.firstname} {prof.name.lastname}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                            {prof.designation || 'FACULTY'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail className="w-3.5 h-3.5 text-gray-300" />
                        <span className="font-medium lowercase truncate max-w-[200px]">{prof.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 uppercase tracking-wider text-gray-500 font-black">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        {prof.department}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className="px-3 py-1 bg-white border border-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm">
                          {prof.publishedProjects?.length || 0} Projects
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end">
                        <Link 
                          href={`/dashboard/professors/${prof._id}`}
                          className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 rounded-xl transition-all shadow-sm group/btn"
                          title="Inspect Profile"
                        >
                          <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
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
            onClick={() => fetchProfessors(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-200">
              {pagination.currentPage}
            </span>
            <span className="text-gray-400 font-bold text-xs">of {pagination.totalPages}</span>
          </div>
          <button
            onClick={() => fetchProfessors(pagination.currentPage + 1)}
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
