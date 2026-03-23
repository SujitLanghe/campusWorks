"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { 
  CheckCircle, Loader2, Sparkles, BookOpen, Clock, Users,
  Globe, LayoutTemplate, BriefcaseIcon, Terminal, Info
} from "lucide-react";

import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function PublishProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skillsRequired: "",
    duration: "",
    maxStudents: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (content: string) => {
    setFormData({ ...formData, description: content });
  };

  const currentSkills = formData.skillsRequired.split(',').map(s => s.trim()).filter(Boolean);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
      duration: formData.duration ? `${formData.duration} Months` : "",
      skillsRequired: currentSkills
    };

    try {
      const { data } = await api.post("/publish-project", payload);
      toast.success(data.message || "Project published successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to publish project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Clean Page Header */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BriefcaseIcon className="w-5 h-5 text-emerald-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Post a Problem Statement</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl">
            Create an engaging real-world project, define the goals, and invite the brightest minds on campus to solve it.
          </p>
        </div>
      </div>

      <form onSubmit={handlePublish} className="flex flex-col lg:flex-row gap-8 items-start pb-12">
        {/* Left Column - Core Details */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:border-blue-200 transition-colors">
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Title Section */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
                  <BriefcaseIcon className="w-4 h-4 mr-2 text-blue-500" />
                  Project Title <span className="text-red-500 ml-1">*</span>
                </label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. AI-powered Autonomous Drone Navigation System"
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-gray-900 text-lg placeholder:text-gray-400 border"
                />
              </div>

              {/* Description Section */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
                    <LayoutTemplate className="w-4 h-4 mr-2 text-indigo-500" />
                    Detailed Description <span className="text-red-500 ml-1">*</span>
                  </label>
                  <span className="text-xs font-medium text-gray-400">Rich Text Supported</span>
                </div>
                <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-gray-800 [&_.ql-editor]:text-base">
                  <ReactQuill 
                    theme="snow"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Describe the problem statement, primary objectives, deliverables, and what students are expected to learn..."
                  />
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <label className="flex items-center text-sm font-bold text-gray-700 uppercase tracking-wide">
                  <Terminal className="w-4 h-4 mr-2 text-emerald-500" />
                  Required Skills & Technologies
                </label>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    name="skillsRequired"
                    value={formData.skillsRequired}
                    onChange={handleChange}
                    placeholder="e.g. React, Node.js, Python, Machine Learning (comma separated)"
                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-gray-800 border"
                  />
                  <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {currentSkills.length > 0 ? (
                      currentSkills.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm animate-in zoom-in duration-200">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic flex items-center">
                        Tags will preview here as you type...
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column - Settings & Publish */}
        <div className="w-full lg:w-1/3 space-y-6 lg:sticky lg:top-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
              <h3 className="font-bold text-gray-800 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-gray-500" /> Logistics & Settings
              </h3>
            </div>
            <div className="p-6 space-y-8">
              
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-700">
                  <Clock className="w-4 h-4 mr-2 text-orange-500" />
                  Estimated Duration 
                  <span className="ml-1 text-gray-400 font-normal">(Months)</span>
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="duration"
                    min="1"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    className="w-full pl-5 pr-12 py-3 bg-white border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-semibold text-gray-800 shadow-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm pointer-events-none">
                    mo
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center text-sm font-bold text-gray-700">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  Maximum Students <span className="text-red-500 ml-1">*</span>
                </label>
                <input 
                  type="number" 
                  name="maxStudents"
                  required
                  min={1}
                  max={10}
                  value={formData.maxStudents}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-semibold text-gray-800 shadow-sm"
                />
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start mt-2">
                  <Info className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    The project will be automatically marked as <b>"ONGOING"</b> when this team capacity is reached.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-6 h-6 mr-2" />
              )}
              {loading ? "Publishing to Portal..." : "Publish Project"}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
              By publishing, this project will instantly be visible to all students on the platform.
            </p>
          </div>

        </div>
      </form>
    </div>
  );
}
