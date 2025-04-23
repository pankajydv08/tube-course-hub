
import { useEffect, useState } from "react";
import { courseApi } from "@/lib/api";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/lib/types";
import { BookOpen, Users, Plus } from "lucide-react";
import { toast } from "sonner";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    totalVideos: 0,
    recentCourses: [] as Course[],
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseApi.getInstructorCourses();
        setCourses(data.courses);
        
        // Calculate stats
        const totalCourses = data.courses.length;
        const totalEnrollments = data.courses.reduce(
          (acc: number, course: Course) => acc + (course.enrollmentCount || 0),
          0
        );
        const totalVideos = data.courses.reduce(
          (acc: number, course: Course) => acc + course.videos.length,
          0
        );
        
        // Get recent courses (max 3)
        const sortedCourses = [...data.courses].sort(
          (a: Course, b: Course) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const recentCourses = sortedCourses.slice(0, 3);
        
        setStats({
          totalCourses,
          totalEnrollments,
          totalVideos,
          recentCourses,
        });
        
      } catch (err) {
        console.error(err);
        setError("Failed to load courses");
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
          <Link to="/instructor/courses/create">
            <Button>
              <Plus size={18} className="mr-2" />
              Create New Course
            </Button>
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-500 mr-4" />
                <span className="text-3xl font-bold">
                  {loading ? "..." : stats.totalCourses}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-500 mr-4" />
                <span className="text-3xl font-bold">
                  {loading ? "..." : stats.totalEnrollments}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-purple-500 mr-4"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M22 8.5a2.5 2.5 0 0 0-3.5 0L18 9c-1 0-2 1-2 2.5s1 2.5 2 2.5l.5.5a2.5 2.5 0 0 0 3.5 0a2.5 2.5 0 0 0 0-4.5L20.5 8.5a2.5 2.5 0 0 0-1-1.5a2.5 2.5 0 0 0-3 0L15 8.5c-1.5 1.5-2 1-2.5-.5L12 7c-.5-1-1.5-2-2-2.5s-2-.5-3 0s-2 1-2.5 2s0 2.5 1 3s1.5 1 2 2s0 2-1 2.5s-2 .5-2.5 0a2.5 2.5 0 0 0-3 0a2.5 2.5 0 0 0 0 4.5c.5.5 1.5.5 2.5 0s2-1.5 2-2s-.5-1.5-1-2s-.5-2 0-3s1.5-1.5 2-1.5s1.5 0 2 .5s2 1.5 2.5 1.5s1-.5 1-1.5s-.5-2-1-2.5s-1.5-1.5-2-2s-1-1.5-1-2.5s1-1.5 1.5-1.5s2 0 2.5.5s2.5 1.5 3.5 1.5s2-.5 2-1.5L21 3c-0.5-1-1.5-2-2.5-2.5s-2.5-0.5-3.5 0s-1.5 2-1 3l.5 1"></path>
                </svg>
                <span className="text-3xl font-bold">
                  {loading ? "..." : stats.totalVideos}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Courses</h2>
            <Link to="/instructor/courses">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading courses...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : stats.recentCourses.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <h3 className="text-lg font-medium text-gray-700 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first course to get started
              </p>
              <Link to="/instructor/courses/create">
                <Button>
                  <Plus size={18} className="mr-2" />
                  Create New Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.recentCourses.map((course) => (
                <Card key={course._id} className="overflow-hidden flex flex-col">
                  <CardHeader className="bg-purple-50 pb-3">
                    <Badge className="w-fit mb-2">{course.category}</Badge>
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <BookOpen size={16} className="mr-1" />
                      <span>{course.videos.length} videos</span>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 flex-grow">
                    <p className="text-gray-600 line-clamp-2">{course.description}</p>
                    <div className="flex items-center mt-4">
                      <Users size={16} className="text-gray-500 mr-1" />
                      <span className="text-sm text-gray-500">
                        {course.enrollmentCount || 0} enrollments
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <div className="flex justify-end w-full">
                      <Link to={`/instructor/courses/edit/${course._id}`}>
                        <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                      </Link>
                      <Link to={`/instructor/courses/${course._id}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
