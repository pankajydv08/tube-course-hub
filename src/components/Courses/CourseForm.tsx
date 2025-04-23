
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Youtube } from "lucide-react";
import { extractYoutubeId } from "@/lib/utils";
import { CourseFormData } from "@/lib/types";

const CATEGORIES = [
  "Web Development",
  "Data Science",
  "Mobile Development",
  "DevOps",
  "Machine Learning",
  "Cybersecurity",
  "Design",
  "Blockchain",
  "Business",
  "Marketing",
  "Personal Development",
  "Other"
];

interface CourseFormProps {
  initialData?: CourseFormData;
  onSubmit: (data: CourseFormData) => void;
  isSubmitting: boolean;
}

export function CourseForm({ initialData, onSubmit, isSubmitting }: CourseFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [videos, setVideos] = useState<{ title: string; youtubeId: string; }[]>(
    initialData?.videos || [{ title: "", youtubeId: "" }]
  );
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    category?: string;
    videos?: string;
  }>({});

  // Add a new video field
  const addVideoField = () => {
    setVideos([...videos, { title: "", youtubeId: "" }]);
  };

  // Remove a video field
  const removeVideoField = (index: number) => {
    if (videos.length === 1) return; // Always keep at least one video field
    const updatedVideos = [...videos];
    updatedVideos.splice(index, 1);
    setVideos(updatedVideos);
  };

  // Update video field
  const updateVideoField = (index: number, field: "title" | "youtubeId", value: string) => {
    const updatedVideos = [...videos];
    
    if (field === "youtubeId" && value) {
      // Try to extract YouTube ID if user pasted a full URL
      const youtubeId = extractYoutubeId(value);
      updatedVideos[index][field] = youtubeId || value;
    } else {
      updatedVideos[index][field] = value;
    }
    
    setVideos(updatedVideos);
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: {
      title?: string;
      description?: string;
      category?: string;
      videos?: string;
    } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!category) {
      newErrors.category = "Category is required";
    }

    // Check if all video fields have both title and youtubeId
    const hasEmptyVideo = videos.some(video => !video.title.trim() || !video.youtubeId.trim());
    if (hasEmptyVideo) {
      newErrors.videos = "All video fields must be filled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        title,
        description,
        category,
        videos
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Course basic info */}
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Course Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter course title"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Course Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter course description"
            rows={5}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value)}
          >
            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category}</p>
          )}
        </div>
      </div>

      {/* Videos section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Course Videos</h3>
          <Button
            type="button"
            onClick={addVideoField}
            variant="outline"
            size="sm"
          >
            <Plus size={16} className="mr-1" />
            Add Video
          </Button>
        </div>

        {errors.videos && (
          <p className="text-sm text-red-500">{errors.videos}</p>
        )}

        <div className="space-y-4">
          {videos.map((video, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`video-title-${index}`}>Video Title</Label>
                    <Input
                      id={`video-title-${index}`}
                      value={video.title}
                      onChange={(e) => updateVideoField(index, "title", e.target.value)}
                      placeholder="Video title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`video-id-${index}`} className="flex items-center">
                      <Youtube size={16} className="mr-2 text-red-600" />
                      <span>YouTube Video ID or URL</span>
                    </Label>
                    <Input
                      id={`video-id-${index}`}
                      value={video.youtubeId}
                      onChange={(e) => updateVideoField(index, "youtubeId", e.target.value)}
                      placeholder="e.g. dQw4w9WgXcQ or full YouTube URL"
                    />
                  </div>
                </div>
                
                {videos.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVideoField(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-800"
                  >
                    <X size={16} />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </form>
  );
}
