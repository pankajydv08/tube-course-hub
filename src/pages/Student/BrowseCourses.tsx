
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { courseApi } from "@/lib/api";
import { Course, Enrollment, CategoryCount } from "@/lib/types";
import { CourseCard } from "@/components/Courses/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { calculateProgressPercentage } from "@/lib/utils";

export default function BrowseCourses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  // Fetch courses and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all courses
        const coursesData = await courseApi.getAllCourses();
        setCourses(coursesData.courses);
        
        // Get categories
        const categoriesData = await courseApi.getCategories();
        setCategories(categoriesData.categories);
        
        // Get user enrollments to check which courses are already enrolled
        try {
          const enrollmentsData = await courseApi.getEnrolledCourses();
          setEnrollments(enrollmentsData.enrollments);
        } catch (error) {
          // If not logged in or other error, just ignore
          console.log("Could not fetch enrollments, user might not be logged in");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter courses based on search and category
  useEffect(() => {
    if (courses.length === 0) return;
    
    let filtered = [...courses];
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(course => 
        course.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      
      // Update URL params
      searchParams.set("category", selectedCategory);
      setSearchParams(searchParams);
    } else {
      searchParams.delete("category");
      setSearchParams(searchParams);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(term) || 
        course.description.toLowerCase().includes(term)
      );
      
      // Update URL params
      searchParams.set("search", searchTerm);
      setSearchParams(searchParams);
    } else {
      searchParams.delete("search");
      setSearchParams(searchParams);
    }
    
    setFilteredCourses(filtered);
  }, [courses, selectedCategory, searchTerm, searchParams, setSearchParams]);

  // Handle enrollment
  const handleEnrollCourse = async (courseId: string) => {
    try {
      const response = await courseApi.enrollCourse(courseId);
      toast.success("Successfully enrolled in course!");
      
      // Add the new enrollment to state
      setEnrollments(prev => [response.enrollment, ...prev]);
    } catch (error) {
      console.error("Failed to enroll:", error);
      toast.error("Failed to enroll in course");
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No need to do anything here as the effect will update when searchTerm changes
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    searchParams.delete("search");
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-4">Browse Courses</h1>
          <p className="text-gray-600">
            Discover and enroll in courses created by expert instructors
          </p>
        </div>
        
        {/* Search & Filter */}
        <div className="bg-white p-6 rounded-lg border">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow space-y-2">
                <label htmlFor="search" className="text-sm font-medium">Search Courses</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="search"
                    placeholder="Search by title or description..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48 space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  <Search size={18} className="mr-2" />
                  Search
                </Button>
                
                {(searchTerm || selectedCategory) && (
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    <X size={18} className="mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </form>
          
          {/* Active filters display */}
          {(searchTerm || selectedCategory) && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500 flex items-center">
                <Filter size={14} className="mr-1" />
                Filters:
              </span>
              
              {selectedCategory && (
                <div className="bg-purple-100 text-purple-800 text-sm py-1 px-3 rounded-full flex items-center">
                  Category: {selectedCategory}
                  <button 
                    onClick={() => setSelectedCategory("")}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              {searchTerm && (
                <div className="bg-purple-100 text-purple-800 text-sm py-1 px-3 rounded-full flex items-center">
                  "{searchTerm}"
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              
              <div className="ml-auto text-sm text-gray-500">
                Showing {filteredCourses.length} of {courses.length} courses
              </div>
            </div>
          )}
        </div>
        
        {/* Course List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filters to find courses
            </p>
            <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
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
                  onEnroll={handleEnrollCourse}
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
