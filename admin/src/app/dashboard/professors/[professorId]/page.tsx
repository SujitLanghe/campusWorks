"use client";
import React, { useState, useEffect, use } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { 
  Building2, 
  Mail, 
  Target, 
  Users, 
  ChevronLeft, 
  Loader2, 
  Briefcase, 
  Globe, 
  Award,
  ArrowUpRight,
  PieChart,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Professor {
  _id: string;
  name: { firstname: string; lastname: string };
  email: string;
  department: string;
  designation: string;
  phone: string;
  publishedProjects: { 
    _id: string; 
    title: string; 
    status: string;
    description: string;
    students: {
      _id: string;
      name: { firstname: string; lastname: string };
      email: string;
      enrollmentno: string;
      department: string;
    }[];
  }[];
}

export default function ProfessorDetail({ params }: { params: Promise<{ professorId: string }> }) {
  const resolvedParams = use(params);
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/professor-details/${resolvedParams.professorId}`);
        setProfessor(data.professor);
      } catch (error) {
        toast.error("Failed to recover faculty intelligence");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [resolvedParams.professorId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 animate-in fade-in duration-700">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin shadow-xl"></div>
        <div className="flex flex-col items-center">
          <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Synchronizing</p>
          <p className="text-emerald-600 font-bold text-sm">Faculty Data Stream</p>
        </div>
      </div>
    );
  }

  if (!professor) {
    return (
      <div className="p-12 text-center bg-white rounded-[40px] border border-gray-100 shadow-sm animate-in zoom-in duration-500 max-w-2xl mx-auto mt-20">
        <Target className="w-16 h-16 text-gray-200 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Faculty Member Not Found</h2>
        <p className="text-gray-500 mb-8 font-medium">The requested research profile could not be located in the central registry.</p>
        <Link href="/dashboard/professors" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">
          <ChevronLeft className="w-4 h-4" /> Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/professors"
          className="flex items-center gap-2 text-gray-400 hover:text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] transition-colors group"
        >
          <div className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          Back to Faculty Directory
        </Link>
        <div className="flex items-center gap-3">
           <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Active Research Profile</span>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-[48px] border border-gray-100 shadow-2xl shadow-emerald-900/5 p-10 md:p-14 relative overflow-hidden group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-emerald-200/20 transition-colors duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-14 relative z-10">
          <div className="w-32 h-32 md:w-44 md:h-44 bg-white border-[6px] border-emerald-50 rounded-[48px] shadow-2xl flex items-center justify-center text-4xl md:text-5xl font-black text-emerald-600 relative shrink-0">
             {professor.name.firstname[0]}{professor.name.lastname[0]}
             <div className="absolute -bottom-4 -right-4 p-4 bg-emerald-600 rounded-[20px] shadow-lg shadow-emerald-600/20">
                <Briefcase className="w-6 h-6 text-white" />
             </div>
          </div>
          
          <div className="flex-1 text-center md:text-left pt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
               <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Prof. {professor.name.firstname} {professor.name.lastname}</h1>
               <span className="px-5 py-2 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest w-fit mx-auto md:mx-0 shadow-lg shadow-emerald-600/20">
                  {professor.designation || 'FACULTY'}
               </span>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-10">
               <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500">
                  <Building2 className="w-4 h-4 text-emerald-500" /> {professor.department}
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 lowercase">
                  <Mail className="w-4 h-4 text-emerald-500" /> {professor.email}
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
               <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Projects</span>
                  <span className="text-2xl font-black text-gray-900">{professor.publishedProjects?.filter(p => p.status === 'ONGOING').length}</span>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Completed</span>
                  <span className="text-2xl font-black text-gray-900">{professor.publishedProjects?.filter(p => p.status === 'COMPLETED').length}</span>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Published</span>
                  <span className="text-2xl font-black text-gray-900">{professor.publishedProjects?.length}</span>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Researchers</span>
                  <span className="text-2xl font-black text-gray-900">
                    {professor.publishedProjects?.reduce((acc, curr) => acc + (curr.students?.length || 0), 0)}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
         
         {/* Sidebar Stats */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <h4 className="text-white font-black text-lg mb-8 tracking-tight">Research Impact</h4>
               <div className="space-y-6">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl group hover:bg-white/10 transition-all cursor-default">
                     <div className="flex justify-between items-center mb-4">
                        <Award className="w-6 h-6 text-emerald-400" />
                         <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-lg">TOP PERFORMANCE</span>
                     </div>
                     <p className="text-white font-black text-2xl tracking-tighter mb-1">Peer Recognition</p>
                     <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Lead Research Supervisor</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                     <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-white/40 uppercase tracking-widest">Active Trajectory</span>
                        <span className="text-emerald-400">88% Completion Rate</span>
                     </div>
                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full w-[88%] bg-emerald-500 rounded-full"></div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
               <h4 className="text-gray-900 font-extrabold text-sm uppercase tracking-widest border-b border-gray-50 pb-6">Faculty Intelligence</h4>
               <div className="space-y-6 text-sm font-medium text-gray-500">
                  <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-gray-50 rounded-xl"><Globe className="w-5 h-5 text-gray-400" /></div>
                     <span>Global Academic Network</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-gray-50 rounded-xl"><PieChart className="w-5 h-5 text-gray-400" /></div>
                     <span>Department High Resource</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-gray-50 rounded-xl"><ArrowUpRight className="w-5 h-5 text-gray-400" /></div>
                     <span>Strategic Problem Solver</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Projects Section */}
         <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between px-4">
               <div className="space-y-1">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Problem Statements</h3>
                  <p className="text-gray-400 font-medium text-sm">Full lifecycle oversight of published research goals.</p>
               </div>
               <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Registry Secure</span>
               </div>
            </div>

            <div className="space-y-6">
               {professor.publishedProjects?.map((project) => (
                  <div key={project._id} className="bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                     {/* Card Header */}
                     <div className="p-8 md:p-10 bg-slate-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                              <Target className="w-6 h-6" />
                           </div>
                           <div>
                              <h5 className="text-lg font-black text-gray-900 group-hover:text-emerald-600 transition-colors">{project.title}</h5>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Research Reference: #{project._id.slice(-8)}</p>
                           </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border border-emerald-100 bg-white text-emerald-700 shadow-sm whitespace-nowrap w-fit`}>
                           {project.status}
                        </span>
                     </div>
                     
                     {/* Description Preview */}
                     <div className="p-8 md:p-10 border-b border-gray-50">
                        <div 
                          className="prose prose-sm max-w-none text-gray-600 line-clamp-3 font-medium leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: project.description }}
                        />
                     </div>

                     {/* Student Team Grid */}
                     <div className="p-8 md:p-10 bg-white">
                         <div className="flex items-center justify-between mb-8">
                            <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Assigned Student Researchers</h6>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                               {project.students?.length} MEMBERS
                            </span>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {project.students?.map((student) => (
                               <div key={student._id} className="p-5 bg-slate-50/50 border border-gray-100 rounded-3xl flex items-center gap-5 hover:bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 transition-all">
                                  <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center font-black text-emerald-600 shadow-sm">
                                     {student.name.firstname[0]}{student.name.lastname[0]}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                     <span className="text-sm font-black text-gray-900 truncate">{student.name.firstname} {student.name.lastname}</span>
                                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{student.enrollmentno} • {student.department}</span>
                                  </div>
                               </div>
                            ))}
                            {(!project.students || project.students.length === 0) && (
                              <div className="col-span-full py-8 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3">
                                 <Users className="w-8 h-8 text-gray-200" />
                                 <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">No active researchers assigned</p>
                              </div>
                            )}
                         </div>
                     </div>
                  </div>
               ))}

               {(!professor.publishedProjects || professor.publishedProjects.length === 0) && (
                 <div className="p-20 bg-white border border-dashed border-gray-100 rounded-[48px] text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-gray-100">
                       <Award className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Portfolio is Empty</h3>
                    <p className="text-gray-400 font-medium max-w-sm mx-auto">This faculty member has not yet published any problem statements to the research directory.</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
