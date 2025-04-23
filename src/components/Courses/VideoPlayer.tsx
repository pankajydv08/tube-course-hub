
import { useState, useEffect, useRef } from "react";
import { Play, Pause, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onComplete?: () => void;
  isCompleted?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({ 
  videoId, 
  title,
  onComplete,
  isCompleted = false
}: VideoPlayerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(isCompleted);
  const playerRef = useRef<HTMLDivElement>(null);
  const timeUpdateIntervalRef = useRef<number | null>(null);

  // Load YouTube API
  useEffect(() => {
    // If the YouTube API script is already loaded, don't load it again
    if (window.YT) {
      initializePlayer();
      return;
    }

    // Create the script tag
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up the callback
    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      // Clean up
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, []);

  // Initialize player once the API is loaded
  const initializePlayer = () => {
    if (!playerRef.current) return;

    const newPlayer = new window.YT.Player(playerRef.current, {
      height: "100%",
      width: "100%",
      videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });

    setPlayer(newPlayer);
  };

  // Handle player ready event
  const onPlayerReady = (event: any) => {
    setPlayerReady(true);
    setDuration(event.target.getDuration());
  };

  // Handle player state changes
  const onPlayerStateChange = (event: any) => {
    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        setPlaying(true);
        startTimeUpdate();
        break;
      case window.YT.PlayerState.PAUSED:
        setPlaying(false);
        stopTimeUpdate();
        break;
      case window.YT.PlayerState.ENDED:
        setPlaying(false);
        stopTimeUpdate();
        setCompleted(true);
        if (onComplete && !completed) {
          onComplete();
        }
        break;
      default:
        break;
    }
  };

  // Update video progress every second when playing
  const startTimeUpdate = () => {
    if (timeUpdateIntervalRef.current) return;
    
    timeUpdateIntervalRef.current = window.setInterval(() => {
      if (player && typeof player.getCurrentTime === 'function') {
        const currentTime = player.getCurrentTime();
        setCurrentTime(currentTime);
        
        const newProgress = duration 
          ? Math.min(Math.round((currentTime / duration) * 100), 100) 
          : 0;
        setProgress(newProgress);
        
        // Mark as completed when reached 95% of the video
        if (newProgress >= 95 && !completed) {
          setCompleted(true);
          if (onComplete) {
            onComplete();
          }
        }
      }
    }, 1000);
  };

  // Stop updating time
  const stopTimeUpdate = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!player) return;
    
    if (playing) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTimeUpdate();
      setPlayer(null);
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-gray-900">
        <div ref={playerRef} className="absolute inset-0" />
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-lg line-clamp-1">{title}</h3>
          {completed && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle size={16} className="mr-1" />
              <span>Completed</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={togglePlay}
              disabled={!playerReady}
              className="h-8 w-8"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            
            <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all", 
                  completed ? "bg-green-600" : "bg-purple-600"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <span className="text-xs text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
