"use client"

import * as React from "react"
import { Volume2Icon, CircleStopIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ReadAloudButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string
  className?: string
}

export function ReadAloudButton({
  text,
  className,
  ...props
}: ReadAloudButtonProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const handlePlay = React.useCallback(async () => {
    if (!text) return
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      return
    }
    
    setIsPlaying(true)
    
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      
      if (!res.ok) {
        console.error('TTS API error:', res.status, res.statusText);
        setIsPlaying(false);
        return;
      }
      
      const blob = await res.blob()
      console.log('Audio blob received:', { 
        size: blob.size, 
        type: blob.type,
        actualType: res.headers.get('content-type')
      });
      
      if (blob.size === 0) {
        console.error('Audio blob is empty');
        setIsPlaying(false);
        return;
      }
      
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      
      // Add more detailed error handling
      audio.addEventListener('loadstart', () => console.log('Audio loadstart'));
      audio.addEventListener('loadedmetadata', () => console.log('Audio metadata loaded:', { duration: audio.duration }));
      audio.addEventListener('canplay', () => console.log('Audio can play'));
      audio.addEventListener('error', (e) => {
        console.error('Audio error event:', e);
        const audioElement = e.target as HTMLAudioElement;
        if (audioElement.error) {
          console.error('Audio error details:', {
            code: audioElement.error.code,
            message: audioElement.error.message,
            MEDIA_ERR_ABORTED: audioElement.error.MEDIA_ERR_ABORTED,
            MEDIA_ERR_NETWORK: audioElement.error.MEDIA_ERR_NETWORK,
            MEDIA_ERR_DECODE: audioElement.error.MEDIA_ERR_DECODE,
            MEDIA_ERR_SRC_NOT_SUPPORTED: audioElement.error.MEDIA_ERR_SRC_NOT_SUPPORTED
          });
        }
        setIsPlaying(false);
      });
      
      audio.onended = () => setIsPlaying(false);
      
      // Try to play the audio
      try {
        await audio.play();
        console.log('Audio started playing successfully');
      } catch (playError) {
        console.error('Audio play error:', playError);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
    }
  }, [text, isPlaying])

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={isPlaying ? "Stop reading aloud" : "Read aloud"}
      className={cn(
        "relative z-10 h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50",
        className
      )}
      onClick={handlePlay}
      {...props}
    >
      {isPlaying ? (
        <CircleStopIcon className="h-3 w-3" />
      ) : (
        <Volume2Icon className="h-3 w-3" />
      )}
      <span className="sr-only">{isPlaying ? "Stop reading aloud" : "Read aloud"}</span>
    </Button>
  )
}