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
  ExternalLink,
  PlusCircle,
  XCircle,
  Loader2,
  Phone,
  BookOpen,
  GraduationCap
} from "lucide-react";

interface Stats {
  totalStudents: number;
  totalProfessors: number;
  totalProjects: number;
  activeInternships: number;
  completedProjects: number;
  professorsInInternship: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showProfessorModal, setShowProfessorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [studentForm, setStudentForm] = useState({
    firstname: "", lastname: "", email: "", enrollmentno: "", 
    password: "", department: "IT", year: "FY", phone: ""
  });

  const [professorForm, setProfessorForm] = useState({
    firstname: "", lastname: "", email: "", password: "", 
    department: "IT", designation: "Assistant Professor", researchArea: ""
  });

  const fetchData = async () => {
    try {
      const { data } = await api.get("/stats");
      setStats(data.stats);
    } catch (error) {
      toast.error("Failed to load system metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/create-student", studentForm);
      toast.success("Student assigned to registry successfully");
      setShowStudentModal(false);
      setStudentForm({
        firstname: "", lastname: "", email: "", enrollmentno: "", 
        password: "", department: "IT", year: "FY", phone: ""
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Student boarding failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfessorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/create-professor", professorForm);
      toast.success("Faculty member onboarded successfully");
      setShowProfessorModal(false);
      setProfessorForm({
        firstname: "", lastname: "", email: "", password: "", 
        department: "IT", designation: "Assistant Professor", researchArea: ""
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Professor boarding failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <div className="flex flex-col items-center text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-1">Synchronizing</p>
            <p className="text-slate-900 font-bold text-sm">System Command Hub</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats?.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Faculty", value: stats?.totalProfessors, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Open Projects", value: stats?.totalProjects, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Research", value: stats?.activeInternships, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Admin Header & System Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span>Admin Control Center</span>
            <span className="text-slate-200">/</span>
            <span className="text-slate-900">Dashboard Overview</span>
          </nav>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Oversight</h1>
          <p className="text-slate-500 font-medium tracking-tight">Monitor recruitment efficiency and academic collaboration.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-3 rounded-[20px] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-emerald-500/5 to-transparent"></div>
          <div className="flex flex-col items-end relative z-10">
             <div className="flex items-center gap-2">
               <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Mainframe Active</span>
             </div>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Last Sync: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-slate-50/50 rounded-full blur-3xl -mr-12 -mb-12 group-hover:scale-150 transition-transform"></div>
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className={`${card.bg} p-4 rounded-2xl`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-200 group-hover:text-slate-900 transition-colors" />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tighter">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Internship Participation Analytics */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Internship Participation</h3>
                <p className="text-sm font-medium text-slate-400">Real-time metrics of active student-faculty collaborations.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl"><Activity className="w-6 h-6 text-slate-400" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              {/* Student Stats */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
                      <span className="text-sm font-bold text-slate-700">Student Engagement</span>
                   </div>
                   <span className="text-2xl font-bold text-slate-900">{stats?.activeInternships}</span>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>In Active Internship</span>
                      <span>Total: {stats?.totalStudents}</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${(stats?.activeInternships || 0) / (stats?.totalStudents || 1) * 100}%` }}
                      ></div>
                   </div>
                </div>
                <p className="text-[10px] font-medium text-slate-400 italic">
                   {((stats?.activeInternships || 0) / (stats?.totalStudents || 1) * 100).toFixed(1)}% of students are currently placed in projects.
                </p>
              </div>

              {/* Professor Stats */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><Briefcase className="w-5 h-5 text-indigo-600" /></div>
                      <span className="text-sm font-bold text-slate-700">Faculty Mentorship</span>
                   </div>
                   <span className="text-2xl font-bold text-slate-900">{stats?.professorsInInternship}</span>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Actively Mentoring</span>
                      <span>Total: {stats?.totalProfessors}</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${(stats?.professorsInInternship || 0) / (stats?.totalProfessors || 1) * 100}%` }}
                      ></div>
                   </div>
                </div>
                <p className="text-[10px] font-medium text-slate-400 italic">
                   {((stats?.professorsInInternship || 0) / (stats?.totalProfessors || 1) * 100).toFixed(1)}% of faculty members are leading active research.
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between relative z-10 group/status hover:bg-white transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Academic Growth Trend</p>
                    <p className="text-xs text-slate-500 font-medium">Internship participation up by 12% this quarter.</p>
                  </div>
               </div>
               <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Full Analytics Report</button>
            </div>
          </div>
        </div>

        {/* Sidebar Actions & Health */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
            
            <h3 className="text-lg font-bold text-white relative z-10">Quick Oversight</h3>
            
            <div className="space-y-3 relative z-10">
              <button 
                onClick={() => setShowStudentModal(true)}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/btn"
              >
                <span className="flex items-center gap-3 text-sm font-bold text-white/80 group-hover/btn:text-white transition-colors">
                  <User className="w-5 h-5 text-blue-400" /> Board New Student
                </span>
                <PlusCircle className="w-4 h-4 text-white/20 group-hover/btn:text-white transition-all" />
              </button>
              <button 
                onClick={() => setShowProfessorModal(true)}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/btn"
              >
                <span className="flex items-center gap-3 text-sm font-bold text-white/80 group-hover/btn:text-white transition-colors">
                  <Briefcase className="w-5 h-5 text-indigo-400" /> Onboard Faculty
                </span>
                <PlusCircle className="w-4 h-4 text-white/20 group-hover/btn:text-white transition-all" />
              </button>
              <div className="h-1 border-b border-white/5 my-2"></div>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/btn">
                <span className="flex items-center gap-3 text-sm font-bold text-white/80 group-hover/btn:text-white transition-colors">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Verify Projects
                </span>
                <ArrowUpRight className="w-4 h-4 text-white/20 group-hover/btn:text-white transition-all" />
              </button>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4 relative z-10">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                 <span className="text-white/40">Network Throughput</span>
                 <span className="text-emerald-400">Optimal</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full w-[84%] bg-emerald-500 rounded-full animate-pulse"></div>
               </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Resilience</h4>
            <div className="space-y-4">
              {[
                { label: "Indexing Engine", status: "Active", color: "text-emerald-600 bg-emerald-50" },
                { label: "Student Registry", status: "Stable", color: "text-blue-600 bg-blue-50" },
                { label: "Faculty Hub", status: "Online", color: "text-indigo-600 bg-indigo-50" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-1">
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowStudentModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl relative z-20 flex flex-col max-h-[90vh] animate-in zoom-in duration-300 border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Board New Student</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Add a new researcher to the registry</p>
               </div>
               <button onClick={() => setShowStudentModal(false)} className="p-2 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"><XCircle className="w-8 h-8" /></button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
               <form onSubmit={handleStudentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                    <input 
                      type="text" required value={studentForm.firstname}
                      onChange={(e) => setStudentForm({...studentForm, firstname: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                    <input 
                      type="text" required value={studentForm.lastname}
                      onChange={(e) => setStudentForm({...studentForm, lastname: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
                    <input 
                      type="email" required value={studentForm.email}
                      onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enrollment No.</label>
                    <input 
                      type="text" required value={studentForm.enrollmentno}
                      onChange={(e) => setStudentForm({...studentForm, enrollmentno: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                    <input 
                      type="text" required value={studentForm.phone}
                      onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Department</label>
                    <select 
                      required value={studentForm.department}
                      onChange={(e) => setStudentForm({...studentForm, department: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 appearance-none"
                    >
                      {["IT", "CS", "ENTC", "MECH", "AI"].map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                    <select 
                      required value={studentForm.year}
                      onChange={(e) => setStudentForm({...studentForm, year: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-slate-900 appearance-none"
                    >
                      {["FY", "SY", "TY", "BE"].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
                    <input 
                      type="password" required value={studentForm.password}
                      onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <button 
                    type="submit" disabled={isSubmitting} 
                    className="md:col-span-2 mt-4 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Researcher to Registry"}
                  </button>
               </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Professor Modal */}
      {showProfessorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowProfessorModal(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl relative z-20 flex flex-col max-h-[90vh] animate-in zoom-in duration-300 border border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Onboard Faculty Hub</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Grant academic oversight credentials</p>
               </div>
               <button onClick={() => setShowProfessorModal(false)} className="p-2 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100"><XCircle className="w-8 h-8" /></button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
               <form onSubmit={handleProfessorSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                    <input 
                      type="text" required value={professorForm.firstname}
                      onChange={(e) => setProfessorForm({...professorForm, firstname: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                    <input 
                      type="text" required value={professorForm.lastname}
                      onChange={(e) => setProfessorForm({...professorForm, lastname: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Email</label>
                    <input 
                      type="email" required value={professorForm.email}
                      onChange={(e) => setProfessorForm({...professorForm, email: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <select 
                      required value={professorForm.department}
                      onChange={(e) => setProfessorForm({...professorForm, department: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 appearance-none"
                    >
                      {["IT", "CS", "ENTC", "MECH", "AI"].map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Designation</label>
                    <select 
                      required value={professorForm.designation}
                      onChange={(e) => setProfessorForm({...professorForm, designation: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 appearance-none"
                    >
                      {["Assistant Professor", "Associate Professor", "Professor", "HOD", "Dean"].map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Research Areas (Comma separated)</label>
                    <input 
                      type="text" value={professorForm.researchArea}
                      onChange={(e) => setProfessorForm({...professorForm, researchArea: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                      placeholder="e.g. AI, Quantum Computing, Ethics"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
                    <input 
                      type="password" required value={professorForm.password}
                      onChange={(e) => setProfessorForm({...professorForm, password: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                  <button 
                    type="submit" disabled={isSubmitting} 
                    className="md:col-span-2 mt-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Faculty Oversight Credentials"}
                  </button>
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
