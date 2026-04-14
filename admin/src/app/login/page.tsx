"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { loginSuccess } from "@/store/authSlice";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { LogIn, Mail, Lock, ShieldCheck, Sparkles } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await api.post("/login", {
          email: formData.email,
          password: formData.password,
        });
        toast.success(data.message || "Root access granted");
        dispatch(loginSuccess({ user: data.admin, token: data.accessToken }));
        router.push("/dashboard");
      } else {
        const { data } = await api.post("/register", formData);
        toast.success(data.message || "Admin registered! Proceeding to login.");
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-emerald-100 italic font-medium text-gray-700">
      <div className="max-w-[440px] w-full bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-600/20 relative z-10 transition-transform hover:scale-110 duration-300">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Portal</h2>
          <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Secure Gateway • Root Access</p>
        </div>

        <div className="p-10 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <input
                    type="text"
                    name="firstname"
                    placeholder="Enter first name"
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-bold border"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input
                    type="text"
                    name="lastname"
                    placeholder="Enter last name"
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-bold border"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Administrative Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@campusworks.edu"
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-bold border"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Credentials</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-bold border"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl flex items-center justify-center transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center tracking-tight">
                  {isLogin ? "Authenticate Access" : "Register Control"}
                  <LogIn className="ml-2 w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {isLogin ? "Initial System setup?" : "Already possess clearance?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-emerald-600 hover:underline"
              >
                {isLogin ? "Create credentials" : "Return to vault"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
