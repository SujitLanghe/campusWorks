"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  Search, Clock, Users, Building2, User, 
  Calendar, Filter, Globe, MapPin, CheckCircle2, Info, X
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
    designation: string;
  };
  students: any[];
  createdAt: string;
}

export default function ExploreProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/all-projects");
      setProjects(data.projects);
    } catch (error) {
      toast.error("Failed to fetch university projects");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const term = searchQuery.toLowerCase();
    const firstname = p.professor?.name?.firstname || "";
    const lastname = p.professor?.name?.lastname || "";
    const dept = p.professor?.department || "";
    
    const matchesSearch = 
      p.title.toLowerCase().includes(term) ||
      firstname.toLowerCase().includes(term) ||
      lastname.toLowerCase().includes(term) ||
      dept.toLowerCase().includes(term);
    
    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "OPEN": 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Open for Applications</span>;
      case "ONGOING": 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" /> Ongoing Research</span>;
      case "COMPLETED": 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>;
      default: 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Clean Page Header */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">University Directory</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl">
            Explore problem statements and research projects published by faculty across all departments. Use this directory to foster cross-disciplinary collaboration.
          </p>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
            placeholder="Search by title, professor, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Status Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            {["ALL", "OPEN", "ONGOING", "COMPLETED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === status 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                {status === "ALL" ? "All Projects" : status}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-sm text-gray-500">Loading directory...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No matches found</h3>
          <p className="text-sm text-gray-500">
            Try adjusting your search query or removing filters to see more results.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
              
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  {getStatusBadge(project.status)}
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="View Problem Statement"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                  {project.title}
                </h3>
              </div>
              
              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col gap-4 bg-slate-50/50">
                <div className="space-y-2">
                  <div className="flex items-start text-sm text-gray-700">
                    <User className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-gray-900">Prof. {project.professor?.name?.firstname} {project.professor?.name?.lastname}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{project.professor?.department} Dept.</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap mt-auto pt-2">
                  {project.skillsRequired?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="bg-white text-gray-600 border border-gray-200 px-2 py-1 rounded text-[11px] font-semibold tracking-wide uppercase">
                      {skill}
                    </span>
                  ))}
                  {project.skillsRequired?.length > 3 && (
                    <span className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded text-[11px] font-semibold tracking-wide uppercase">
                      +{project.skillsRequired.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-white p-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{project.students?.length || 0} / {project.maxStudents} Students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{project.duration}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
      {/* Project Description Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          ></div>
          
          {/* Modal Container */}
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Info className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">{selectedProject.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">By Prof. {selectedProject.professor?.name?.firstname} {selectedProject.professor?.name?.lastname}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
               <div className="space-y-6">
                 <div className="flex items-center gap-6 pb-6 border-b border-gray-50">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</span>
                      {getStatusBadge(selectedProject.status)}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Published</span>
                      <span className="text-sm font-bold text-gray-700 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> {new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</span>
                      <span className="text-sm font-bold text-gray-700 flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> {selectedProject.duration}</span>
                   </div>
                 </div>

                 <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     Detailed Problem Statement
                   </h4>
                   <div 
                     className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                     dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                   />
                 </div>

                 {selectedProject.skillsRequired?.length > 0 && (
                    <div className="pt-6 border-t border-gray-50">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Required Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.skillsRequired.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-[11px] font-bold border border-gray-100 shadow-sm uppercase">{skill}</span>
                        ))}
                      </div>
                    </div>
                 )}
               </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
               <button 
                 onClick={() => setSelectedProject(null)}
                 className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition-all shadow-sm"
               >
                 Close Detail View
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
