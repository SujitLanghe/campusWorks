"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  Briefcase, Users, Clock, CheckCircle, Plus, LayoutGrid, 
  Loader2, Calendar, Edit, Eye, Archive, CheckCircle2
} from "lucide-react";

export default function MyProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedProjects);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedProjects(newSet);
  };

  const fetchProjects = async () => {
    try {
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

  const handleComplete = async (projectId: string) => {
    try {
      const { data } = await api.patch(`/complete-project/${projectId}`);
      toast.success(data.message || "Project marked as complete!");
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to complete project");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "OPEN": 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Open</span>;
      case "ONGOING": 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" /> Ongoing</span>;
      case "COMPLETED": 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>;
      default: 
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
         <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
         <p className="text-sm text-gray-500 font-medium">Loading your projects...</p>
       </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Clean Page Header */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">My Projects</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl">
            Manage your published problem statements, review student applications, and track active project milestones.
          </p>
        </div>
        <Link 
          href="/dashboard/publish"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl flex items-center transition-all shadow-sm shadow-emerald-600/20 active:translate-y-px"
        >
          <Plus className="w-5 h-5 mr-2" />
          Publish New
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="mx-auto h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
            <LayoutGrid className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't published any problem statements. Start engaging with students by creating your first project.</p>
          <Link href="/dashboard/publish" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
            Publish Your First Project &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
              
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  {getStatusBadge(project.status)}
                  <span className="text-xs text-gray-400 flex items-center font-medium">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                  {project.title}
                </h3>
              </div>
              
              {/* Card Body Description */}
              <div className="px-6 py-4 border-b border-gray-50 bg-slate-50/30">
                <div className="relative">
                  <div 
                    className={`text-gray-600 text-sm leading-relaxed transition-all duration-300 overflow-hidden ${expandedProjects.has(project._id) ? 'max-h-[1000px]' : 'max-h-16 line-clamp-2'}`}
                    dangerouslySetInnerHTML={{ __html: project.description }}
                  />
                  {project.description && project.description.length > 100 && (
                    <button 
                      onClick={() => toggleExpand(project._id)}
                      className="text-emerald-600 hover:text-emerald-700 text-xs font-bold mt-2 flex items-center gap-1 transition-colors"
                    >
                      {expandedProjects.has(project._id) ? "Show Less" : "Read More..." }
                    </button>
                  )}
                </div>
              </div>
              
              {/* Card Body Metrics */}
              <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
                <div className="bg-white p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center"><Users className="w-3 h-3 mr-1"/> Team Size</span>
                  <span className="text-sm font-bold text-gray-900">{project.students?.length} / {project.maxStudents}</span>
                </div>
                <div className="bg-white p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center"><Clock className="w-3 h-3 mr-1"/> Duration</span>
                  <span className="text-sm font-bold text-gray-900">{project.duration}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/50 flex flex-col gap-3 mt-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.status === "OPEN" && (
                    <Link 
                      href={`/dashboard/project/${project._id}/applications`}
                      className="col-span-1 sm:col-span-2 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review Applications
                    </Link>
                  )}
                  
                  <Link 
                    href={`/dashboard/project/${project._id}`}
                    className={`bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm ${project.status === "OPEN" ? "col-span-1 sm:col-span-2" : "flex-1"}`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Manage Tasks
                  </Link>

                  {project.status === "ONGOING" && (
                    <button 
                      onClick={() => handleComplete(project._id)}
                      className="flex-1 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 flex justify-center items-center px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
