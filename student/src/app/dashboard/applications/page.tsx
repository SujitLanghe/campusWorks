"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileVideo, 
  Image as ImageIcon, 
  Loader2, 
  Download, 
  ChevronDown, 
  Layers,
  Target,
  Zap,
  ShieldCheck,
  Activity,
  Calendar,
  Sparkles,
  Archive,
  ArrowRight,
  ClipboardList
} from "lucide-react";

export default function ApplicationsAndTasks() {
  const [applications, setApplications] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [expandedDescProjects, setExpandedDescProjects] = useState<Set<string>>(new Set());

  const toggleDescExpand = (id: string) => {
    const newSet = new Set(expandedDescProjects);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedDescProjects(newSet);
  };

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appRes, taskRes] = await Promise.all([
        api.get("/applied-projects"),
        api.get("/tasks")
      ]);
      setApplications(appRes.data.applications || []);
      setTasks(taskRes.data.tasks || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    if (!videoFile && (!imageFiles || imageFiles.length === 0)) {
      toast.error("Please provide either a video or images as proof.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    if (videoFile) formData.append("video", videoFile);
    if (imageFiles) {
      Array.from(imageFiles).forEach(file => formData.append("images", file));
    }

    try {
      const { data } = await api.post(`/submit-task/${selectedTask._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(data.message || "Task submitted successfully!");
      setSelectedTask(null);
      setVideoFile(null);
      setImageFiles(null);
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Task submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificate = async (projectId: string) => {
    try {
      toast.loading("Generating Certificate...", { id: `cert-${projectId}` });
      const response = await api.get(`/certificate/${projectId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Certificate downloaded!", { id: `cert-${projectId}` });
    } catch (error: any) {
      toast.error("Ensure the project is marked COMPLETED before downloading.", { id: `cert-${projectId}` });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDING":
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center"><Clock className="w-3 h-3 mr-1.5"/> Pending Review</span>;
      case "ACCEPTED":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center"><CheckCircle className="w-3 h-3 mr-1.5"/> Active Project</span>;
      case "REJECTED":
        return <span className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center"><XCircle className="w-3 h-3 mr-1.5"/> Application Declined</span>;
      default:
        return <span className="bg-gray-50 text-gray-700 border border-gray-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch(status) {
      case "ACTIVE":
        return <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100">Working</span>;
      case "SUBMITTED":
        return <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-100">Under Review</span>;
      case "ACCEPTED":
        return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-100"><CheckCircle className="w-3 h-3"/> Completed</span>;
      case "REWORK_REQUIRED":
        return <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-orange-100">Needs Rework</span>;
      default:
        return <span className="bg-gray-50 text-gray-500 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-gray-100">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-400 font-medium text-sm animate-pulse uppercase tracking-[0.2em]">Syncing Your Records</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      
      {/* Clean Dashboard Header */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><ClipboardList className="w-5 h-5" /></div>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Student Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">Active Applications</h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
            Track your research participation, manage assigned tasks, and submit your project progress.
          </p>
        </div>
        
        <div className="flex items-center gap-8 bg-gray-50 p-6 rounded-[24px] border border-gray-100">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Filed</span>
              <span className="text-3xl font-bold text-gray-900 tracking-tight">{applications.length}</span>
           </div>
           <div className="h-10 w-px bg-gray-200"></div>
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Units</span>
              <span className="text-3xl font-bold text-emerald-600 tracking-tight">{applications.filter(a => a.status === 'ACCEPTED').length}</span>
           </div>
        </div>
      </div>

      <section className="space-y-6">
        {applications.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-20 text-center max-w-2xl mx-auto">
            <Archive className="w-12 h-12 text-gray-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              Ready to start your research journey? Explore available projects from faculty members and file your first application.
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">
               Explore Open Projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map(app => {
              const isExpanded = expandedAppId === app._id;
              const projectTasks = tasks.filter(t => {
                const pId = typeof t.project === 'object' ? t.project?._id : t.project;
                const aId = typeof app.project === 'object' ? app.project?._id : app.project;
                return pId === aId;
              });

              return (
                <div key={app._id} className={`bg-white rounded-[32px] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-200 shadow-xl ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'}`}>
                  
                  {/* Collapsed Row */}
                  <div 
                    className="p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 select-none"
                    onClick={() => setExpandedAppId(prev => prev === app._id ? null : app._id)}
                  >
                    <div className="flex-1 flex flex-col md:flex-row gap-6 items-start md:items-center">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${app.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                          <Layers className="w-6 h-6" />
                       </div>
                       <div className="flex-1 space-y-1">
                          <div className="flex items-center flex-wrap gap-3">
                             <h3 className={`font-bold text-xl tracking-tight transition-colors ${isExpanded ? 'text-blue-600' : 'text-gray-900'}`}>{app.project?.title || "Untitled Project"}</h3>
                             {getStatusBadge(app.status)}
                          </div>
                          <p className="text-gray-400 font-medium text-xs flex items-center gap-2">
                             <Calendar className="w-3.5 h-3.5" /> Applied on {new Date(app.createdAt).toLocaleDateString()}
                             <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                             ID: #{app._id.slice(-6).toUpperCase()}
                          </p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      {app.status === "ACCEPTED" && app.project?.status === "COMPLETED" && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownloadCertificate(app.project?._id); }}
                          className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm"
                        >
                           <Download className="w-3.5 h-3.5" /> Download Certificate
                        </button>
                      )}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border ${isExpanded ? 'bg-blue-50 border-blue-100 text-blue-600 rotate-180' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="bg-slate-50/50 border-t border-gray-50 p-8 md:p-10 animate-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                         
                         {/* Project Overview Sidebar */}
                         <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
                               <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                  <Activity className="w-3.5 h-3.5 text-blue-500" /> Overview
                                </h4>
                               
                               <div className="relative">
                                  <div 
                                    className={`text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none transition-all duration-500 overflow-hidden ${expandedDescProjects.has(app.project?._id) ? 'max-h-[1000px]' : 'max-h-24'}`}
                                    dangerouslySetInnerHTML={{ __html: app.project?.description || "No description available." }}
                                  />
                                  {!expandedDescProjects.has(app.project?._id) && app.project?.description?.length > 150 && (
                                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                                  )}
                               </div>
                               
                               {app.project?.description?.length > 150 && (
                                 <button onClick={() => toggleDescExpand(app.project?._id)} className="text-blue-600 font-bold text-xs hover:text-blue-700 transition-colors">
                                    {expandedDescProjects.has(app.project?._id) ? "Show Less" : "Read More"}
                                 </button>
                               )}

                               <div className="pt-6 border-t border-gray-50 space-y-4">
                                  <div className="flex items-center justify-between">
                                     <span className="text-[10px] font-bold text-gray-400 uppercase">Supervisor</span>
                                     <span className="text-xs font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">Prof. {app.project?.professor?.name?.firstname} {app.project?.professor?.name?.lastname}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                     <span className="text-[10px] font-bold text-gray-400 uppercase">Est. Duration</span>
                                     <span className="text-xs font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">{app.project?.duration || 'Unset'}</span>
                                  </div>
                               </div>
                            </div>
                         </div>

                         {/* Tasks Section */}
                         <div className="lg:col-span-8 space-y-6">
                            {app.status === "ACCEPTED" ? (
                              <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                   <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                      <Target className="w-5 h-5 text-blue-600" /> Milestone Tracking
                                   </h4>
                                   <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{projectTasks.length} Assigned</span>
                                </div>
                                
                                {projectTasks.length === 0 ? (
                                  <div className="bg-white p-12 rounded-[24px] border border-gray-100 shadow-sm text-center">
                                    <Sparkles className="w-10 h-10 text-blue-100 mx-auto mb-4" />
                                    <p className="text-sm font-medium text-gray-400">Your supervisor hasn't assigned any tasks yet.</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-4">
                                    {projectTasks.map(task => (
                                      <div key={task._id} className="bg-white p-6 rounded-[24px] border border-gray-100 hover:border-blue-100 hover:shadow-lg transition-all group flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden">
                                        <div className="flex-1 space-y-4">
                                          <div className="flex items-center gap-3">
                                            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100">Milestone {task.taskNumber}</span>
                                            {getTaskStatusBadge(task.status)}
                                          </div>
                                          <h5 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</h5>
                                          <div 
                                            className="text-sm text-gray-500 font-medium leading-relaxed prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: task.description }}
                                          />
                                          <div className="flex items-center text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100 w-fit">
                                            <Clock className="w-3.5 h-3.5 mr-2" /> Deadline: {new Date(task.deadline).toLocaleString()}
                                          </div>
                                        </div>
                                        
                                        <div className="shrink-0 md:w-48">
                                          {(task.status === "ACTIVE" || task.status === "REWORK_REQUIRED") ? (
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                                              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-2 active:scale-95 group/btn"
                                            >
                                              Submit Task <Zap className="w-4 h-4 group-hover/btn:scale-110" />
                                            </button>
                                          ) : task.status === "SUBMITTED" ? (
                                            <div className="w-full text-center py-4 rounded-xl border border-amber-100 bg-amber-50 text-amber-700 font-bold text-[10px] uppercase tracking-wider">
                                              Review in Progress
                                            </div>
                                          ) : task.status === "ACCEPTED" ? (
                                            <div className="w-full text-center py-4 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2">
                                              <ShieldCheck className="w-4 h-4"/> Task Verified
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-12 rounded-[24px] border border-dashed border-gray-200 flex flex-col items-center text-center space-y-4">
                                <Archive className="w-10 h-10 text-gray-300" />
                                <div>
                                   <h5 className="font-bold text-gray-700 mb-1">Tasks Section Locked</h5>
                                   <p className="text-xs text-gray-400 max-w-xs mx-auto">Tasks will become available once your application is accepted by the faculty supervisor.</p>
                                </div>
                              </div>
                            )}
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Task Submission Portal Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedTask(null)}></div>
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl relative z-10 animate-in zoom-in duration-300 border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
               <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Submit Task Proof</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Proof of Work Submission Portal</p>
               </div>
               <button onClick={() => setSelectedTask(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"><XCircle className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleTaskSubmit} className="p-8 space-y-8 overflow-y-auto">
              <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                 <h6 className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1">Current Task</h6>
                 <p className="font-bold text-blue-900 text-lg leading-tight">{selectedTask.title}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="relative group overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 rounded-[24px] p-6 text-center hover:border-blue-500 hover:bg-white transition-all cursor-pointer">
                    <input 
                      type="file" accept="video/*" 
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:shadow-lg mx-auto mb-4 transition-all">
                       <FileVideo className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-gray-900 truncate px-2">{videoFile ? videoFile.name : "Video Proof"}</p>
                    <p className="text-[9px] font-medium text-gray-400 mt-1 uppercase">MP4/WEBM FORMAT</p>
                 </div>

                 <div className="relative group overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 rounded-[24px] p-6 text-center hover:border-emerald-500 hover:bg-white transition-all cursor-pointer">
                    <input 
                      type="file" multiple accept="image/*" 
                      onChange={(e) => setImageFiles(e.target.files)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-emerald-600 group-hover:shadow-lg mx-auto mb-4 transition-all">
                       <ImageIcon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-gray-900 truncate px-2">{imageFiles?.length ? `${imageFiles.length} Images Selected` : "Image Proof"}</p>
                    <p className="text-[9px] font-medium text-gray-400 mt-1 uppercase">JPG/PNG FORMAT</p>
                 </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={submitting || (!videoFile && (!imageFiles || imageFiles.length === 0))}
                  className="w-full py-5 bg-gray-900 text-white font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none active:scale-95"
                >
                  {submitting ? "Uploading Materials..." : "Submit Task Proof"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
