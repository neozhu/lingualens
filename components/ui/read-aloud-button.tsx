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
    
    console.log('🎵 Starting TTS request for text:', text);
    setIsPlaying(true)
    
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      
      console.log('📡 TTS API response status:', res.status);
      console.log('📡 TTS API response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ TTS API error:', errorText);
        setIsPlaying(false);
        return;
      }
      
      const blob = await res.blob()
      console.log('🎵 Audio blob received, size:', blob.size, 'type:', blob.type);
      
      if (blob.size === 0) {
        console.error('❌ Audio blob is empty');
        setIsPlaying(false);
        return;
      }
      
      const url = URL.createObjectURL(blob)
      console.log('🔗 Audio URL created:', url);
      
      const audio = new Audio(url)
      audioRef.current = audio
      
      audio.onloadstart = () => console.log('🎵 Audio loadstart');
      audio.oncanplay = () => console.log('🎵 Audio can play');
      audio.onplay = () => console.log('🎵 Audio started playing');
      audio.onended = () => {
        console.log('🎵 Audio ended');
        setIsPlaying(false);
      };
      audio.onerror = (e) => {
        console.error('❌ Audio error:', e);
        setIsPlaying(false);
      };
      
      await audio.play();
      console.log('🎵 Audio play() called');
    } catch (error) {
      console.error('❌ TTS error:', error);
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