"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { FileUp, CheckCircle, Clock, XCircle, FileVideo, Image as ImageIcon, Loader2, BookOpen, Download } from "lucide-react";

export default function ApplicationsAndTasks() {
  const [applications, setApplications] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
      case "ACCEPTED":
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Accepted</span>;
      case "REJECTED":
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch(status) {
      case "ACTIVE":
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">Active</span>;
      case "SUBMITTED":
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium">Under Review</span>;
      case "ACCEPTED":
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Accepted</span>;
      case "REWORK_REQUIRED":
        return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">Rework Required</span>;
      case "EXPIRED":
        return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">Expired</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">{status}</span>;
    }
  };

  if (loading) {
     return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Applications Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h2>
        {applications.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm border border-gray-100">You haven't applied to any projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map(app => (
              <div key={app._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg line-clamp-1">{app.project.title}</h3>
                  {getStatusBadge(app.status)}
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{app.message}</p>
                <div className="text-xs text-gray-500 border-t pt-3 flex justify-between items-center">
                  <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                  {app.status === "ACCEPTED" && app.project?.status === "COMPLETED" && (
                    <button 
                      onClick={() => handleDownloadCertificate(app.project._id)}
                      className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" /> Certificate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tasks Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Assigned Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm border border-gray-100">You don't have any assigned tasks right now.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {tasks.map(task => (
                <li key={task._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Task #{task.taskNumber}
                        </span>
                        {getTaskStatusBadge(task.status)}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1"/> {task.project?.title || "Project"}</span>
                        <span className="flex items-center text-red-500 font-medium"><Clock className="w-3 h-3 mr-1"/> Due: {new Date(task.deadline).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div>
                      {task.status === "ACTIVE" || task.status === "REWORK_REQUIRED" ? (
                        <button 
                          onClick={() => setSelectedTask(task)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
                        >
                          <FileUp className="w-4 h-4 mr-2" />
                          Submit Proof
                        </button>
                      ) : task.status === "SUBMITTED" ? (
                        <span className="text-yellow-600 font-medium text-sm flex items-center bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                           Under Review
                        </span>
                      ) : task.status === "ACCEPTED" ? (
                        <span className="text-emerald-600 font-medium text-sm flex items-center bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                           <CheckCircle className="w-4 h-4 mr-1"/> Accepted
                        </span>
                      ) : null }
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Submit Task</h3>
            <p className="text-gray-500 mb-6 text-sm">Upload video or images as proof of completion for <span className="font-semibold text-gray-700">{selectedTask.title}</span>.</p>
            
            <form onSubmit={handleTaskSubmit} className="space-y-5">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileVideo className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">{videoFile ? videoFile.name : "Select Video Proof (Optional)"}</p>
                <p className="text-xs text-gray-500 mt-1">MP4, WebM up to 50MB</p>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => setImageFiles(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <ImageIcon className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">{imageFiles?.length ? `${imageFiles.length} images selected` : "Select Image Proofs (Optional)"}</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB each (Max 5)</p>
              </div>

              <button 
                type="submit" 
                disabled={submitting || (!videoFile && (!imageFiles || imageFiles.length === 0))}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex justify-center items-center"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <FileUp className="w-5 h-5 mr-2" />}
                {submitting ? "Uploading Proofs..." : "Submit Task Proof"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
