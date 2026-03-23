"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  ArrowLeft, Clock, Users, User, Building2, 
  Send, Loader2, Sparkles, BookOpen, Target, 
  ChevronRight, Calendar
} from "lucide-react";

interface Project {
  _id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  duration: string;
  maxStudents: number;
  professor: {
    name: { firstname: string; lastname: string };
    department: string;
    designation: string;
    email: string;
  };
  students: any[];
  status: string;
  createdAt: string;
}

export default function ProjectDetails() {
  const router = useRouter();
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const { data } = await api.get(`/project/${id}`);
        setProject(data.project);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load project details");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProjectDetails();
  }, [id, router]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please provide a brief message on why you should be selected.");
      return;
    }
    
    setSubmitting(true);
    try {
      const { data } = await api.post(`/apply/${id}`, { message });
      toast.success(data.message || "Application submitted successfully!");
      router.push("/dashboard/applications");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Synchronizing Project Data...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Navigation Header */}
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Explore
        </button>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Explore <ChevronRight className="w-3 h-3" /> Details <ChevronRight className="w-3 h-3 text-blue-500" /> Apply
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Section */}
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                {project.status === "OPEN" ? "Accepting Applications" : project.status}
              </span>
              <span className="text-[10px] font-bold text-gray-400 flex items-center">
                <Calendar className="w-3 h-3 mr-1" /> Published {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-8">
              {project.title}
            </h1>

            <div className="space-y-6">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <BookOpen className="w-4 h-4 text-blue-500" /> Research Roadmap & Description
               </h3>
               <div 
                 className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-sm md:text-base space-y-4"
                 dangerouslySetInnerHTML={{ __html: project.description }}
               />
            </div>
          </div>

          {/* Requirements & Meta Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Target className="w-4 h-4 text-emerald-500" /> Technical Prerequisite
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.skillsRequired.map((skill, idx) => (
                  <span key={idx} className="bg-slate-50 text-gray-700 border border-gray-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-orange-500" /> Project Parameters
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Duration</span>
                  <span className="font-black text-gray-900 flex items-center"><Clock className="w-4 h-4 mr-1.5 text-orange-500" /> {project.duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="font-medium">Engagement Mode</span>
                  <span className="font-black text-gray-900">Research Internship</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Cohort Status</span>
                  <span className="font-black text-gray-900 flex items-center"><Users className="w-4 h-4 mr-1.5 text-blue-500" /> {project.students.length} / {project.maxStudents} Filled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="space-y-6">
          
          {/* Professor Contact Card */}
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8 group">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Supervising Faculty</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl font-black border-2 border-blue-100 transition-transform group-hover:rotate-3">
                {project.professor.name.firstname[0].toUpperCase()}{project.professor.name.lastname[0].toUpperCase()}
              </div>
              <div>
                <h4 className="font-black text-gray-900 leading-tight">Prof. {project.professor.name.firstname} {project.professor.name.lastname}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{project.professor.designation}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex items-center text-xs font-bold text-gray-600 gap-2">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" /> {project.professor.department} Department
                </div>
                <div className="flex items-center text-xs font-medium text-blue-600 gap-2 hover:underline cursor-pointer truncate">
                   {project.professor.email}
                </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-slate-900 rounded-[32px] shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <h3 className="text-xl font-black mb-2 relative z-10">Quick Application</h3>
            <p className="text-gray-400 text-xs font-medium mb-8 leading-relaxed relative z-10">
              Submit your interest to the supervisor. Focus on your expertise in the required technical stack.
            </p>

            <form onSubmit={handleApply} className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Motivation Statement</label>
                <textarea 
                  rows={4}
                  placeholder="Tell the professor why you are the best fit for this research..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-800 border-transparent rounded-xl focus:bg-slate-800/80 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none p-4 text-xs font-medium placeholder:text-gray-600 resize-none border"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl flex items-center justify-center transition-all shadow-xl shadow-blue-900/40 disabled:opacity-50 active:scale-95"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Submit Application <Send className="ml-2 w-4 h-4" /></>
                )}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[10px] font-bold text-gray-500 leading-snug">
                  Accepted students get dynamic certificate downloads upon completion.
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
