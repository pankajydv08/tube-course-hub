import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { courseApi } from "@/lib/api";
import { Course } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Users, BookOpen, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function ViewCourse() {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Load course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error("Course ID is missing");
        
        const data = await courseApi.getCourseById(id);
        setCourse(data.course);
      } catch (error) {
        console.error("Failed to fetch course:", error);
        setError("Failed to load course data");
        toast.error("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [id]);
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading course data...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-red-500">{error || "Course not found"}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/instructor/courses")}>
            Go Back to Courses
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
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
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2">{course.category}</Badge>
              <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
            </div>
            <Button onClick={() => navigate(`/instructor/courses/edit/${course._id}`)}>
              <Edit size={16} className="mr-2" />
              Edit Course
            </Button>
          </div>
          <p className="text-gray-600">{course.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center text-gray-500">
                <BookOpen size={16} className="mr-2" />
                <span className="text-sm font-medium">Total Videos</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{course.videos.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center text-gray-500">
                <Users size={16} className="mr-2" />
                <span className="text-sm font-medium">Enrollments</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{course.enrollmentCount || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center text-gray-500">
                <Calendar size={16} className="mr-2" />
                <span className="text-sm font-medium">Created</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatDate(course.createdAt)}</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Course Content</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {course.videos.map((video, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-grow">
                    <h3 className="font-medium">{video.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      YouTube ID: {video.youtubeId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 