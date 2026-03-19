"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { PlusCircle, FileText, CheckCircle, Loader2 } from "lucide-react";

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

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // convert skillsRequired to array
    const payload = {
      ...formData,
      skillsRequired: formData.skillsRequired.split(",").map(s => s.trim()).filter(Boolean)
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Publish Problem Statement</h1>
        <p className="text-gray-500 mt-1">Create a new project specification for students to apply to.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handlePublish}>
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title *</label>
              <input 
                type="text" 
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. AI-powered Attendance System"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description *</label>
              <textarea 
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the problem statement, objectives, and what students are expected to learn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills</label>
                <input 
                  type="text" 
                  name="skillsRequired"
                  value={formData.skillsRequired}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, Python (comma separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Duration</label>
                <input 
                  type="text" 
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 3 Months"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Students (Team Capacity) *</label>
              <input 
                type="number" 
                name="maxStudents"
                required
                min={1}
                max={10}
                value={formData.maxStudents}
                onChange={handleChange}
                className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">The project will be marked as "ONGOING" when this capacity is reached.</p>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg flex items-center transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              {loading ? "Publishing..." : "Publish Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
