
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, getCurrentUser, isAuthenticated } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "instructor";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: "student" | "instructor") => Promise<void>;
  logout: () => void;
  isInstructor: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on initial render
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const storedUser = getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // If token exists but no user data, try to fetch user
            const userData = await authApi.getCurrentUser();
            setUser(userData.user);
          }
        } catch (error) {
          console.error("Auth error:", error);
          authApi.logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      authApi.storeUserData(data);
      setUser(data.user);
      
      // Redirect based on role
      if (data.user.role === "instructor") {
        navigate("/instructor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
      
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error("Invalid email or password");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: "student" | "instructor"
  ) => {
    setIsLoading(true);
    try {
      const data = await authApi.register({ name, email, password, role });
      authApi.storeUserData(data);
      setUser(data.user);
      
      // Redirect based on role
      if (data.user.role === "instructor") {
        navigate("/instructor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
      
      toast.success("Registration successful");
    } catch (error) {
      toast.error("Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isInstructor: user?.role === "instructor",
    isStudent: user?.role === "student"
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
