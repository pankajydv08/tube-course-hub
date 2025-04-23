
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { VideoPlayer } from "@/components/Courses/VideoPlayer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { courseApi } from "@/lib/api";
import { Enrollment, Video } from "@/lib/types";
import { Check, BookOpen, ArrowLeft, CheckCircle } from "lucide-react";
import { stringToColor, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function CourseView() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedVideos, setCompletedVideos] = useState<number[]>([]);

  // Fetch enrollment data
  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        setLoading(true);
        if (!enrollmentId) return;
        
        const enrollmentsData = await courseApi.getEnrolledCourses();
        const currentEnrollment = enrollmentsData.enrollments.find(
          (e: Enrollment) => e._id === enrollmentId
        );
        
        if (!currentEnrollment) {
          toast.error("Enrollment not found");
          navigate("/student/enrollments");
          return;
        }
        
        setEnrollment(currentEnrollment);
        setCompletedVideos(currentEnrollment.progress);
        
        // Find first incomplete video to watch
        if (currentEnrollment.progress.length > 0 && currentEnrollment.completionPercentage < 100) {
          const firstIncompleteIndex = currentEnrollment.course.videos.findIndex(
            (_, index) => !currentEnrollment.progress.includes(index)
          );
          
          if (firstIncompleteIndex !== -1) {
            setCurrentVideoIndex(firstIncompleteIndex);
          }
        }
      } catch (error) {
        console.error("Error fetching enrollment:", error);
        toast.error("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrollment();
  }, [enrollmentId, navigate]);

  // Mark video as completed
  const handleVideoComplete = async () => {
    if (!enrollment || !enrollmentId) return;
    
    try {
      if (completedVideos.includes(currentVideoIndex)) {
        // Already completed, no need to update
        return;
      }
      
      await courseApi.markVideoCompleted(enrollmentId, currentVideoIndex);
      
      // Update local state
      const updatedCompletedVideos = [...completedVideos, currentVideoIndex];
      setCompletedVideos(updatedCompletedVideos);
      
      // Update enrollment progress
      setEnrollment({
        ...enrollment,
        completedVideos: updatedCompletedVideos.length,
        completionPercentage: Math.round(
          (updatedCompletedVideos.length / enrollment.course.videos.length) * 100
        ),
        progress: updatedCompletedVideos
      });
      
      // Auto-advance to next video if not last video
      if (currentVideoIndex < enrollment.course.videos.length - 1) {
        setTimeout(() => {
          setCurrentVideoIndex(currentVideoIndex + 1);
        }, 1500);
      }
      
      if (updatedCompletedVideos.length === enrollment.course.videos.length) {
        toast.success("🎉 Congratulations! You've completed this course!");
      }
    } catch (error) {
      console.error("Error marking video as completed:", error);
      toast.error("Failed to update progress");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading course content...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!enrollment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Course not found or you're not enrolled</p>
          <Link to="/student/browse">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const currentVideo = enrollment.course.videos[currentVideoIndex];
  const instructorInitials = enrollment.course.instructor.name
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarColor = stringToColor(enrollment.course.instructor.name);
  const completionPercentage = Math.round(
    (completedVideos.length / enrollment.course.videos.length) * 100
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to My Courses
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <Badge className="mb-2">{enrollment.course.category}</Badge>
            <h1 className="text-2xl font-bold mb-1">{enrollment.course.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback style={{ backgroundColor: avatarColor }}>
                {instructorInitials}
              </AvatarFallback>
            </Avatar>
            <span>{enrollment.course.instructor.name}</span>
          </div>
          <div className="flex items-center">
            <BookOpen size={14} className="mr-1" />
            <span>{enrollment.course.videos.length} videos</span>
          </div>
          <div className="flex items-center">
            <CheckCircle size={14} className="mr-1" />
            <span>{completionPercentage}% complete</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <VideoPlayer 
            videoId={currentVideo.youtubeId}
            title={currentVideo.title}
            onComplete={handleVideoComplete}
            isCompleted={completedVideos.includes(currentVideoIndex)}
          />
          
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">About This Course</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{enrollment.course.description}</p>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Course Details:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-32">Category:</span>
                    <Badge variant="outline">{enrollment.course.category}</Badge>
                  </li>
                  <li className="flex items-center">
                    <span className="w-32">Created By:</span>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback style={{ backgroundColor: avatarColor }}>
                          {instructorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span>{enrollment.course.instructor.name}</span>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <span className="w-32">Created On:</span>
                    <span>{formatDate(enrollment.course.createdAt)}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-32">Enrolled On:</span>
                    <span>{formatDate(enrollment.enrolledAt)}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-32">Total Videos:</span>
                    <span>{enrollment.course.videos.length}</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Video List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">
                Course Content ({completedVideos.length}/{enrollment.course.videos.length} completed)
              </h2>
            </CardHeader>
            <div className="max-h-[600px] overflow-y-auto">
              {enrollment.course.videos.map((video: Video, index: number) => {
                const isActive = currentVideoIndex === index;
                const isCompleted = completedVideos.includes(index);
                
                return (
                  <div 
                    key={index}
                    className={`
                      p-4 border-b cursor-pointer hover:bg-purple-50 transition-colors flex justify-between items-center
                      ${isActive ? 'bg-purple-100' : 'bg-white'}
                    `}
                    onClick={() => setCurrentVideoIndex(index)}
                  >
                    <div className="flex items-center">
                      <div className={`
                        flex items-center justify-center h-6 w-6 rounded-full mr-3
                        ${isCompleted 
                          ? 'bg-green-100 text-green-600' 
                          : isActive 
                          ? 'bg-purple-200 text-purple-700' 
                          : 'bg-gray-100 text-gray-500'
                        }
                      `}>
                        {isCompleted ? (
                          <Check size={14} />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span className={`
                        ${isActive ? 'font-medium' : ''}
                        ${isCompleted ? 'text-gray-500 line-through' : ''}
                      `}>
                        {video.title}
                      </span>
                    </div>
                    
                    {isActive && (
                      <Badge variant="secondary">Currently Watching</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
