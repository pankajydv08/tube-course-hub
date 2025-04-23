
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { CourseForm } from "@/components/Courses/CourseForm";
import { courseApi } from "@/lib/api";
import { CourseFormData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditCourse() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseData, setCourseData] = useState<CourseFormData | null>(null);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Load existing course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        if (!id) throw new Error("Course ID is missing");
        
        const data = await courseApi.getCourseById(id);
        
        // Format data for form
        setCourseData({
          title: data.course.title,
          description: data.course.description,
          category: data.course.category,
          videos: data.course.videos.map((video: any) => ({
            title: video.title,
            youtubeId: video.youtubeId
          }))
        });
      } catch (error) {
        console.error("Failed to fetch course:", error);
        setError("Failed to load course data");
        toast.error("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [id]);
  
  // Update course
  const handleUpdateCourse = async (formData: CourseFormData) => {
    try {
      setIsSubmitting(true);
      if (!id) throw new Error("Course ID is missing");
      
      await courseApi.updateCourse(id, formData);
      toast.success("Course updated successfully!");
      navigate(`/instructor/courses/${id}`);
    } catch (error) {
      console.error("Failed to update course:", error);
      toast.error("Failed to update course");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Edit Course</h1>
          <p className="text-gray-600">
            Update your course details and content.
          </p>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading course data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/instructor/courses")}>
              Go Back to Courses
            </Button>
          </div>
        ) : courseData ? (
          <CourseForm 
            initialData={courseData}
            onSubmit={handleUpdateCourse}
            isSubmitting={isSubmitting}
          />
        ) : null}
      </div>
    </DashboardLayout>
  );
}
