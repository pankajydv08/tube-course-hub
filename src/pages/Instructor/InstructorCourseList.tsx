
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { courseApi } from "@/lib/api";
import { Course } from "@/lib/types";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  Edit,
  Trash2
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title", label: "Title A-Z" },
  { value: "enrollments", label: "Most Enrollments" }
];

export default function InstructorCourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [deletingCourse, setDeletingCourse] = useState(false);

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseApi.getInstructorCourses();
        setCourses(data.courses);
        setFilteredCourses(data.courses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Handle search and sorting
  useEffect(() => {
    let result = [...courses];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(term) || 
        course.description.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    result = sortCourses(result, sortOption);
    
    setFilteredCourses(result);
  }, [searchTerm, sortOption, courses]);

  // Sort courses based on selected option
  const sortCourses = (coursesToSort: Course[], option: string) => {
    switch (option) {
      case "newest":
        return [...coursesToSort].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return [...coursesToSort].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "title":
        return [...coursesToSort].sort((a, b) => a.title.localeCompare(b.title));
      case "enrollments":
        return [...coursesToSort].sort(
          (a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
        );
      default:
        return coursesToSort;
    }
  };

  // Delete course
  const deleteCourse = async () => {
    if (!courseToDelete) return;
    
    try {
      setDeletingCourse(true);
      await courseApi.deleteCourse(courseToDelete);
      
      // Remove from state
      setCourses(courses.filter(course => course._id !== courseToDelete));
      toast.success("Course deleted successfully");
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast.error("Failed to delete course");
    } finally {
      setDeletingCourse(false);
      setCourseToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Courses</h1>
          <Link to="/instructor/courses/create">
            <Button>
              <Plus size={18} className="mr-2" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
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

        {/* Course List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            {searchTerm ? (
              <>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No courses match your search</h3>
                <p className="text-gray-500">
                  Try using different keywords or filters
                </p>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course._id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <CardHeader className="md:w-3/5 bg-purple-50">
                    <Badge className="w-fit mb-2">{course.category}</Badge>
                    <h3 className="text-lg font-semibold line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 line-clamp-2 mt-1">{course.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <BookOpen size={16} className="mr-1" />
                        <span>{course.videos.length} videos</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users size={16} className="mr-1" />
                        <span>{course.enrollmentCount || 0} enrollments</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar size={16} className="mr-1" />
                        <span>Created {formatDate(course.createdAt)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <div className="md:w-2/5 flex flex-col">
                    <CardContent className="flex-grow p-4">
                      <h4 className="font-medium mb-2">Videos:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {course.videos.slice(0, 3).map((video, index) => (
                          <li key={index} className="line-clamp-1">
                            • {video.title}
                          </li>
                        ))}
                        {course.videos.length > 3 && (
                          <li className="text-purple-600">
                            + {course.videos.length - 3} more videos
                          </li>
                        )}
                      </ul>
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50 border-t p-4 justify-end gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setCourseToDelete(course._id)}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </Button>
                      <Link to={`/instructor/courses/edit/${course._id}`}>
                        <Button variant="outline" size="sm">
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Link to={`/instructor/courses/${course._id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this course and remove all student enrollments.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingCourse}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteCourse}
              disabled={deletingCourse}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingCourse ? "Deleting..." : "Delete Course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
