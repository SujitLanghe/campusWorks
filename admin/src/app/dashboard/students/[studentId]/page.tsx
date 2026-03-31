"use client";
import React, { useState, useEffect, use } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { 
  Building2, 
  Mail, 
  Target, 
  ChevronLeft, 
  Fingerprint, 
  Calendar, 
  Award,
  Activity,
  ShieldCheck,
  Zap,
  Globe,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Student {
  _id: string;
  name: { firstname: string; lastname: string };
  email: string;
  department: string;
  enrollmentno: string;
  year: string;
  phone: string;
  skills: string[];
  appliedProjects: { 
    _id: string; 
    title: string; 
    status: string;
    professor: {
      name: { firstname: string; lastname: string };
      department: string;
      email: string;
    };
    createdAt: string;
  }[];
}

export default function StudentDetail({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/student-details/${resolvedParams.studentId}`);
        setStudent(data.student);
      } catch (error) {
        toast.error("Failed to intercept student research matrix");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [resolvedParams.studentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 animate-in fade-in duration-700">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl"></div>
        <div className="flex flex-col items-center">
          <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs font-mono">Decoding</p>
          <p className="text-blue-600 font-bold text-sm">Student Performance Data</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-12 text-center bg-white rounded-[40px] border border-gray-100 shadow-sm animate-in zoom-in duration-500 max-w-2xl mx-auto mt-20">
        <AlertCircle className="w-16 h-16 text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Student Not Located</h2>
        <p className="text-gray-500 mb-8 font-medium">The requested student identity does not exist in the secure academic registry.</p>
        <Link href="/dashboard/students" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
          <ChevronLeft className="w-4 h-4" /> Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Navigation Registry */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/students"
          className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] transition-colors group"
        >
          <div className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          Back to Student Directory
        </Link>
        <div className="flex items-center gap-3">
           <span className="flex h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>
           <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Verified Academic Record</span>
        </div>
      </div>

      {/* Identity Profile Card */}
      <div className="bg-white rounded-[48px] border border-gray-100 shadow-2xl shadow-blue-900/5 p-10 md:p-14 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-200/20 transition-colors duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-14 relative z-10">
          <div className="w-32 h-32 md:w-44 md:h-44 bg-white border-[6px] border-blue-50 rounded-[48px] shadow-2xl flex items-center justify-center text-4xl md:text-5xl font-black text-blue-600 relative shrink-0">
             {student.name.firstname[0]}{student.name.lastname[0]}
             <div className="absolute -bottom-4 -right-4 p-4 bg-blue-600 rounded-[20px] shadow-lg shadow-blue-600/20">
                <ShieldCheck className="w-6 h-6 text-white" />
             </div>
          </div>
          
          <div className="flex-1 text-center md:text-left pt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
               <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">{student.name.firstname} {student.name.lastname}</h1>
               <span className="px-5 py-2 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest w-fit mx-auto md:mx-0 shadow-lg shadow-blue-600/20">
                  Year {student.year} Undergraduate
               </span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-10">
               <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500">
                  <Fingerprint className="w-4 h-4 text-blue-500" /> {student.enrollmentno}
               </div>
               <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500">
                  <Building2 className="w-4 h-4 text-blue-500" /> {student.department} Engineering
               </div>
               <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 lowercase">
                  <Mail className="w-4 h-4 text-blue-500" /> {student.email}
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl">
               <div className="flex flex-col gap-1 p-4 bg-gray-50/50 rounded-2xl border border-gray-50 group-hover:bg-white transition-colors duration-500">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Collaboration</span>
                  <span className="text-2xl font-black text-gray-900">{student.appliedProjects?.filter(p => p.status === 'ACCEPTED').length}</span>
               </div>
               <div className="flex flex-col gap-1 p-4 bg-gray-50/50 rounded-2xl border border-gray-50 group-hover:bg-white transition-colors duration-500">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ongoing Tasks</span>
                  <span className="text-2xl font-black text-gray-900">12</span>
               </div>
               <div className="flex flex-col gap-1 p-4 bg-gray-50/50 rounded-2xl border border-gray-50 group-hover:bg-white transition-colors duration-500">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Applications</span>
                  <span className="text-2xl font-black text-gray-900">{student.appliedProjects?.length}</span>
               </div>
               <div className="flex flex-col gap-1 p-4 bg-gray-50/50 rounded-2xl border border-gray-50 group-hover:bg-white transition-colors duration-500">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Skill Rank</span>
                  <span className="text-2xl font-black text-blue-600 truncate">{student.skills?.[0] || 'ADAPT'}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl relative overflow-hidden group/side">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <h4 className="text-white font-black text-lg mb-8 tracking-tight">Technical Proficiency</h4>
               <div className="flex flex-wrap gap-2 mb-10">
                  {student.skills?.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest hover:bg-white hover:text-gray-900 transition-all">
                       {skill}
                    </span>
                  ))}
               </div>
               <div className="space-y-6 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs font-bold">
                     <span className="text-white/40 uppercase tracking-widest">Research Activity</span>
                     <span className="text-blue-400">Stable</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full w-[65%] bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between px-6">
               <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Research Trajectory</h3>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Cross-Department Research Applications</p>
               </div>
               <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-sm">
                  {student.appliedProjects?.length}
               </div>
            </div>

            <div className="space-y-6">
               {student.appliedProjects?.map((project) => (
                  <div key={project._id} className="bg-white border border-gray-100 rounded-[40px] p-8 md:p-10 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group relative overflow-hidden">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                        <div className="flex-1 space-y-6">
                           <div className="flex items-center gap-3">
                              <Target className="w-5 h-5 text-blue-600" />
                              <h5 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{project.title}</h5>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                                 <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center font-bold text-blue-600">
                                    {project.professor?.name?.firstname[0]}
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Supervisor</span>
                                    <span className="text-xs font-bold text-gray-900 line-clamp-1 truncate uppercase">Prof. {project.professor?.name?.firstname} {project.professor?.name?.lastname}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                                 <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                                    <Calendar className="w-5 h-5" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Submission</span>
                                    <span className="text-xs font-bold text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 shrink-0">
                           <span className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.1em] border shadow-sm ${
                              project.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                           }`}>
                              {project.status === 'ACCEPTED' ? 'RESEARCH IN PROGRESS' : project.status}
                           </span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
