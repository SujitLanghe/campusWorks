"use client";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Search, MapPin, Clock, Users, ArrowRight, Loader2, UserCircle } from "lucide-react";

interface Project {
  _id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  duration: string;
  maxStudents: number;
  professor: {
    _id: string;
    name: { firstname: string; lastname: string };
    department: string;
  };
  students: string[];
  status: string;
  createdAt: string;
}

export default function ExploreProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApply = async (projectId: string) => {
    try {
      const { data } = await api.post(`/apply/${projectId}`, { message });
      toast.success(data.message || "Application submitted!");
      setApplyingTo(null);
      setMessage("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Explore Projects</h1>
          <p className="text-gray-500 mt-1">Discover and apply to problem statements published by professors.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none w-full sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-gray-500">There are no open projects matching your criteria right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                    <span className="flex items-center"><UserCircle className="w-4 h-4 mr-1"/> Prof. {project.professor.name.firstname} {project.professor.name.lastname}</span>
                    <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {project.professor.department}</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {project.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-6 line-clamp-3 flex-1">{project.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {project.skillsRequired.map((skill, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md font-medium">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {project.duration}</span>
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1"/> {project.students?.length || 0}/{project.maxStudents}</span>
                </div>
                
                {applyingTo === project._id ? (
                  <div className="flex items-center space-x-2 w-full max-w-xs mt-2 sm:mt-0">
                    <input 
                      type="text" 
                      placeholder="Why should we select you?" 
                      className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button 
                      onClick={() => handleApply(project._id)}
                      className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Apply
                    </button>
                    <button 
                      onClick={() => {setApplyingTo(null); setMessage("");}}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setApplyingTo(project._id)}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                  >
                    Apply Now <ArrowRight className="w-4 h-4 ml-1" />
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
