"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { loginSuccess } from "@/store/authSlice";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { User, Mail, GraduationCap, Briefcase, Phone, BookOpen, Linkedin, Github, FileText, Loader2 } from "lucide-react";

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                {user.name?.firstname?.[0]}{user.name?.lastname?.[0]}
              </div>
            </div>
            <div className="mb-2">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-700 font-semibold text-sm rounded-full">
                Student Profile
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Personal Details</h3>
              <div className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-3 text-gray-400" />
                <span className="font-medium">{user.name?.firstname} {user.name?.lastname}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="w-5 h-5 mr-3 text-gray-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-5 h-5 mr-3 text-gray-400" />
                <span>{user.phone || "Not provided"}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Academic Details</h3>
              <div className="flex items-center text-gray-700">
                <GraduationCap className="w-5 h-5 mr-3 text-gray-400" />
                <span><span className="text-gray-500 text-sm">Enrollment No:</span> {user.enrollmentno}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                <span>{user.department} Department</span>
              </div>
              <div className="flex items-center text-gray-700">
                <BookOpen className="w-5 h-5 mr-3 text-gray-400" />
                <span>Year {user.year}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Professional Links & Assets</h3>
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Python"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <div className="relative">
                <Github className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume (PDF)</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <FileText className="w-5 h-5 mr-2" />
                <span>{resumeFile ? resumeFile.name : "Select Resume"}</span>
                <input 
                  type="file" 
                  accept=".pdf"
                  className="hidden" 
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
              </label>
              {user.resumeUrl && !resumeFile && (
                <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                  View Current Resume
                </a>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
