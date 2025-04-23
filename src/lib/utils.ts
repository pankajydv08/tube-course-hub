
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines multiple class names using clsx and tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date string
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Extract YouTube ID from various YouTube URL formats
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  
  // Regular YouTube URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return match[2];
  }
  
  // Short URLs
  const shortRegExp = /^.*(youtu.be\/)([^#&?]*).*/;
  const shortMatch = url.match(shortRegExp);
  
  if (shortMatch && shortMatch[2].length === 11) {
    return shortMatch[2];
  }
  
  return null;
}

// Format seconds to MM:SS format
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Calculate progress percentage
export function calculateProgressPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Validate YouTube URL
export function isValidYoutubeUrl(url: string): boolean {
  return !!extractYoutubeId(url);
}

// Generate a random avatar color based on a string
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    "#9b87f5", // Primary purple
    "#7E69AB", // Secondary purple
    "#6E59A5", // Tertiary purple
    "#D6BCFA", // Light purple
    "#E5DEFF", // Soft purple
    "#8B5CF6"  // Vivid purple
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
