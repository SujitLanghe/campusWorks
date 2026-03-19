"use client";
import React, { useState, useEffect, use } from "react";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, FileText, Loader2, UserCircle, Briefcase, Users } from "lucide-react";

export default function ViewApplications({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get(`/applications/${projectId}`);
      setApplications(data.applications || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [projectId]);

  const handleAccept = async (appId: string) => {
    setActioningId(appId);
    try {
      const { data } = await api.patch(`/accept-application/${appId}`);
      toast.success(data.message || "Application accepted!");
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept application");
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
     return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Review Applications</h1>
        <p className="text-gray-500 mt-1">Accept students to form your project team.</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center mt-6">
          <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="mt-1 text-gray-500">Students have not applied to this project yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div key={app._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden">
              {app.status === "ACCEPTED" && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> Accepted
                </div>
              )}
              
              <div className="flex items-center space-x-4 mb-4 mt-2">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg">
                  {app.student.name.firstname[0]}{app.student.name.lastname[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{app.student.name.firstname} {app.student.name.lastname}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{app.student.enrollmentno}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-700 flex-1">
                <div className="flex items-center"><Briefcase className="w-4 h-4 mr-2 text-gray-400"/> {app.student.department} (Year {app.student.year})</div>
                <div className="flex bg-gray-50 p-3 rounded-lg border border-gray-100 mt-3 text-sm italic text-gray-600">
                  "{app.message}"
                </div>
              </div>

              <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {app.student.skills?.map((s: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">{s}</span>
                  ))}
                </div>
                
                {app.student.resumeUrl && (
                  <a 
                    href={app.student.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline text-sm font-medium"
                  >
                    <FileText className="w-4 h-4 mr-1" /> View Resume
                  </a>
                )}
              </div>

              {app.status !== "ACCEPTED" && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => handleAccept(app._id)}
                    disabled={actioningId === app._id}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {actioningId === app._id ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accept Student"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// Note: We need to import Users from lucide-react, I will let the linter catch it if I forgot or I can just fix it inline right now if I remembered. Wait, I used Users but forgot to import it. I'll fix that.
