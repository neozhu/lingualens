'use client'

import { cn } from "@/lib/utils"
import { Mic, Square } from "lucide-react"
import { useTranslations } from "next-intl"
import { PromptInputButton } from "@/components/ai-elements/prompt-input"

interface VoiceRecordingButtonProps {
  isListening: boolean
  isRecording: boolean
  isTranscribing: boolean
  isSpeechSupported: boolean
  onToggleRecording: () => void
  className?: string
}

export function VoiceRecordingButton({
  isListening,
  isRecording,
  isTranscribing,
  isSpeechSupported,
  onToggleRecording,
  className,
}: VoiceRecordingButtonProps) {
  const t = useTranslations('chat')
  
  const isActive = isListening || isRecording || isTranscribing
  const variant = isActive ? 'destructive' : 'ghost'
  const buttonClassName = cn(isActive && 'animate-pulse', className)

  return (
    <PromptInputButton
      aria-label={isActive ? t('stop') : "Voice input"}
      type="button"
      onClick={onToggleRecording}
      disabled={!isSpeechSupported}
      variant={variant}
      className={buttonClassName}
    >
      {isActive ? <Square className="size-4" /> : <Mic className="size-4" />}
    </PromptInputButton>
  )
}
