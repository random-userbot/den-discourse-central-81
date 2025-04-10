import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authService, userService } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: {
    id: number;
    username: string;
    email: string;
    bio?: string;
    avatarUrl?: string;
  } | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuthStatus();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const userData = JSON.parse(localStorage.getItem("user") || "null");
      
      if (userData && userData.id) {
        // Get the latest user profile
        const response = await userService.getUserProfile(userData.id);
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(username, password);
      const { token, id, username: responseUsername, email } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({
        id,
        username: responseUsername,
        email
      }));
      
      setUser({
        id,
        username: responseUsername,
        email,
        bio: response.data.bio,
        avatarUrl: response.data.avatarUrl,
      });
      
      toast({
        title: "Login successful",
        description: `Welcome, ${responseUsername}!`,
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error; // Re-throw to allow the login component to handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      await authService.register(username, email, password);
      toast({
        title: "Registration successful",
        description: "Please log in with your new credentials.",
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Failed to register user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
