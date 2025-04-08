
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/services/api";
import { useEffect } from "react";

const Layout = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    // Handle API error interceptor
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto p-4 flex-1">
        <Outlet />
      </main>
      <footer className="bg-muted p-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} DissDen. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
