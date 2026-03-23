"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  Search, MapPin, Clock, Users, Loader2, User, Building2, 
  ArrowRight, XCircle, Globe, Send, CheckCircle2, Sparkles
} from "lucide-react";

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

  const filteredProjects = (projects || []).filter((p: Project) => 
    (p.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (p.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.professor?.name?.firstname?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.professor?.name?.lastname?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Clean Page Header */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Explore Projects</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl">
            Discover real-world problem statements published by professors. Apply your skills, collaborate with peers, and build your portfolio.
          </p>
        </div>
      </div>

      {/* Modern Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium placeholder:text-gray-400 text-gray-800 border"
            placeholder="Search projects by title, description, or professor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-sm font-medium text-gray-500">Loading open projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center max-w-3xl mx-auto">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500">
            There are currently no open projects matching your search criteria. Check back later or clear your search to see all listings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden relative">
              
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800 border border-blue-200">
                    {project.status === "OPEN" ? "Accepting Apps" : project.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-snug">
                  {project.title}
                </h3>
              </div>
              
              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col gap-5 bg-slate-50/50">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <User className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                    <span className="font-bold">Prof. {project.professor.name.firstname} {project.professor.name.lastname}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                    <span className="font-medium">{project.professor.department} Dept.</span>
                  </div>
                </div>

                <div className="relative">
                  <div 
                    className="text-gray-600 text-sm leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: project.description }}
                  />
                  <Link 
                    href={`/dashboard/project/${project._id}`}
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold mt-2 inline-flex items-center gap-1 transition-colors group/read"
                  >
                    Read Detailed Description <ArrowRight className="w-3 h-3 transition-transform group-hover/read:translate-x-1" />
                  </Link>
                </div>

                <div className="flex gap-2 flex-wrap mt-auto pt-2">
                  {project.skillsRequired.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="bg-white text-gray-600 border border-gray-200 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase shadow-sm">
                      {skill}
                    </span>
                  ))}
                  {project.skillsRequired.length > 3 && (
                    <span className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded text-[11px] font-bold tracking-wide uppercase">
                      +{project.skillsRequired.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer (Metrics & Apply) */}
              <div className="bg-white p-5 border-t border-gray-100 flex flex-col gap-4">
                
                {/* Metrics Row */}
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                  <div className="flex items-center bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    <span>{project.students?.length || 0} / {project.maxStudents} Filled</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
                    <span>{project.duration}</span>
                  </div>
                </div>

                {/* View Details Link */}
                <Link 
                  href={`/dashboard/project/${project._id}`}
                  className="w-full mt-2 bg-blue-600 text-white font-black hover:bg-blue-700 py-4 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                >
                  View Full Project & Apply <Sparkles className="w-4 h-4 ml-2" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
