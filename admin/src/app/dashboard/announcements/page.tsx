"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
  Megaphone,
  PlusCircle,
  Trash2,
  Loader2,
  XCircle,
  Users,
  GraduationCap,
  Briefcase,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  AlertCircle,
  Bell,
  Clock,
  Target
} from "lucide-react";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  targetAudience: string;
  priority: string;
  isActive: boolean;
  createdBy: { name: { firstname: string; lastname: string }; email: string } | null;
  createdAt: string;
}

const priorityConfig: Record<string, { color: string; bg: string; icon: any }> = {
  LOW: { color: "text-slate-600", bg: "bg-slate-100", icon: Info },
  MEDIUM: { color: "text-blue-600", bg: "bg-blue-50", icon: Bell },
  HIGH: { color: "text-orange-600", bg: "bg-orange-50", icon: AlertTriangle },
  CRITICAL: { color: "text-rose-600", bg: "bg-rose-50", icon: AlertCircle },
};

const audienceConfig: Record<string, { label: string; icon: any; color: string }> = {
  ALL: { label: "Everyone", icon: Users, color: "text-emerald-600" },
  STUDENT: { label: "Students Only", icon: GraduationCap, color: "text-blue-600" },
  PROFESSOR: { label: "Faculty Only", icon: Briefcase, color: "text-indigo-600" },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [form, setForm] = useState({
    title: "",
    content: "",
    targetAudience: "ALL",
    priority: "MEDIUM"
  });

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements");
      setAnnouncements(data.announcements);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/announcements", form);
      toast.success("Announcement published!");
      setShowModal(false);
      setForm({ title: "", content: "", targetAudience: "ALL", priority: "MEDIUM" });
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to publish");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement permanently?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Announcement removed");
      fetchAnnouncements();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const { data } = await api.patch(`/announcements/${id}/toggle`);
      toast.success(data.message);
      fetchAnnouncements();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    if (filter === "ACTIVE") return a.isActive;
    if (filter === "INACTIVE") return !a.isActive;
    return true;
  });

  const activeCount = announcements.filter(a => a.isActive).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <div className="flex flex-col items-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Loading</p>
          <p className="text-slate-900 font-bold text-sm">Broadcast Center</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Admin Control Center</span>
            <span className="text-slate-200">/</span>
            <span className="text-slate-900">Announcements</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Broadcast Center</h1>
          <p className="text-slate-500 font-medium tracking-tight">Publish platform-wide announcements to students and faculty.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 rounded-2xl text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
        >
          <PlusCircle className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Stats + Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3 flex items-center gap-3 shadow-sm">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
              <p className="text-lg font-bold text-slate-900">{announcements.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3 flex items-center gap-3 shadow-sm">
            <Eye className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</p>
              <p className="text-lg font-bold text-slate-900">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Announcement Cards */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center shadow-sm">
          <Megaphone className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No announcements found</h3>
          <p className="text-slate-500">Create your first announcement to keep everyone informed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => {
            const pConfig = priorityConfig[ann.priority] || priorityConfig.MEDIUM;
            const aConfig = audienceConfig[ann.targetAudience] || audienceConfig.ALL;
            const PriorityIcon = pConfig.icon;
            const AudienceIcon = aConfig.icon;

            return (
              <div
                key={ann._id}
                className={`bg-white rounded-[28px] border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  ann.isActive ? "border-slate-200" : "border-slate-100 opacity-60"
                }`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Priority + Audience Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`${pConfig.bg} ${pConfig.color} px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                          <PriorityIcon className="w-3 h-3" />
                          {ann.priority}
                        </span>
                        <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <AudienceIcon className="w-3 h-3" />
                          {aConfig.label}
                        </span>
                        {!ann.isActive && (
                          <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            Archived
                          </span>
                        )}
                      </div>

                      {/* Title & Content */}
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">{ann.title}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{ann.content}</p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ann.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {ann.createdBy && (
                          <span className="text-[10px] font-bold text-slate-400">
                            by {ann.createdBy.name.firstname} {ann.createdBy.name.lastname}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(ann._id)}
                        className={`p-2.5 rounded-xl transition-all ${
                          ann.isActive
                            ? "text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                            : "text-slate-300 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={ann.isActive ? "Deactivate" : "Activate"}
                      >
                        {ann.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(ann._id)}
                        className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl relative z-20 flex flex-col max-h-[90vh] animate-in zoom-in duration-300 border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">New Announcement</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Broadcast to the platform</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900">
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Title</label>
                  <input
                    type="text" required value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                    placeholder="e.g. Semester Exam Schedule Released"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content</label>
                  <textarea
                    required value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 resize-none h-32"
                    placeholder="Write your announcement message..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                    <select
                      value={form.targetAudience}
                      onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 appearance-none"
                    >
                      <option value="ALL">Everyone</option>
                      <option value="STUDENT">Students Only</option>
                      <option value="PROFESSOR">Faculty Only</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900 appearance-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit" disabled={isSubmitting}
                  className="w-full mt-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Announcement"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
