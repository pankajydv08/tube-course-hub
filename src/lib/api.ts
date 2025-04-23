
import { toast } from "sonner";

const API_BASE_URL = "/api";

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Base API request function with error handling
 */
async function apiRequest(
  endpoint: string,
  method: string = "GET",
  data: any = null,
  requiresAuth: boolean = true
) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new ApiError(responseData.message || "An error occurred", response.status);
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    } else if (error instanceof Error) {
      toast.error(error.message);
      throw new ApiError(error.message, 500);
    } else {
      toast.error("An unknown error occurred");
      throw new ApiError("An unknown error occurred", 500);
    }
  }
}

/**
 * Auth API functions
 */
export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    apiRequest("/auth/login", "POST", credentials, false),
  
  register: (userData: { 
    name: string; 
    email: string; 
    password: string;
    role: "student" | "instructor"
  }) => apiRequest("/auth/register", "POST", userData, false),
  
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return Promise.resolve();
  },

  getCurrentUser: () => apiRequest("/auth/user"),
  
  // Store user data in localStorage after login/register
  storeUserData: (data: { token: string; user: any }) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
};

/**
 * Course API functions
 */
export const courseApi = {
  // Instructor endpoints
  createCourse: (courseData: any) => apiRequest("/courses", "POST", courseData),
  
  updateCourse: (id: string, courseData: any) => 
    apiRequest(`/courses/${id}`, "PUT", courseData),
  
  deleteCourse: (id: string) => apiRequest(`/courses/${id}`, "DELETE"),
  
  getInstructorCourses: () => apiRequest("/courses/instructor"),
  
  // Student endpoints
  getAllCourses: (filters?: { category?: string }) => {
    const query = filters?.category ? `?category=${filters.category}` : "";
    return apiRequest(`/courses${query}`, "GET", null, false);
  },
  
  getCourseById: (id: string) => apiRequest(`/courses/${id}`, "GET", null, false),
  
  enrollCourse: (courseId: string) => apiRequest("/enrollments", "POST", { courseId }),
  
  getEnrolledCourses: () => apiRequest("/enrollments"),

  markVideoCompleted: (enrollmentId: string, videoIndex: number) => 
    apiRequest(`/enrollments/${enrollmentId}/progress`, "PUT", { videoIndex }),
  
  // Categories
  getCategories: () => apiRequest("/categories", "GET", null, false),
};

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
  const userJson = localStorage.getItem("user");
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

/**
 * Check if current user is an instructor
 */
export function isInstructor() {
  const user = getCurrentUser();
  return user && user.role === "instructor";
}

/**
 * Check if current user is a student
 */
export function isStudent() {
  const user = getCurrentUser();
  return user && user.role === "student";
}
