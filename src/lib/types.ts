
// Type definitions for the application

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "instructor";
  createdAt: string;
}

export interface Video {
  _id?: string;
  title: string;
  youtubeId: string;
  duration?: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  instructor: {
    _id: string;
    name: string;
  };
  videos: Video[];
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  _id: string;
  course: Course;
  student: {
    _id: string;
    name: string;
  };
  progress: number[];
  completedVideos: number;
  totalVideos: number;
  completionPercentage: number;
  enrolledAt: string;
}

export interface CategoryCount {
  _id: string;
  name: string;
  count: number;
}

export interface CourseFormData {
  title: string;
  description: string;
  category: string;
  videos: {
    title: string;
    youtubeId: string;
  }[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "student" | "instructor";
}
