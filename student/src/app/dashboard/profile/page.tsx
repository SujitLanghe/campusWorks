"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { loginSuccess } from "@/store/authSlice";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { User, Mail, GraduationCap, Briefcase, Phone, BookOpen, Linkedin, Github, FileText, Loader2, Fingerprint } from "lucide-react";

export default function Profile() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    skills: user?.skills?.join(", ") || "",
    github: user?.github || "",
    linkedin: user?.linkedin || "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updateData = new FormData();
    updateData.append("skills", formData.skills);
    updateData.append("github", formData.github);
    updateData.append("linkedin", formData.linkedin);
    if (resumeFile) {
      updateData.append("resume", resumeFile);
    }

    try {
      const { data } = await api.patch("/update-profile", updateData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(data.message || "Profile updated successfully!");
      if (data.student) {
        const token = localStorage.getItem("studentToken") || "";
        dispatch(loginSuccess({ user: data.student, token }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Clean Page Header */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Fingerprint className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Student Identity</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl">
            Maintain your verified university portfolio. Ensure your links, resume, and listed skills are up-to-date for professors to review.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar Badge Container */}
        <div className="flex-shrink-0 flex flex-col items-center p-6 bg-slate-50 border border-gray-200 rounded-2xl min-w-[240px] w-full md:w-auto">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-4xl font-extrabold mb-4 border-4 border-white shadow-sm tracking-tight">
            {user.name?.firstname?.[0]?.toUpperCase()}{user.name?.lastname?.[0]?.toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">{user.name?.firstname} {user.name?.lastname}</h2>
          <span className="mt-3 px-3 py-1 bg-white border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wider rounded-md shadow-sm">
            Student Identity
          </span>
          <div className="w-full h-px bg-gray-200 my-4"></div>
          <div className="flex flex-col w-full space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span className="uppercase">Enrollment</span>
              <span className="text-gray-900">{user.enrollmentno}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span className="uppercase">Year</span>
              <span className="text-gray-900">Year {user.year}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span className="uppercase">Dept</span>
              <span className="text-gray-900 truncate max-w-[120px] text-right" title={user.department}>{user.department}</span>
            </div>
          </div>
        </div>

        {/* Academic Details Content */}
        <div className="flex-1 w-full space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">Contact & Communication</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center text-gray-500 mb-1.5">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Email Address</span>
                </div>
                <div className="font-bold text-gray-900 break-words">{user.email}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center text-gray-500 mb-1.5">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Mobile Contact</span>
                </div>
                <div className="font-bold text-gray-900 break-words">{user.phone || "Missing Contact"}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">Integrations & Portfolio</h3>
            <form onSubmit={handleUpdate} className="space-y-5">
              
              <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-gray-100">
                {/* URLs Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center">
                      <Linkedin className="w-3.5 h-3.5 mr-1.5" /> LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center">
                      <Github className="w-3.5 h-3.5 mr-1.5" /> GitHub Profile
                    </label>
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Skill Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. React, Docker, UI/UX"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF Resume Override
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:border-blue-300 rounded-lg cursor-pointer transition-colors shadow-sm font-bold text-sm h-10">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="truncate max-w-[150px]">{resumeFile ? resumeFile.name : "Select Document"}</span>
                      <input 
                        type="file" 
                        accept=".pdf"
                        className="hidden" 
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {user.resumeUrl && !resumeFile && (
                      <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 h-10 flex items-center rounded-lg border border-blue-100 transition-colors">
                        Inspect Current Resume
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 flex justify-center items-center active:-translate-y-px"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? "Synchronizing..." : "Update Portfolio Matrix"}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
