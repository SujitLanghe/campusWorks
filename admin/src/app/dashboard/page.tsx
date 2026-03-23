"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  Activity,
  User,
  ExternalLink
} from "lucide-react";

interface Stats {
  totalStudents: number;
  totalProfessors: number;
  totalProjects: number;
  activeInternships: number;
  completedProjects: number;
}

interface ActivityItem {
  _id: string;
  type: string;
  student: { firstname: string; lastname: string };
  project: string;
  status: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get("/stats"),
          api.get("/activities")
        ]);
        setStats(statsRes.data.stats);
        setActivities(activitiesRes.data.activities);
      } catch (error) {
        toast.error("Failed to load system metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading Metrics</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats?.totalStudents, icon: Users, color: "bg-blue-500" },
    { label: "Faculty Members", value: stats?.totalProfessors, icon: Briefcase, color: "bg-violet-500" },
    { label: "Problem Statements", value: stats?.totalProjects, icon: TrendingUp, color: "bg-emerald-500" },
    { label: "Active Research", value: stats?.activeInternships, icon: Clock, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Overview</h1>
          <p className="text-gray-500 font-medium">Monitoring university research activities and collaboration hubs.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
          <span className="flex h-3 w-3 rounded-full bg-emerald-500 ml-2 animate-pulse"></span>
          <span className="text-xs font-bold text-gray-700 pr-4">System Online & Synchronized</span>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.color} p-3 rounded-2xl shadow-lg shadow-${card.color.split('-')[1]}-500/20`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3 mr-1" /> Live
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-2.5 rounded-xl">
                <Activity className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Recent Interactions</h3>
            </div>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest">View Master Logs</button>
          </div>
          
          <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-[500px] scrollbar-hide">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                <div className="bg-gray-50 p-4 rounded-full border border-gray-100">
                  <Clock className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No activity recorded yet</p>
              </div>
            ) : (
              activities.map((activity, idx) => (
                <div key={idx} className="flex gap-6 relative group">
                  {idx !== activities.length - 1 && (
                    <div className="absolute left-[22px] top-10 bottom-[-40px] w-0.5 bg-gray-100 group-last:hidden"></div>
                  )}
                  <div className="flex-shrink-0 w-11 h-11 bg-slate-50 border border-gray-100 rounded-2xl flex items-center justify-center relative z-10 shadow-sm group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors">
                    <User className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">
                        {activity.student?.firstname} {activity.student?.lastname}
                        <span className="mx-2 text-gray-300 font-normal">applied for</span>
                        <span className="text-emerald-600">{activity.project}</span>
                      </p>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        activity.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {activity.status}
                      </span>
                      <p className="text-xs font-medium text-gray-500 italic">#{activity._id.slice(-6)} Trace ID</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions / System Health */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="text-xl font-extrabold text-white tracking-tight relative z-10">Quick Oversight</h3>
            <div className="grid grid-cols-1 gap-3 relative z-10">
              <button className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/15 rounded-2xl text-white font-bold text-sm transition-all border border-white/10">
                <span className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-400" /> Verify Projects
                </span>
                <CheckCircle2 className="w-4 h-4 text-white/40" />
              </button>
              <button className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/15 rounded-2xl text-white font-bold text-sm transition-all border border-white/10">
                <span className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-blue-400" /> Export Faculty Data
                </span>
                <ExternalLink className="w-4 h-4 text-white/40" />
              </button>
            </div>
            <div className="mt-4 pt-6 border-t border-white/10">
               <div className="flex justify-between items-center mb-4">
                 <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Server Load</p>
                 <p className="text-xs font-black text-emerald-400">OPTIMAL</p>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full w-[12%] bg-emerald-500 rounded-full"></div>
               </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Platform Status</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Project Engine</span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Auth Gateway</span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">SECURE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Certs & Proofs</span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">IDLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
