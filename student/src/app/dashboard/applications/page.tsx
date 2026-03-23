"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  FileUp, CheckCircle, Clock, XCircle, FileVideo, ImageIcon, 
  Loader2, BookOpen, Download, ChevronDown, ChevronUp, Layers
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

  // States for Task Submission
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
      toast.error(error.response?.data?.message || "Failed to load applications and tasks");
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
      await fetchData(); // refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Task submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificate = async (projectId: string) => {
    try {
      toast.loading("Generating certificate...", { id: `cert-${projectId}` });
      const response = await api.get(`/certificate/${projectId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${projectId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Certificate downloaded successfully!", { id: `cert-${projectId}` });
    } catch (error: any) {
      toast.error("Failed to download certificate. Please ensure the project is fully completed.", { id: `cert-${projectId}` });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDING":
        return <span className="bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5"/> Under Review</span>;
      case "ACCEPTED":
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1.5"/> Accepted</span>;
      case "REJECTED":
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center"><XCircle className="w-3.5 h-3.5 mr-1.5"/> Rejected</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch(status) {
      case "ACTIVE":
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Active</span>;
      case "SUBMITTED":
        return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Under Review</span>;
      case "ACCEPTED":
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Accepted</span>;
      case "REWORK_REQUIRED":
        return <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Needs Rework</span>;
      case "EXPIRED":
        return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Expired</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-200 shadow-sm">
         <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
         <span className="text-gray-500 font-medium tracking-wide">Fetching applications matrix...</span>
       </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Clean Page Header */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Active Applications</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl">
            Track your ongoing problem statements, review task assignments from professors, and seamlessly upload progress proofs.
          </p>
        </div>
      </div>

      <section>
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center max-w-3xl mx-auto">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You haven't submitted any applications for problem statements yet. Visit the Explore page to find a project and apply!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => {
              const isExpanded = expandedAppId === app._id;
              const projectTasks = tasks.filter(t => {
                const pId = typeof t.project === 'object' ? t.project?._id : t.project;
                const aId = typeof app.project === 'object' ? app.project?._id : app.project;
                return pId === aId;
              });

              return (
                <div key={app._id} className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-blue-300 shadow-md transform -translate-y-0.5' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}>
                  
                  {/* Card Header (Row) */}
                  <div 
                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                    onClick={() => setExpandedAppId(prev => prev === app._id ? null : app._id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-2">
                        {getStatusBadge(app.status)}
                        <h3 className="font-extrabold text-xl text-gray-900 line-clamp-1">{app.project?.title || "Unknown Project"}</h3>
                      </div>
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {app.status === "ACCEPTED" && app.project?.status === "COMPLETED" && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownloadCertificate(app.project?._id); }}
                          className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center bg-white border border-emerald-300 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors shadow-sm text-sm"
                        >
                          <Download className="w-4 h-4 mr-2 text-emerald-600" /> Certificate
                        </button>
                      )}
                      <div className={`p-2.5 rounded-lg border transition-colors ${isExpanded ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content Area */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-slate-50/70 p-6 sm:p-8 animate-in slide-in-from-top-2 duration-300">
                      
                      <div className="mb-8">
                        <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center">
                          <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Project Overview
                        </h4>
                        
                        <div className="relative">
                          <div 
                            className={`prose prose-sm text-gray-700 text-sm mb-5 leading-relaxed bg-white border border-gray-100 p-5 rounded-xl shadow-sm transition-all duration-300 overflow-hidden ${expandedDescProjects.has(app.project?._id) ? 'max-h-[2000px]' : 'max-h-32'}`}
                            dangerouslySetInnerHTML={{ __html: app.project?.description || "No description provided." }}
                          />
                          {app.project?.description && app.project.description.length > 200 && (
                            <button 
                              onClick={() => toggleDescExpand(app.project?._id)}
                              className="text-blue-600 hover:text-blue-700 text-xs font-bold mb-4 flex items-center gap-1 transition-colors"
                            >
                              {expandedDescProjects.has(app.project?._id) ? "Show Less" : "Read More..." }
                            </button>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          {app.project?.duration && (
                            <div className="flex items-center text-gray-700 font-bold bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                              <span className="text-orange-500 mr-2 uppercase tracking-wide text-[10px]">Timeline</span>
                              {app.project.duration}
                            </div>
                          )}
                          {app.project?.skillsRequired && app.project.skillsRequired.length > 0 && (
                            <div className="flex flex-col bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto">
                              <span className="text-blue-500 mr-2 uppercase tracking-wide text-[10px] font-bold mb-1.5">Required Stack</span>
                              <div className="flex flex-wrap gap-1.5">
                                {app.project.skillsRequired.map((skill: string, i: number) => (
                                  <span key={i} className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200 text-xs font-bold uppercase">{skill}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Internal Tasks Section */}
                      {app.status === "ACCEPTED" ? (
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Milestones & Tasks</h4>
                          {projectTasks.length === 0 ? (
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                              <p className="text-sm font-semibold text-gray-500">The professor has not assigned any milestones to this problem statement yet.</p>
                            </div>
                          ) : (
                            <ul className="grid grid-cols-1 gap-4">
                              {projectTasks.map(task => (
                                <li key={task._id} className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 transition-colors shadow-sm relative overflow-hidden group hover:border-blue-300 hover:shadow-md">
                                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 pl-3">
                                    <div className="flex-1 space-y-2.5">
                                      <div className="flex items-center space-x-3">
                                        <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded">
                                          Task #{task.taskNumber}
                                        </span>
                                        {getTaskStatusBadge(task.status)}
                                      </div>
                                      <h4 className="text-lg font-bold text-gray-900 leading-tight">{task.title}</h4>
                                      <p className="text-sm text-gray-600">{task.description}</p>
                                      
                                      <div className="flex flex-wrap items-center mt-3 pt-3 border-t border-gray-50 gap-4">
                                        <span className="flex items-center text-xs font-bold uppercase tracking-wide text-rose-500">
                                          <Clock className="w-3.5 h-3.5 mr-1"/> Due: {new Date(task.deadline).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="lg:w-48 xl:w-56 mt-2 lg:mt-0 flex-shrink-0 flex items-center lg:justify-end">
                                      {task.status === "ACTIVE" || task.status === "REWORK_REQUIRED" ? (
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm border border-transparent shadow-blue-600/20 hover:-translate-y-px hover:shadow-lg flex items-center justify-center"
                                        >
                                          <FileUp className="w-4 h-4 mr-2" />
                                          Submit Proof
                                        </button>
                                      ) : task.status === "SUBMITTED" ? (
                                        <div className="w-full text-center text-yellow-700 font-bold text-sm bg-yellow-50 px-5 py-3 rounded-xl border border-yellow-200">
                                          Under Review
                                        </div>
                                      ) : task.status === "ACCEPTED" ? (
                                        <div className="w-full justify-center flex items-center text-emerald-700 font-bold text-sm bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-200">
                                          <CheckCircle className="w-4 h-4 mr-1.5"/> Accepted
                                        </div>
                                      ) : null }
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
                          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-400 to-emerald-400"></div>
                          <BookOpen className="w-8 h-8 text-blue-300" />
                          <p className="font-extrabold text-blue-900 text-lg">Application Matrix is Locked</p>
                          <p className="text-sm text-blue-700 max-w-lg">
                            Internal milestones, task tracking, and communication channels will instantly unlock and appear here once your application is formally accepted by the faculty supervisor.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Submission Modal Window */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedTask(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
            >
              <XCircle className="w-5 h-5" />
            </button>
            
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Upload Proof</h3>
            <p className="text-gray-500 mb-8 max-w-md leading-relaxed">Submit your completed files, screenshot validations, or video walkthroughs for <span className="font-bold text-gray-800">{selectedTask.title}</span>.</p>
            
            <form onSubmit={handleTaskSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-blue-50/50 hover:border-blue-400 transition-colors cursor-pointer relative bg-slate-50">
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 group-hover:bg-blue-100 group-hover:border-blue-200 transition-colors mb-4">
                    <FileVideo className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{videoFile ? videoFile.name : "Select Video File"}</p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">MP4 / WEBM</p>
                </div>

                <div className="group border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-emerald-50/50 hover:border-emerald-400 transition-colors cursor-pointer relative bg-slate-50">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={(e) => setImageFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 group-hover:bg-emerald-100 group-hover:border-emerald-200 transition-colors mb-4">
                    <ImageIcon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{imageFiles?.length ? `${imageFiles.length} files selected` : "Select Screenshots"}</p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">PNG / JPG (MAX 5)</p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={submitting || (!videoFile && (!imageFiles || imageFiles.length === 0))}
                  className="w-full bg-slate-900 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold text-lg py-4 rounded-xl transition-all flex justify-center items-center shadow-xl shadow-slate-900/20 disabled:shadow-none"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileUp className="w-5 h-5 mr-2" />}
                  {submitting ? "Uploading Securely..." : "Finalize & Submit Task"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
