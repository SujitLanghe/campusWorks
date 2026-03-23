"use client";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { User, Mail, Briefcase, BookOpen, Fingerprint } from "lucide-react";

export default function Profile() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Clean Page Header */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Fingerprint className="w-5 h-5 text-emerald-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Faculty Profile</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl">
            View your verified academic identity and contact metrics registered within the university system.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar Card */}
        <div className="flex-shrink-0 flex flex-col items-center p-6 bg-slate-50 border border-gray-200 rounded-2xl min-w-[240px] w-full md:w-auto">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-4xl font-extrabold mb-4 border-4 border-white shadow-sm tracking-tight">
            {user.name?.firstname?.[0]?.toUpperCase()}{user.name?.lastname?.[0]?.toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">Prof. {user.name?.firstname} {user.name?.lastname}</h2>
          <span className="mt-3 px-3 py-1 bg-white border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-wider rounded-md shadow-sm">
            {user.department} Dept.
          </span>
        </div>

        {/* Info Grid */}
        <div className="flex-1 w-full space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">Academic Role & Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center text-gray-500 mb-1.5">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Email Address</span>
                </div>
                <div className="font-bold text-gray-900 break-words">{user.email}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center text-gray-500 mb-1.5">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Designation</span>
                </div>
                <div className="font-bold text-gray-900">{user.designation}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 sm:col-span-2 mt-2">
                <div className="flex items-center text-gray-500 mb-3">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Research Areas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.researchArea?.map((area: string, idx: number) => (
                    <span key={idx} className="bg-white border border-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-sm shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-700">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
