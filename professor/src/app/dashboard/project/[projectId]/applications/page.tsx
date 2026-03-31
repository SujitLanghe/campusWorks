"use client";
import React, { useState, useEffect, use } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Loader2, 
  UserCircle, 
  Briefcase, 
  Users, 
  ChevronLeft,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Target,
  ExternalLink,
  MessageSquare,
  GraduationCap,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function ViewApplications({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/applications/${projectId}`);
      setApplications(data.applications || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [projectId]);

  const handleAccept = async (appId: string) => {
    if (!window.confirm("Accept this candidate into the research unit?")) return;
    setActioningId(appId);
    try {
      const { data } = await api.patch(`/accept-application/${appId}`);
      toast.success(data.message || "Candidate activated successfully!");
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept application");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (appId: string) => {
     if (!window.confirm("Decline this application? This action cannot be undone.")) return;
     setActioningId(appId);
     try {
       // Assuming the endpoint exists based on student view having REJECTED status
       const { data } = await api.patch(`/reject-application/${appId}`);
       toast.success(data.message || "Application declined.");
       fetchApplications();
     } catch (error: any) {
       toast.error(error.response?.data?.message || "Failed to decline application");
     } finally {
       setActioningId(null);
     }
  };

  const filteredApplications = applications.filter(app => 
    `${app.student.name.firstname} ${app.student.name.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.student.enrollmentno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin shadow-xl"></div>
        <div className="flex flex-col items-center text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching</p>
            <p className="text-emerald-600 font-bold text-sm">Candidate Intelligence Registry</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-700">
      
      {/* Strategic Header */}
      <div className="bg-slate-900 rounded-[48px] shadow-2xl relative overflow-hidden group p-10 md:p-14">
        {/* Generative UI elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
           <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                 <Link href={`/dashboard/project/${projectId}`} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all shadow-sm group/btn">
                    <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                 </Link>
                 <span className="px-4 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Candidate Intelligence Oversight
                 </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">Review Applications</h1>
              <p className="text-white/40 font-bold text-sm max-w-xl">
                 Analyze incoming research proposals and activate the most qualified candidates for your strategic unit.
              </p>
           </div>

           <div className="flex items-center gap-8 bg-white/5 p-6 rounded-[32px] border border-white/5 backdrop-blur-sm">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Filed</span>
                 <span className="text-3xl font-black text-white tracking-tighter">{applications.length}</span>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Units</span>
                 <span className="text-3xl font-black text-emerald-400 tracking-tighter">{applications.filter(a => a.status === 'ACCEPTED').length}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Intelligence Controls */}
      <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input 
               type="text"
               placeholder="Search candidates by name or ID..."
               className="w-full pl-14 pr-8 py-5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-sm font-bold border"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filtered Access
         </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-[48px] border-2 border-dashed border-gray-100 p-24 text-center max-w-2xl mx-auto shadow-sm">
          <Users className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-gray-900 mb-2">Registry Inactive</h3>
          <p className="text-gray-400 font-bold max-w-sm mx-auto uppercase text-[10px] tracking-widest">
            No candidate submissions have been filed for this research mandate yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredApplications.map((app) => (
            <div key={app._id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-500 group relative overflow-hidden flex flex-col">
              
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform"></div>
              
              {/* Card Header */}
              <div className="p-8 pb-4 space-y-6 flex-1">
                 <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-slate-900 border-4 border-slate-50 shadow-xl rounded-2xl flex items-center justify-center font-black text-emerald-400 text-xl group-hover:rotate-6 transition-transform">
                       {app.student.name.firstname[0]}{app.student.name.lastname[0]}
                    </div>
                    {app.status === "ACCEPTED" ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-xl flex items-center shadow-lg shadow-emerald-500/20 uppercase tracking-widest">
                         <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Unit Activated
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-600 border border-amber-100 text-[10px] font-black px-4 py-1.5 rounded-xl flex items-center uppercase tracking-widest animate-pulse">
                         <Target className="w-3.5 h-3.5 mr-1.5" /> Pending Review
                      </span>
                    )}
                 </div>

                 <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter group-hover:text-emerald-600 transition-colors">{app.student.name.firstname} {app.student.name.lastname}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5 text-emerald-500" /> ID: {app.student.enrollmentno}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-3 py-4 border-y border-gray-50 bg-gray-50/50 rounded-2xl px-4">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><GraduationCap className="w-3 h-3"/> Sector</span>
                       <span className="text-xs font-black text-gray-900 truncate">{app.student.department}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Briefcase className="w-3 h-3"/> Seniority</span>
                       <span className="text-xs font-black text-gray-900">Year {app.student.year}</span>
                    </div>
                 </div>

                 <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MessageSquare className="w-3 h-3 text-emerald-500" /> Research Pitch</h4>
                    <div className="p-5 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-600 leading-relaxed italic line-clamp-4 relative group-hover:border-emerald-100 transition-colors shadow-sm">
                       "{app.message}"
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-2 pt-2">
                    {app.student.skills?.slice(0, 4).map((s: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-slate-900 text-white text-[9px] rounded-lg font-black uppercase tracking-widest shadow-sm">
                         {s}
                      </span>
                    ))}
                    {app.student.skills?.length > 4 && (
                       <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[9px] rounded-lg font-black uppercase tracking-widest border border-gray-150">
                          +{app.student.skills.length - 4} More
                       </span>
                    )}
                 </div>
              </div>

              {/* Card Footer */}
              <div className="p-8 pt-4 border-t border-gray-50 space-y-4">
                 {app.student.resumeUrl && (
                    <a 
                      href={app.student.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-4 text-emerald-600 hover:text-emerald-700 text-xs font-black uppercase tracking-widest transition-all bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl border border-emerald-100/50 group/res"
                    >
                      <FileText className="w-4 h-4" /> Intelligence Brief (Resume) <ExternalLink className="w-3.5 h-3.5 group-hover/res:translate-x-0.5 group-hover/res:-translate-y-0.5 transition-transform" />
                    </a>
                 )}
                 
                 {app.status !== "ACCEPTED" && (
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => handleReject(app._id)}
                         disabled={actioningId === app._id}
                         className="bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-sm active:translate-y-px flex items-center justify-center"
                       >
                          Decline
                       </button>
                       <button 
                         onClick={() => handleAccept(app._id)}
                         disabled={actioningId === app._id}
                         className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:translate-y-px flex items-center justify-center gap-2"
                       >
                          {actioningId === app._id ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4" />}
                          Activate
                       </button>
                    </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
