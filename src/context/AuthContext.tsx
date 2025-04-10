
import React, { createContext, useState, ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService, userService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (userData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateCurrentUser: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await userService.getCurrentUserProfile();
          setUser({
            id: response.data.id,
            username: response.data.username,
            email: "", // Email is not returned by the API for security
            avatarUrl: response.data.avatarUrl,
            bio: response.data.bio,
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          localStorage.removeItem("token");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      localStorage.setItem("token", response.data.token);
      
      setUser({
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        avatarUrl: response.data.avatarUrl,
        bio: response.data.bio,
      });
      setIsAuthenticated(true);
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${response.data.username}!`,
      });
      
      // Redirect to home or intended page
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred during login";
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      await authService.register(username, email, password);
      toast({
        title: "Registration successful",
        description: "You can now log in with your credentials",
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred during registration";
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: "Logged out successfully",
    });
    navigate("/login");
  };

  // Update current user function
  const updateCurrentUser = (userData: Partial<User>) => {
    if (user) {
      setUser({
        ...user,
        ...userData,
      });
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      login, 
      register, 
      logout,
      updateCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
