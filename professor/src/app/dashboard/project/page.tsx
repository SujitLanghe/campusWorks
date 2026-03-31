"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  Briefcase, Users, Clock, CheckCircle, Plus, LayoutGrid, 
  Loader2, Calendar, Edit, Eye, Archive, CheckCircle2, Trash2, 
  AlertCircle, ArrowRight, BarChart3, Search, Filter
} from "lucide-react";

export default function ProjectPortfolio() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/my-projects");
      setProjects(data.projects || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This will remove all associated data.")) return;
    setDeletingId(projectId);
    try {
      const { data } = await api.delete(`/delete-project/${projectId}`);
      toast.success(data.message || "Project deleted successfully");
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "OPEN": 
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Accepting Applications</span>;
      case "ONGOING": 
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center">Research in Progress</span>;
      case "COMPLETED": 
        return <span className="bg-gray-50 text-gray-700 border border-gray-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Archived Research</span>;
      default: 
        return <span className="bg-gray-50 text-gray-500 border border-gray-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-gray-400 font-medium text-sm animate-pulse uppercase tracking-[0.2em]">Syncing Your Portfolio</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      
      {/* Professional Portfolio Header */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Briefcase className="w-5 h-5" /></div>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Faculty Portal</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">Project Portfolio</h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
            Manage your research mandates, oversee student participation, and track institutional project outcomes.
          </p>
        </div>
        
        <Link 
          href="/dashboard/publish"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-[20px] flex items-center transition-all shadow-lg shadow-emerald-600/10 active:scale-95 text-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Publish New Mandate
        </Link>
      </div>

      {/* Portfolio Controls */}
      <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input 
               type="text"
               placeholder="Filter portfolio by project title..."
               className="w-full pl-12 pr-6 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-sm font-medium border"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {["ALL", "OPEN", "ONGOING", "COMPLETED"].map((status) => (
               <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${filterStatus === status ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200 hover:text-emerald-600'}`}
               >
                  {status}
               </button>
            ))}
         </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-24 text-center">
          <Archive className="w-12 h-12 text-gray-100 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-outfit">Portfolio Empty</h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">
            You haven't published any research mandates yet. Begin by defining your first project to attract student researchers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-500 flex flex-col group overflow-hidden h-full">
              
              {/* Module Header */}
              <div className="p-8 space-y-5 flex-1">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                     {getStatusBadge(project.status)}
                     <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                        <Calendar className="w-3.5 h-3.5" />
                        Filed {new Date(project.createdAt).toLocaleDateString()}
                     </div>
                  </div>
                  {project.status === "OPEN" && (
                    <button 
                      onClick={() => handleDelete(project._id)}
                      disabled={deletingId === project._id}
                      className="p-3 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      {deletingId === project._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 leading-tight tracking-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                  {project.title}
                </h3>

                <div 
                  className="text-gray-500 text-sm leading-relaxed line-clamp-3 prose prose-sm font-medium"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>
              
              {/* Operational Metrics */}
              <div className="grid grid-cols-2 border-y border-gray-50 bg-gray-50/30">
                <div className="p-6 flex flex-col items-center justify-center border-r border-gray-50">
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Users className="w-3 h-3"/> Unit Density</span>
                   <span className="text-sm font-bold text-gray-900 tracking-tight">{project.students?.length} / {project.maxStudents}</span>
                </div>
                <div className="p-6 flex flex-col items-center justify-center">
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock className="w-3 h-3"/> Lifecycle</span>
                   <span className="text-sm font-bold text-gray-900 tracking-tight">{project.duration}</span>
                </div>
              </div>

              {/* Management Controls */}
              <div className="p-6 bg-white space-y-3">
                 {project.status === "OPEN" && (
                   <Link 
                     href={`/dashboard/project/${project._id}/applications`}
                     className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 flex items-center justify-center py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                   >
                     Review Submissions <Eye className="w-4 h-4 ml-2" />
                   </Link>
                 )}
                 <Link 
                   href={`/dashboard/project/${project._id}`}
                   className="w-full bg-slate-900 hover:bg-black text-white flex items-center justify-center py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 group/manage"
                 >
                   Manage Milestones <ArrowRight className="w-4 h-4 ml-2 group-hover/manage:translate-x-1 transition-transform" />
                 </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
