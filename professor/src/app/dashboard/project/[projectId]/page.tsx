"use client";
import React, { useState, useEffect, use } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileVideo, 
  Image as ImageIcon, 
  Loader2, 
  Users, 
  Calendar,
  ChevronLeft,
  ArrowUpRight,
  Target,
  Activity,
  Layers,
  Zap,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function ProjectDetails({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [reviewingTask, setReviewingTask] = useState<any | null>(null);
  
  const [assignForm, setAssignForm] = useState({
    title: "",
    description: "",
    deadline: ""
  });
  const [assigning, setAssigning] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/project/${projectId}`);
      setProject(data.project);
      setTasks(data.tasks || []);
      
      if (data.project?.status === "OPEN") {
        const { data: appData } = await api.get(`/applications/${projectId}`);
        setApplicationsCount(appData.applications?.length || 0);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [projectId]);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigning(true);
    try {
      const { data } = await api.post(`/assign-task/${projectId}`, assignForm);
      toast.success(data.message || "Task assigned successfully!");
      setShowAssignModal(false);
      setAssignForm({ title: "", description: "", deadline: "" });
      fetchDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to assign task");
    } finally {
      setAssigning(false);
    }
  };

  const handleReviewAction = async (action: "ACCEPT" | "REJECT") => {
    if (!reviewingTask) return;
    setReviewing(true);
    try {
      const payload = action === "REJECT" 
        ? { action, newDeadline: reviewingTask.deadline } 
        : { action };
      
      const { data } = await api.patch(`/review-task/${reviewingTask._id}`, payload);
      toast.success(data.message || `Task submission ${action.toLowerCase()}ed.`);
      setReviewingTask(null);
      fetchDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Review action failed");
    } finally {
      setReviewing(false);
    }
  };

  const handleCompleteProject = async () => {
    if (!window.confirm("Mark as COMPLETED? This will freeze the research record. Verify all final outcomes before proceeding.")) return;
    setCompleting(true);
    try {
      const { data } = await api.patch(`/complete-project/${projectId}`);
      toast.success(data.message || "Project archived successfully!");
      fetchDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to finalize project");
    } finally {
      setCompleting(false);
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch(status) {
      case "ACTIVE": return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center border border-blue-100"><Clock className="w-3 h-3 mr-1.5"/> Active</span>;
      case "SUBMITTED": return <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center border border-amber-100 animate-pulse"><Zap className="w-3 h-3 mr-1.5"/> Pending Review</span>;
      case "REWORK_REQUIRED": return <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center border border-rose-100"><MessageSquare className="w-3 h-3 mr-1.5"/> Feedback</span>;
      case "ACCEPTED": return <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center border border-emerald-100"><CheckCircle className="w-3 h-3 mr-1.5"/> Completed</span>;
      case "EXPIRED": return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200">Expired</span>;
      default: return <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-100">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="flex flex-col items-center text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Loading Environment</p>
            <p className="text-slate-900 font-bold text-sm">Research Workspace</p>
        </div>
      </div>
    );
  }

  if (!project) return (
     <div className="p-20 text-center bg-white rounded-[40px] border border-slate-200 shadow-sm max-w-2xl mx-auto mt-20">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
          <Target className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Project Not Found</h3>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">The requested research project could not be located in your directory.</p>
        <Link href="/dashboard" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm transition-all hover:bg-slate-800">Return to Dashboard</Link>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Breadcrumbs & Simple Actions */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
          <span className="text-slate-300">/</span>
          <Link href="/dashboard/project" className="hover:text-emerald-600 transition-colors">My Projects</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold truncate max-w-[200px]">{project.title}</span>
        </nav>
        
        <div className="flex items-center gap-3">
          {project.status !== "COMPLETED" && (
            <button 
              onClick={handleCompleteProject}
              disabled={completing}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {completing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              Close Project
            </button>
          )}
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Project Header */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none"></div>
        <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
               <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full border ${project.status === "COMPLETED" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                  {project.status} Project
               </span>
               <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Established {new Date(project.createdAt).toLocaleDateString()}
               </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">{project.title}</h1>
            <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
               Manage milestones, review team submissions, and monitor project velocity in your dedicated research hub.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
             <button 
                onClick={() => setShowAssignModal(true)}
                disabled={project.students.length === 0 || project.status === "COMPLETED"}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-50 disabled:grayscale"
             >
                <PlusCircle className="w-4 h-4" />
                Add Milestone
             </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-100 bg-slate-50/50">
           <div className="p-6 text-center border-r border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Team</p>
              <p className="text-xl font-bold text-slate-900">{project.students.length} <span className="text-sm font-medium text-slate-500 tracking-normal ml-1">Students</span></p>
           </div>
           <div className="p-6 text-center border-r border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Milestones</p>
              <p className="text-xl font-bold text-slate-900">{tasks.length} <span className="text-sm font-medium text-slate-500 tracking-normal ml-1">Total Items</span></p>
           </div>
           <div className="p-6 text-center border-r border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue</p>
              <p className="text-xl font-bold text-emerald-600">{tasks.filter(t => t.status === "SUBMITTED").length} <span className="text-sm font-medium text-emerald-500/60 tracking-normal ml-1">To Review</span></p>
           </div>
           <div className="p-6 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Applicants</p>
              <p className="text-xl font-bold text-slate-900">{applicationsCount} <span className="text-sm font-medium text-slate-500 tracking-normal ml-1">Pending</span></p>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* Milestones / Tasks Column */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg"><Activity className="w-5 h-5 text-emerald-600" /></div>
                  <h2 className="text-lg font-bold text-slate-900">Project Milestones</h2>
               </div>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tasks.length} Total Milestones</span>
            </div>

            <div className="space-y-4">
               {tasks.map(task => (
                 <div key={task._id} className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 hover:border-emerald-200 transition-all group relative">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                       <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black bg-slate-100 text-slate-500 w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200">
                                {task.taskNumber}
                             </span>
                             <div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{task.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                   <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                      <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-300" /> Due {new Date(task.deadline).toLocaleDateString()}
                                   </div>
                                   <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {task._id.slice(-6)}</span>
                                </div>
                             </div>
                          </div>
                          
                          <div 
                             className="text-slate-600 text-sm font-medium leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all"
                             dangerouslySetInnerHTML={{ __html: task.description }}
                          />
                       </div>

                       <div className="flex flex-col items-end gap-3 shrink-0 w-full md:w-auto">
                          {getTaskStatusBadge(task.status)}
                          
                          {task.status === "SUBMITTED" && (
                            <button 
                              onClick={() => setReviewingTask(task)}
                              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
                            >
                              Review Submission <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                       </div>
                    </div>
                 </div>
               ))}

               {tasks.length === 0 && (
                 <div className="py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[32px] text-center">
                    <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-base font-bold text-slate-900 mb-1">No Milestones Found</h3>
                    <p className="text-sm text-slate-400 font-medium">Assign a task to your team to begin project execution.</p>
                 </div>
               )}
            </div>
         </div>

         {/* Sidebar Navigation */}
         <div className="lg:col-span-4 space-y-6">
            {/* Team Access */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
               <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" /> Research Team
               </h3>
               
               {project.students.length === 0 ? (
                 <div className="py-6 text-center bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No team assigned</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                    {project.students.map((student: any) => (
                      <div key={student._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/mem">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-xs text-slate-600 shadow-sm group-hover/mem:text-emerald-600 group-hover/mem:border-emerald-200 transition-all">
                          {student.name.firstname[0]}{student.name.lastname[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{student.name.firstname} {student.name.lastname}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{student.enrollmentno}</p>
                        </div>
                      </div>
                    ))}
                 </div>
               )}

               {project.status === "OPEN" && (
                  <Link href={`/dashboard/project/${projectId}/applications`} className="mt-8 block p-5 bg-emerald-600 rounded-2xl group/recruit hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 text-center">
                    <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1">Recruitment</p>
                    <h4 className="text-white font-bold text-lg">{applicationsCount} Applications</h4>
                  </Link>
               )}
            </div>

            {/* Project Mandate */}
            <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 shadow-xl overflow-hidden relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
               <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" /> Project Scope
               </h3>
               <div className="relative">
                  <div 
                     className={`text-slate-400 text-sm font-medium leading-relaxed overflow-hidden transition-all duration-500 ${isDescriptionExpanded ? 'max-h-[1000px]' : 'max-h-32'}`}
                     dangerouslySetInnerHTML={{ __html: project.description }}
                  />
                  {!isDescriptionExpanded && project.description?.length > 200 && (
                     <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  )}
               </div>
               {project.description?.length > 200 && (
                  <button 
                     onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                     className="mt-4 text-emerald-400 font-bold text-xs hover:text-emerald-300 transition-colors underline-offset-4 hover:underline"
                  >
                     {isDescriptionExpanded ? "Read Less" : "Expand Description"}
                  </button>
               )}
            </div>
         </div>
      </div>

      {/* Add Milestone Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowAssignModal(false)}></div>
           <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl relative z-20 flex flex-col max-h-[90vh] animate-in zoom-in duration-300 border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                 <div>
                    <h3 className="text-xl font-bold text-slate-900">Add Project Milestone</h3>
                    <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">Define a new task for the research team</p>
                 </div>
                 <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"><XCircle className="w-6 h-6" /></button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                 <form onSubmit={handleAssignSubmit} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Milestone Title</label>
                       <input 
                         type="text" required value={assignForm.title}
                         onChange={(e) => setAssignForm({...assignForm, title: e.target.value})}
                         className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                         placeholder="e.g. Literature Review Synthesis"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Deadline Date & Time</label>
                       <input 
                         type="datetime-local" required value={assignForm.deadline}
                         onChange={(e) => setAssignForm({...assignForm, deadline: e.target.value})}
                         className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Requirements & Objectives</label>
                       <textarea 
                         required rows={4} value={assignForm.description}
                         onChange={(e) => setAssignForm({...assignForm, description: e.target.value})}
                         className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none"
                         placeholder="Describe the expected outcomes and technical requirements..."
                       />
                    </div>
                    <button type="submit" disabled={assigning} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]">
                       {assigning ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Deploy Milestone"}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Submission Review Modal */}
      {reviewingTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setReviewingTask(null)}></div>
           <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl relative z-20 flex flex-col max-h-[90vh] animate-in zoom-in duration-300 border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center font-bold text-slate-700">
                       {reviewingTask.submittedBy?.name?.firstname[0]}{reviewingTask.submittedBy?.name?.lastname[0]}
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-slate-900">Submission Assessment</h3>
                       <p className="text-xs font-medium text-slate-400 flex items-center gap-2 mt-1">
                          <Users className="w-3.5 h-3.5" /> {reviewingTask.submittedBy?.name?.firstname} {reviewingTask.submittedBy?.name?.lastname} • {new Date(reviewingTask.submittedAt).toLocaleDateString()}
                       </p>
                    </div>
                 </div>
                 <button onClick={() => setReviewingTask(null)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900"><XCircle className="w-7 h-7" /></button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                 <div className="space-y-8">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1"><Layers className="w-3.5 h-3.5" /> Milestone Objective</h4>
                       <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-sm font-medium text-slate-700 leading-relaxed shadow-inner">
                          {reviewingTask.title}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {reviewingTask.submissionVideoUrl && (
                          <div className="space-y-3">
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1"><FileVideo className="w-3.5 h-3.5 text-blue-500" /> Evidence (Video)</h4>
                             <video src={reviewingTask.submissionVideoUrl} controls className="w-full rounded-2xl border-4 border-slate-100 shadow-lg bg-black aspect-video overflow-hidden" />
                          </div>
                       )}
                       {reviewingTask.submissionImageUrls?.length > 0 && (
                          <div className="space-y-3">
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1"><ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> Evidence (Imagery)</h4>
                             <div className="grid grid-cols-2 gap-3">
                                {reviewingTask.submissionImageUrls.map((url: string, i: number) => (
                                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block relative aspect-[4/3] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden group hover:border-emerald-500 transition-all">
                                     <img src={url} alt="Proof" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                     <div className="absolute inset-0 bg-emerald-600/0 group-hover:bg-emerald-600/5 transition-colors"></div>
                                  </a>
                                ))}
                             </div>
                          </div>
                       )}
                    </div>

                    {!reviewingTask.submissionVideoUrl && (!reviewingTask.submissionImageUrls || reviewingTask.submissionImageUrls.length === 0) && (
                       <div className="py-16 bg-slate-50 border border-dashed border-slate-200 rounded-[32px] text-center">
                          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No visual evidence provided</p>
                       </div>
                    )}
                 </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-4 shrink-0">
                 <button 
                   onClick={() => handleReviewAction("REJECT")} disabled={reviewing}
                   className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
                 >
                    Request Rework <MessageSquare className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => handleReviewAction("ACCEPT")} disabled={reviewing}
                   className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                 >
                    {reviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Accept Submission
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
