
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { CourseForm } from "@/components/Courses/CourseForm";
import { courseApi } from "@/lib/api";
import { CourseFormData } from "@/lib/types";
import { toast } from "sonner";

export default function CreateCourse() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleCreateCourse = async (courseData: CourseFormData) => {
    try {
      setIsSubmitting(true);
      const result = await courseApi.createCourse(courseData);
      toast.success("Course created successfully!");
      navigate(`/instructor/courses/${result.course._id}`);
    } catch (error) {
      console.error("Failed to create course:", error);
      toast.error("Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Create New Course</h1>
          <p className="text-gray-600">
            Create a structured learning experience using YouTube videos.
          </p>
        </div>
        
        <CourseForm 
          onSubmit={handleCreateCourse} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </DashboardLayout>
  );
}
