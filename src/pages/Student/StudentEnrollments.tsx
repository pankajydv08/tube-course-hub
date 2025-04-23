
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { courseApi } from "@/lib/api";
import { Enrollment } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Calendar, CheckCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Enrolled" },
  { value: "oldest", label: "Oldest First" },
  { value: "progress", label: "Progress (High to Low)" },
  { value: "name", label: "Course Name (A-Z)" },
];

export default function StudentEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recent");

  // Fetch enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const data = await courseApi.getEnrolledCourses();
        setEnrollments(data.enrollments);
        setFilteredEnrollments(data.enrollments);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        toast.error("Failed to load your courses");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrollments();
  }, []);

  // Filter and sort enrollments
  useEffect(() => {
    let filtered = [...enrollments];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(enrollment => 
        enrollment.course.title.toLowerCase().includes(term) || 
        enrollment.course.description.toLowerCase().includes(term) ||
        enrollment.course.category.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case "recent":
        filtered.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime());
        break;
      case "progress":
        filtered.sort((a, b) => b.completionPercentage - a.completionPercentage);
        break;
      case "name":
        filtered.sort((a, b) => a.course.title.localeCompare(b.course.title));
        break;
    }
    
    setFilteredEnrollments(filtered);
  }, [enrollments, searchTerm, sortOption]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Learning</h1>
          <p className="text-gray-600">
            Track your progress in enrolled courses
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search your courses..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Enrollment List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your courses...</p>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            {searchTerm ? (
              <>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No courses match your search</h3>
                <p className="text-gray-500 mb-4">
                  Try different keywords or clear your search
                </p>
                <Button variant="outline" onClick={() => setSearchTerm("")}>Clear Search</Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-700 mb-2">You haven't enrolled in any courses yet</h3>
                <p className="text-gray-500 mb-4">
                  Discover and enroll in courses to start learning
                </p>
                <Link to="/student/browse">
                  <Button>Browse Courses</Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <Card key={enrollment._id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <CardHeader className="md:w-3/5 bg-purple-50">
                    <div className="flex flex-col h-full">
                      <Badge className="w-fit mb-2">{enrollment.course.category}</Badge>
                      <h3 className="text-lg font-semibold mb-2">{enrollment.course.title}</h3>
                      <p className="text-gray-600 line-clamp-2 mb-4">{enrollment.course.description}</p>
                      
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-medium">
                            {enrollment.completionPercentage}%
                          </span>
                        </div>
                        <Progress value={enrollment.completionPercentage} className="h-2" />
                        
                        <div className="flex mt-2 text-sm text-gray-500">
                          <div className="flex items-center mr-4">
                            <CheckCircle size={14} className="mr-1 text-green-500" />
                            <span>
                              {enrollment.completedVideos} / {enrollment.totalVideos} completed
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <div className="md:w-2/5 flex flex-col">
                    <CardContent className="p-4 flex-grow">
                      <div className="space-y-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <BookOpen size={16} className="mr-2" />
                          <span>{enrollment.course.videos.length} videos</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={16} className="mr-2" />
                          <span>Enrolled on {formatDate(enrollment.enrolledAt)}</span>
                        </div>
                        
                        {enrollment.completionPercentage === 100 && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle size={16} className="mr-2" />
                            <span>Course completed!</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-4 border-t bg-gray-50">
                      <Link to={`/student/course/${enrollment._id}`} className="w-full">
                        <Button className="w-full">
                          {enrollment.completionPercentage === 0
                            ? "Start Course" 
                            : enrollment.completionPercentage === 100
                            ? "Review Course"
                            : "Continue Learning"}
                        </Button>
                      </Link>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
