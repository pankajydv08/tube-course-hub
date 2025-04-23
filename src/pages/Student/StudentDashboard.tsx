
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/Courses/CourseCard";
import { courseApi } from "@/lib/api";
import { Course, Enrollment, CategoryCount } from "@/lib/types";
import { BookOpen, Clock, Search } from "lucide-react";
import { toast } from "sonner";
import { calculateProgressPercentage } from "@/lib/utils";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedVideos: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch enrolled courses
        const enrollmentsData = await courseApi.getEnrolledCourses();
        setEnrollments(enrollmentsData.enrollments);
        
        // Calculate stats from enrollments
        const totalEnrollments = enrollmentsData.enrollments.length;
        const completedVideos = enrollmentsData.enrollments.reduce(
          (sum: number, enrollment: Enrollment) => sum + enrollment.completedVideos, 
          0
        );
        const totalProgress = enrollmentsData.enrollments.reduce(
          (sum: number, enrollment: Enrollment) => sum + enrollment.completionPercentage, 
          0
        );
        
        setStats({
          enrolledCourses: totalEnrollments,
          completedVideos,
          averageProgress: totalEnrollments > 0 
            ? Math.round(totalProgress / totalEnrollments) 
            : 0
        });
        
        // Fetch recent courses
        const coursesData = await courseApi.getAllCourses();
        setRecentCourses(coursesData.courses.slice(0, 3));
        
        // Fetch categories with course counts
        const categoriesData = await courseApi.getCategories();
        setCategories(categoriesData.categories);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Enrolled Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-500 mr-4" />
                <span className="text-3xl font-bold">
                  {loading ? "..." : stats.enrolledCourses}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Completed Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-500 mr-4" />
                <span className="text-3xl font-bold">
                  {loading ? "..." : stats.completedVideos}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Average Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="h-8 w-8 text-purple-500 mr-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
                    <circle cx="12" cy="12" r="10" className="stroke-purple-100" />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      className="stroke-purple-500"
                      strokeDasharray={`${stats.averageProgress * 0.628} 62.8`}
                      strokeDashoffset="15.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="text-3xl font-bold">
                  {loading ? "..." : `${stats.averageProgress}%`}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Progress */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Continue Learning</h2>
            <Link to="/student/enrollments">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading your courses...</p>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.slice(0, 3).map((enrollment) => (
                <CourseCard 
                  key={enrollment._id} 
                  course={enrollment.course}
                  isEnrolled={true}
                  enrollmentId={enrollment._id}
                  progressPercentage={enrollment.completionPercentage}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <h3 className="text-lg font-medium text-gray-700 mb-2">You haven't enrolled in any courses yet</h3>
              <p className="text-gray-500 mb-4">
                Browse our catalog and find courses that interest you
              </p>
              <Link to="/student/browse">
                <Button>
                  <Search size={18} className="mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Discover Courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Discover New Courses</h2>
            <Link to="/student/browse">
              <Button variant="outline">Browse All</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading courses...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentCourses.map((course) => {
                // Check if student is already enrolled in this course
                const enrollment = enrollments.find(e => e.course._id === course._id);
                
                return (
                  <CourseCard 
                    key={course._id} 
                    course={course}
                    showEnrollButton={true}
                    isEnrolled={!!enrollment}
                    enrollmentId={enrollment?._id}
                    progressPercentage={
                      enrollment 
                        ? calculateProgressPercentage(enrollment.completedVideos, enrollment.totalVideos) 
                        : 0
                    }
                    onEnroll={(courseId) => {
                      courseApi.enrollCourse(courseId)
                        .then((data) => {
                          toast.success("Successfully enrolled in course!");
                          // Add to enrollments
                          setEnrollments([data.enrollment, ...enrollments]);
                        })
                        .catch(() => {
                          toast.error("Failed to enroll in course");
                        });
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
        
        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Browse by Category</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link 
                  key={category._id} 
                  to={`/student/browse?category=${category.name}`}
                  className="group"
                >
                  <Card className="hover:border-purple-300 transition-all group-hover:shadow-md">
                    <CardContent className="p-4 text-center">
                      <h3 className="font-medium group-hover:text-purple-700 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category.count} {category.count === 1 ? 'course' : 'courses'}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
