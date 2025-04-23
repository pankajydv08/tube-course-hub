
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { stringToColor, formatDate, truncateText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Course } from "@/lib/types";
import { BookOpen } from "lucide-react";

interface CourseCardProps {
  course: Course;
  showEnrollButton?: boolean;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
  enrollmentId?: string;
  progressPercentage?: number;
}

export function CourseCard({
  course,
  showEnrollButton = false,
  onEnroll,
  isEnrolled = false,
  enrollmentId,
  progressPercentage = 0
}: CourseCardProps) {
  const instructorInitials = course.instructor.name
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  const avatarColor = stringToColor(course.instructor.name);
  
  const handleEnroll = () => {
    if (onEnroll) {
      onEnroll(course._id);
    }
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
      <CardHeader className="bg-purple-50 p-4">
        <Badge className="w-fit mb-2">{course.category}</Badge>
        <h3 className="text-lg font-bold line-clamp-2">
          {course.title}
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <BookOpen size={16} className="mr-1" />
          <span>{course.videos.length} videos</span>
        </div>
      </CardHeader>
      
      <CardContent className="py-4 flex-grow">
        <p className="text-gray-600 line-clamp-3">
          {truncateText(course.description, 150)}
        </p>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between p-4 border-t bg-gray-50">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback style={{ backgroundColor: avatarColor }}>
              {instructorInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{course.instructor.name}</p>
            <p className="text-xs text-gray-500">
              Created {formatDate(course.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="ml-2">
          {showEnrollButton ? (
            isEnrolled ? (
              <Link to={`/student/course/${enrollmentId}`}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Continue Learning
                </Button>
              </Link>
            ) : (
              <Button size="sm" onClick={handleEnroll}>
                Enroll
              </Button>
            )
          ) : (
            progressPercentage > 0 ? (
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-sm font-medium">{progressPercentage}%</span>
              </div>
            ) : null
          )}
        </div>
      </CardFooter>
      
      {/* Progress bar for enrolled courses */}
      {isEnrolled && progressPercentage > 0 && (
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-green-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </Card>
  );
}
