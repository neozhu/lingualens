'use client'

import { Volume2, CircleStop, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Action } from "@/components/ai-elements/actions"

interface TextToSpeechButtonProps {
  text: string
  messageId: string
  isSpeaking: boolean
  isLoading?: boolean
  onToggleSpeech: (text: string, messageId: string) => void
}

export function TextToSpeechButton({
  text,
  messageId,
  isSpeaking,
  isLoading = false,
  onToggleSpeech,
}: TextToSpeechButtonProps) {
  const t = useTranslations('chat')

  // Determine current state and tooltip text
  const getTooltip = () => {
    if (isLoading) return t('loading') || 'Loading...'
    if (isSpeaking) return t('stop')
    return t('readAloud')
  }

  // Determine which icon to display
  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />
    }
    if (isSpeaking) {
      return <CircleStop className="h-4 w-4 text-primary" />
    }
    return <Volume2 className="h-4 w-4" />
  }

  return (
    <Action
      aria-label={t('readAloud')}
      tooltip={getTooltip()}
      onClick={() => onToggleSpeech(text, messageId)}
      disabled={isLoading}
    >
      {getIcon()}
    </Action>
  )
}
