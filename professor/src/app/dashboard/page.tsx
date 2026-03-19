"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Briefcase, Users, Clock, CheckCircle, Plus, LayoutGrid, Loader2 } from "lucide-react";

export default function MyProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      case "OPEN": return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Open for Applications</span>;
      case "ONGOING": return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">Ongoing</span>;
      case "COMPLETED": return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Completed</span>;
      default: return null;
    }
  };

  if (loading) {
     return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-500 mt-1">Manage all your published problem statements and track progress.</p>
        </div>
        <Link 
          href="/dashboard/publish"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg flex items-center transition-colors max-w-max"
        >
          <Plus className="w-5 h-5 mr-2" />
          Publish New
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center mt-6">
          <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <LayoutGrid className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="mt-1 text-gray-500 mb-6">You haven't published any problem statements.</p>
          <Link href="/dashboard/publish" className="text-emerald-600 font-medium hover:underline">
            Click here to publish your first project!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col transition-shadow hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 pr-4">{project.title}</h3>
                {getStatusBadge(project.status)}
              </div>
              
              <p className="text-gray-600 mb-6 line-clamp-3 flex-1">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-50">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center"><Users className="w-3 h-3 mr-1"/> Team Size</span>
                  <span className="text-sm font-medium text-gray-900">{project.students?.length}/{project.maxStudents} Students</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center"><Clock className="w-3 h-3 mr-1"/> Duration</span>
                  <span className="text-sm font-medium text-gray-900">{project.duration}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tasks</span>
                  <span className="text-sm font-medium text-gray-900">{project.tasks?.length || 0} Assigned</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</span>
                  <span className="text-sm font-medium text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                {project.status === "OPEN" && (
                  <Link 
                    href={`/dashboard/project/${project._id}/applications`}
                    className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-center px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    View Applications
                  </Link>
                )}
                
                <Link 
                  href={`/dashboard/project/${project._id}`}
                  className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 text-center px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Manage Tasks
                </Link>

                {project.status === "ONGOING" && (
                  <button 
                    onClick={() => handleComplete(project._id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center px-4 py-2 rounded-lg font-medium text-sm transition-colors flex justify-center items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
