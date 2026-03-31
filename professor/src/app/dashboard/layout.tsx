"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import api from "@/lib/axios";
import { 
  Briefcase, 
  PlusCircle, 
  UserCircle, 
  LogOut, 
  Menu,
  BookOpen,
  Globe
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      dispatch(logout());
      toast.success("Logged out successfully");
      router.push("/login");
    }
  };

  const navItems = [
    { name: "Explore Projects", href: "/dashboard/explore", icon: Globe },
    { name: "My Projects", href: "/dashboard/project", icon: Briefcase },
    { name: "Publish Project", href: "/dashboard/publish", icon: PlusCircle },
    { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
  ];

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 shadow-xl transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="flex items-center justify-center h-20 border-b border-gray-800">
          <BookOpen className="h-8 w-8 text-emerald-500 mr-2" />
          <h1 className="text-2xl font-bold text-white">CollegeHub</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center px-4 py-3 mb-2 rounded-lg bg-gray-800 text-gray-300">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Prof. {user?.name?.firstname} {user?.name?.lastname}</p>
              <p className="text-xs text-emerald-400 truncate">{user?.department} Dept</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8 border-b border-gray-100">
          <button 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex justify-end">
            <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
              Faculty Workspace
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
