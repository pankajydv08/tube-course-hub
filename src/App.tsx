
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";

// Landing and Auth Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import NotFound from "./pages/NotFound";

// Instructor Pages
import InstructorDashboard from "./pages/Instructor/InstructorDashboard";
import InstructorCourseList from "./pages/Instructor/InstructorCourseList";
import CreateCourse from "./pages/Instructor/CreateCourse";
import EditCourse from "./pages/Instructor/EditCourse";

// Student Pages
import StudentDashboard from "./pages/Student/StudentDashboard";
import BrowseCourses from "./pages/Student/BrowseCourses";
import StudentEnrollments from "./pages/Student/StudentEnrollments";
import CourseView from "./pages/Student/CourseView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Instructor Routes */}
            <Route 
              path="/instructor/dashboard" 
              element={
                <ProtectedRoute requiredRole="instructor">
                  <InstructorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/courses" 
              element={
                <ProtectedRoute requiredRole="instructor">
                  <InstructorCourseList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/courses/create" 
              element={
                <ProtectedRoute requiredRole="instructor">
                  <CreateCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/instructor/courses/edit/:id" 
              element={
                <ProtectedRoute requiredRole="instructor">
                  <EditCourse />
                </ProtectedRoute>
              } 
            />
            
            {/* Student Routes */}
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/browse" 
              element={<BrowseCourses />} 
            />
            <Route 
              path="/student/enrollments" 
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentEnrollments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/course/:enrollmentId" 
              element={
                <ProtectedRoute requiredRole="student">
                  <CourseView />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
