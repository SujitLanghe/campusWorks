"use client";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "react-hot-toast";
import { User, Mail, Briefcase, BookOpen } from "lucide-react";

export default function Profile() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-3xl font-bold">
                {user.name?.firstname?.[0]}{user.name?.lastname?.[0]}
              </div>
            </div>
            <div className="mb-2">
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-full">
                Faculty Profile
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Personal Details</h3>
              <div className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-3 text-gray-400" />
                <span className="font-medium">Prof. {user.name?.firstname} {user.name?.lastname}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="w-5 h-5 mr-3 text-gray-400" />
                <span>{user.email}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Academic Role</h3>
              <div className="flex items-center text-gray-700">
                <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                <span>{user.department} Department</span>
              </div>
              <div className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-3 text-gray-400" />
                <span>{user.designation}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <BookOpen className="w-5 h-5 mr-3 text-gray-400" />
                <span>{user.researchArea?.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
