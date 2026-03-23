"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  Briefcase, 
  Clock, 
  Users, 
  Search, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  User,
  Activity,
  CheckCircle2,
  Calendar,
  Building2,
  Globe,
  PieChart,
  Target
} from "lucide-react";

interface Project {
  _id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  duration: string;
  maxStudents: number;
  status: string;
  professor: {
    name: { firstname: string; lastname: string };
    department: string;
  };
  createdAt: string;
}

export default function ProjectsOversight() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  const fetchProjects = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/all-projects?page=${page}&limit=10`);
      setProjects(data.projects);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to load project registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.professor?.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "OPEN": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "ONGOING": return "bg-blue-50 text-blue-700 border-blue-100";
      case "COMPLETED": return "bg-slate-50 text-slate-700 border-slate-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-slate-800 flex items-center gap-3">
             <Target className="w-8 h-8 text-emerald-600" /> Research Index
          </h1>
          <p className="text-gray-500 font-medium text-sm">Centralized oversight for all problem statements and research trajectories.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search problem statements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-xs font-bold shadow-sm"
            />
          </div>
          <select 
            className="px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs font-bold shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Interrogating <br/>Research Database</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <PieChart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No research found</h3>
          <p className="text-gray-500">The platform registry contains no projects matching your query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Problem Statement</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Research Supervisor</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Metrics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col max-w-sm">
                        <span className="text-sm font-black text-gray-900 line-clamp-1 mb-1 group-hover:text-emerald-600 transition-colors">{project.title}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center">
                          <Calendar className="w-3 h-3 mr-1" /> Published {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {project.professor?.name?.firstname?.[0]}{project.professor?.name?.lastname?.[0]}
                        </div>
                        <span className="text-xs font-bold text-gray-700">Prof. {project.professor?.name?.firstname} {project.professor?.name?.lastname}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{project.professor?.department}</td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(project.status)} shadow-sm`}>
                          {project.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 border border-gray-100 px-2 py-1 rounded-lg bg-white">
                          <Users className="w-3 h-3 text-blue-500" /> Max {project.maxStudents} Spot
                        </div>
                         <div className="flex items-center gap-2 text-[10px] font-black text-gray-900 border border-gray-100 px-2 py-1 rounded-lg bg-white">
                          <Clock className="w-3 h-3 text-orange-500" /> {project.duration}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-8 py-6 rounded-[32px] border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing Registry Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={pagination.currentPage === 1}
              onClick={() => fetchProjects(pagination.currentPage - 1)}
              className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-emerald-600 shadow-sm disabled:opacity-30 transition-all hover:shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => fetchProjects(pagination.currentPage + 1)}
              className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-emerald-600 shadow-sm disabled:opacity-30 transition-all hover:shadow-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
