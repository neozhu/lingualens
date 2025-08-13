'use client'

import { Volume2, CircleStop } from "lucide-react"
import { useTranslations } from "next-intl"
import { Action } from "@/components/ai-elements/actions"

interface TextToSpeechButtonProps {
  text: string
  messageId: string
  isSpeaking: boolean
  onToggleSpeech: (text: string, messageId: string) => void
}

export function TextToSpeechButton({
  text,
  messageId,
  isSpeaking,
  onToggleSpeech,
}: TextToSpeechButtonProps) {
  const t = useTranslations('chat')

  return (
    <Action
      aria-label={t('readAloud')}
      tooltip={isSpeaking ? t('stop') : t('readAloud')}
      onClick={() => onToggleSpeech(text, messageId)}
    >
      {isSpeaking ? (
        <CircleStop className="h-4 w-4 text-primary" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Action>
  )
}
