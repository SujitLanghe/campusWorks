"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
  Megaphone,
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Users,
  GraduationCap,
  Briefcase,
  Clock,
  Target,
  Eye
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

const priorityConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  LOW: { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: Info },
  MEDIUM: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Bell },
  HIGH: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: AlertTriangle },
  CRITICAL: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: AlertCircle },
};

const audienceConfig: Record<string, { label: string; icon: any }> = {
  ALL: { label: "Everyone", icon: Users },
  STUDENT: { label: "Students", icon: GraduationCap },
  PROFESSOR: { label: "Faculty", icon: Briefcase },
};

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Megaphone className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500">Stay updated with the latest campus-wide notices.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Megaphone className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-700">{announcements.length} Announcements</span>
        </div>
        {announcements.filter(a => a.priority === "CRITICAL" || a.priority === "HIGH").length > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">
              {announcements.filter(a => a.priority === "CRITICAL" || a.priority === "HIGH").length} Urgent
            </span>
          </div>
        )}
      </div>

      {/* Announcements */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No announcements right now</h3>
          <p className="text-gray-500 text-sm">Check back later for campus updates and notices.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const pConfig = priorityConfig[ann.priority] || priorityConfig.MEDIUM;
            const aConfig = audienceConfig[ann.targetAudience] || audienceConfig.ALL;
            const PriorityIcon = pConfig.icon;
            const AudienceIcon = aConfig.icon;

            return (
              <div
                key={ann._id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  ann.priority === "CRITICAL" ? "border-rose-200 ring-1 ring-rose-100" :
                  ann.priority === "HIGH" ? "border-orange-200" :
                  "border-gray-200"
                }`}
              >
                {/* Critical banner */}
                {ann.priority === "CRITICAL" && (
                  <div className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest text-center py-1.5">
                    ⚡ Critical Notice — Please Read Immediately
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Priority Icon */}
                    <div className={`${pConfig.bg} p-3 rounded-xl flex-shrink-0 mt-0.5`}>
                      <PriorityIcon className={`w-5 h-5 ${pConfig.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`${pConfig.bg} ${pConfig.color} px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider`}>
                          {ann.priority}
                        </span>
                        <span className="bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <AudienceIcon className="w-2.5 h-2.5" />
                          {aConfig.label}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{ann.content}</p>

                      <div className="flex items-center gap-4 pt-1">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ann.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {ann.createdBy && (
                          <span className="text-xs text-gray-400">
                            by {ann.createdBy.name.firstname} {ann.createdBy.name.lastname}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
