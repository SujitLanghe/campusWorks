"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import {
  BarChart3,
  Users,
  Briefcase,
  FolderOpen,
  Loader2,
  Clock,
  Shield,
  Megaphone,
  Building2,
  TrendingUp,
  Activity
} from "lucide-react";

interface GrowthEntry {
  _id: string;
  count: number;
}

interface DeptBreakdown {
  _id: string;
  count: number;
}

interface LogEntry {
  _id: string;
  action: string;
  category: string;
  performedBy: { name: { firstname: string; lastname: string } } | null;
  createdAt: string;
}

interface Analytics {
  studentGrowth: GrowthEntry[];
  professorGrowth: GrowthEntry[];
  projectGrowth: GrowthEntry[];
  departmentBreakdown: DeptBreakdown[];
  recentLogs: LogEntry[];
}

const categoryColors: Record<string, string> = {
  USER: "text-blue-600 bg-blue-50",
  PROJECT: "text-emerald-600 bg-emerald-50",
  SYSTEM: "text-slate-600 bg-slate-100",
  ANNOUNCEMENT: "text-orange-600 bg-orange-50",
  DEPARTMENT: "text-indigo-600 bg-indigo-50",
};

const categoryIcons: Record<string, any> = {
  USER: Users,
  PROJECT: FolderOpen,
  SYSTEM: Shield,
  ANNOUNCEMENT: Megaphone,
  DEPARTMENT: Building2,
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState<string>("ALL");

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get("/system-analytics");
      setAnalytics(data.analytics);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <div className="flex flex-col items-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Computing</p>
          <p className="text-slate-900 font-bold text-sm">System Analytics</p>
        </div>
      </div>
    );
  }

  const maxGrowth = Math.max(
    ...(analytics?.studentGrowth?.map(g => g.count) || [1]),
    ...(analytics?.professorGrowth?.map(g => g.count) || [1]),
    1
  );

  const maxDept = Math.max(...(analytics?.departmentBreakdown?.map(d => d.count) || [1]), 1);

  const filteredLogs = analytics?.recentLogs?.filter(
    log => logFilter === "ALL" || log.category === logFilter
  ) || [];

  const formatMonth = (dateStr: string) => {
    const [year, month] = dateStr.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-1">
        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
          <span>Admin Control Center</span>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900">System Analytics</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Intelligence</h1>
        <p className="text-slate-500 font-medium tracking-tight">Growth trends, department distribution, and system audit trail.</p>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Growth */}
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Student Growth</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 6 months</p>
              </div>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          {analytics?.studentGrowth?.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-8">No data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {analytics?.studentGrowth?.map((entry, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-black text-slate-900">{entry.count}</span>
                  <div
                    className="w-full bg-blue-500 rounded-t-lg transition-all duration-700 min-h-[4px]"
                    style={{ height: `${(entry.count / maxGrowth) * 100}%` }}
                  ></div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">{formatMonth(entry._id)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Professor Growth */}
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Faculty Growth</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 6 months</p>
              </div>
            </div>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          {analytics?.professorGrowth?.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-8">No data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {analytics?.professorGrowth?.map((entry, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-black text-slate-900">{entry.count}</span>
                  <div
                    className="w-full bg-indigo-500 rounded-t-lg transition-all duration-700 min-h-[4px]"
                    style={{ height: `${(entry.count / maxGrowth) * 100}%` }}
                  ></div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">{formatMonth(entry._id)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Growth */}
        <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Project Growth</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 6 months</p>
              </div>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          {analytics?.projectGrowth?.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-8">No data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {analytics?.projectGrowth?.map((entry, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-black text-slate-900">{entry.count}</span>
                  <div
                    className="w-full bg-emerald-500 rounded-t-lg transition-all duration-700 min-h-[4px]"
                    style={{ height: `${(entry.count / maxGrowth) * 100}%` }}
                  ></div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">{formatMonth(entry._id)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Department Breakdown + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Department Distribution */}
        <div className="lg:col-span-4 bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Distribution</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Students by dept</p>
            </div>
          </div>

          {analytics?.departmentBreakdown?.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-4">
              {analytics?.departmentBreakdown?.map((dept, i) => {
                const colors = ["bg-blue-500", "bg-indigo-500", "bg-emerald-500", "bg-orange-500", "bg-rose-500", "bg-violet-500"];
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700">{dept._id || "Unknown"}</span>
                      <span className="text-xs font-black text-slate-900">{dept.count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-700`}
                        style={{ width: `${(dept.count / maxDept) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity Logs */}
        <div className="lg:col-span-8 bg-white rounded-[28px] border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">System Audit Trail</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent activity</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              {["ALL", "USER", "SYSTEM", "ANNOUNCEMENT", "DEPARTMENT"].map((f) => (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    logFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {f === "ALL" ? "All" : f.slice(0, 4)}
                </button>
              ))}
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 italic">No activity logs recorded yet.</p>
              <p className="text-[10px] text-slate-300 mt-1">Logs will appear as you use the platform.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredLogs.map((log) => {
                const cc = categoryColors[log.category] || categoryColors.SYSTEM;
                const CatIcon = categoryIcons[log.category] || Shield;
                return (
                  <div key={log._id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all group">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${cc.split(" ")[1]}`}>
                      <CatIcon className={`w-3.5 h-3.5 ${cc.split(" ")[0]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-tight">{log.action}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${cc}`}>
                          {log.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {log.performedBy && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            by {log.performedBy.name.firstname}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
