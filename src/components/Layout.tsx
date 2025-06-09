import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/services/api";
import { useEffect } from "react";

const Layout = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || "Something went wrong";
        
        if (error.response?.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please login to continue",
            variant: "destructive",
          });
        } else if (error.response?.status === 403) {
          toast({
            title: "Permission Denied",
            description: message,
            variant: "destructive",
          });
        } else if (error.response?.status === 404) {
          toast({
            title: "Not Found",
            description: message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          });
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [toast]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-900">
      <Navbar />
      <main className="container mx-auto p-4 flex-1 relative">
        <Outlet />
      </main>
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-white/20 p-6 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            &copy; {new Date().getFullYear()} DissDen. Building communities, one conversation at a time.
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500 dark:text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Community Guidelines</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
