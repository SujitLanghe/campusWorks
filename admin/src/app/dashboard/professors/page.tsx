"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  Briefcase, 
  Mail, 
  Building2, 
  Search, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  User,
  ArrowRight,
  ExternalLink
} from "lucide-react";

interface Professor {
  _id: string;
  name: { firstname: string; lastname: string };
  email: string;
  department: string;
  designation: string;
  publishedProjects: { _id: string; title: string; status: string }[];
}

export default function ProfessorsManagement() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchProfessors = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/professors?page=${page}&limit=8`);
      setProfessors(data.professors);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load faculty data");
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-emerald-600">Faculty Management</h1>
          <p className="text-gray-500 font-medium">Oversight of all registered professors and their research contributions.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProfessors.map((prof) => (
            <div key={prof._id} className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group">
              <div className="p-8 pb-6 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-black text-xl border-4 border-emerald-50 shadow-sm">
                    {prof.name.firstname[0].toUpperCase()}{prof.name.lastname[0].toUpperCase()}
                  </div>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    {prof.designation || 'FACULTY'}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-1">Prof. {prof.name.firstname} {prof.name.lastname}</h3>
                <div className="flex items-center text-xs font-bold text-emerald-600 gap-1.5 mb-6 bg-emerald-50/50 w-fit px-2 py-1 rounded-lg border border-emerald-100">
                   <Building2 className="w-3.5 h-3.5" /> {prof.department} Department
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                    <Mail className="w-4 h-4 text-gray-300" />
                    <span className="truncate">{prof.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
                    <Briefcase className="w-4 h-4 text-gray-300" />
                    <span className="font-bold text-gray-900">{prof.publishedProjects?.length || 0} Projects Published</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-gray-50 mt-auto flex gap-2">
                 <button className="flex-1 bg-white hover:bg-emerald-600 hover:text-white text-gray-700 border border-gray-200 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn shadow-sm">
                    Inspect Profile <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover/btn:text-white" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Container */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8">
          <button 
            disabled={pagination.currentPage === 1}
            onClick={() => fetchProfessors(pagination.currentPage - 1)}
            className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-black text-gray-900 bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-sm">
            {pagination.currentPage} <span className="text-gray-300 font-bold mx-2">/</span> {pagination.totalPages}
          </span>
          <button 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => fetchProfessors(pagination.currentPage + 1)}
            className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-emerald-600 disabled:opacity-30 transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
