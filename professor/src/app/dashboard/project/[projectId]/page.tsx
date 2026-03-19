"use client";
import React, { useState, useEffect, use } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  PlusCircle, CheckCircle, XCircle, Clock, FileVideo, 
  Image as ImageIcon, Loader2, Users, Calendar 
} from "lucide-react";

export default function ProjectDetails({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
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

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/project/${projectId}`);
      setProject(data.project);
      setTasks(data.tasks || []);
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
        ? { action, newDeadline: reviewingTask.deadline } // keeping same deadline for now, can be extended
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
    if (!window.confirm("Are you sure you want to mark this project as COMPLETED? Students will be able to download their certificates and no further tasks can be added. This cannot be undone.")) return;
    setCompleting(true);
    try {
      const { data } = await api.patch(`/complete-project/${projectId}`);
      toast.success(data.message || "Project marked as completed successfully!");
      fetchDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to complete project");
    } finally {
      setCompleting(false);
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch(status) {
      case "ACTIVE": return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><Clock className="w-3 h-3 mr-1"/> Active</span>;
      case "SUBMITTED": return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1"/> Ready for Review</span>;
      case "REWORK_REQUIRED": return <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><XCircle className="w-3 h-3 mr-1"/> Rework Req.</span>;
      case "ACCEPTED": return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1"/> Accepted</span>;
      case "EXPIRED": return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center w-fit">Expired</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (loading) {
     return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${project.status === "COMPLETED" ? "bg-green-100 text-green-800" : project.status === "ONGOING" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
              {project.status}
            </span>
          </div>
          <p className="text-gray-500 max-w-3xl line-clamp-2">{project.description}</p>
        </div>
        
        {project.status !== "COMPLETED" && (
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {project.students.length > 0 && (
              <button 
                onClick={handleCompleteProject}
                disabled={completing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {completing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                Mark Complete
              </button>
            )}
            <button 
              onClick={() => setShowAssignModal(true)}
              disabled={project.students.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-3 rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Assign New Task
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">Project Tasks <span className="ml-3 bg-gray-100 text-gray-600 text-sm py-0.5 px-3 rounded-full">{tasks.length}</span></h2>
          
          {tasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <PlusCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No tasks assigned yet</h3>
              <p className="mt-1 text-gray-500">Create a task and add deadlines for your students to complete.</p>
            </div>
          ) : (
            <div className="space-y-4">
               {tasks.map(task => (
                 <div key={task._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col transition-shadow hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Task #{task.taskNumber}</span>
                        <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                      </div>
                      {getTaskStatusBadge(task.status)}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                      <span className="flex items-center text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                        <Calendar className="w-4 h-4 mr-1"/> Due: {new Date(task.deadline).toLocaleString()}
                      </span>
                    </div>

                    {task.status === "SUBMITTED" && task.submittedBy && (
                      <div className="mt-auto bg-amber-50 border border-amber-200 rounded-lg p-4 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold">
                            {task.submittedBy.name.firstname[0]}{task.submittedBy.name.lastname[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{task.submittedBy.name.firstname} {task.submittedBy.name.lastname} submitted proof</p>
                            <p className="text-xs text-gray-500">{new Date(task.submittedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setReviewingTask(task)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Review Proof
                        </button>
                      </div>
                    )}
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Right Column: Project Team */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Project Team</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {project.students.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p>No students have formed a team yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {project.students.map((student: any) => (
                  <li key={student._id} className="p-4 flex items-center space-x-4 hover:bg-gray-50">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                      {student.name.firstname[0]}{student.name.lastname[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{student.name.firstname} {student.name.lastname}</p>
                      <p className="text-xs text-gray-500 truncate">{student.enrollmentno} • {student.department}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Assign Task Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Assign New Task</h3>
            <p className="text-gray-500 mb-6 text-sm">Create a task assignment for the students in this project.</p>
            
            <form onSubmit={handleAssignSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title</label>
                <input 
                  type="text" 
                  required
                  value={assignForm.title}
                  onChange={(e) => setAssignForm({...assignForm, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                  placeholder="e.g. Design UI Wireframes"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Submission Deadline</label>
                <input 
                  type="datetime-local" 
                  required
                  value={assignForm.deadline}
                  onChange={(e) => setAssignForm({...assignForm, deadline: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Description & Goals</label>
                <textarea 
                  required
                  rows={4}
                  value={assignForm.description}
                  onChange={(e) => setAssignForm({...assignForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none transition-all resize-none"
                  placeholder="Specify exactly what needs to be reviewed..."
                />
              </div>

              <button 
                type="submit" 
                disabled={assigning}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
              >
                {assigning && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                {assigning ? "Assigning..." : "Publish Task to Team"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review Proof Modal */}
      {reviewingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Review Submission: Task #{reviewingTask.taskNumber}</h3>
                <p className="text-sm text-gray-500">Submitted by {reviewingTask.submittedBy?.name?.firstname} {reviewingTask.submittedBy?.name?.lastname}</p>
              </div>
              <button onClick={() => setReviewingTask(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {reviewingTask.submissionVideoUrl && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center"><FileVideo className="w-4 h-4 mr-2 text-blue-500" /> Video Proof</h4>
                  <video src={reviewingTask.submissionVideoUrl} controls className="w-full rounded-lg border border-gray-200 shadow-sm" />
                </div>
              )}

              {reviewingTask.submissionImageUrls?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center"><ImageIcon className="w-4 h-4 mr-2 text-emerald-500" /> Image Proofs</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {reviewingTask.submissionImageUrls.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity">
                        <img src={url} alt={`Proof ${i}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {!reviewingTask.submissionVideoUrl && (!reviewingTask.submissionImageUrls || reviewingTask.submissionImageUrls.length === 0) && (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p>No media files were attached to this submission.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-white grid grid-cols-2 gap-4 shrink-0">
              <button 
                onClick={() => handleReviewAction("REJECT")}
                disabled={reviewing}
                className="w-full border-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold py-3 text-sm rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
              >
                Reject & Request Rework
              </button>
              <button 
                onClick={() => handleReviewAction("ACCEPT")}
                disabled={reviewing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
              >
                {reviewing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Accept Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
