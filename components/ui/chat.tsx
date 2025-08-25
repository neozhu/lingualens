/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ReactElement,
} from "react"
import { Square as SquareIcon, RefreshCw, Copy, Check, Brain } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
// Local message type used by legacy code paths; now only used for shape.
export type Message = {
  id: string
  role: 'user' | 'assistant' | string
  content?: string
  parts?: Array<{ type?: string; text?: string }>
  toolInvocations?: Array<{
    state: 'partial-call' | 'call' | 'result'
    toolName?: string
    result?: unknown
  }>
}
import { PromptSuggestions } from "@/components/ui/prompt-suggestions"
import { Actions, Action } from "@/components/ai-elements/actions"
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
} from "@/components/ai-elements/prompt-input"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message as AIMessage, MessageContent } from "@/components/ai-elements/message"
import { Response } from "@/components/ai-elements/response"
import { MODELS } from "@/lib/models"
import { Paperclip, Loader2Icon } from "lucide-react"
import { useAudioManager } from "@/hooks/use-audio-manager"
import { VoiceRecordingButton, TextToSpeechButton } from "@/components/audio"

interface ChatPropsBase {
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList }
  ) => void
  messages: Array<Message>
  input: string
  className?: string
  handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement>
  isGenerating: boolean
  status?: 'submitted' | 'streaming' | 'ready' | 'error'
  stop?: () => void
  onRateResponse?: (
    messageId: string,
    rating: "thumbs-up" | "thumbs-down"
  ) => void
  setMessages?: (messages: any[]) => void
  transcribeAudio?: (blob: Blob) => Promise<string>
  selectedModel: string
  setSelectedModel: (id: string) => void
  // Optional: toggle whether to send reasoning ("thinking") tokens
  thinkingEnabled?: boolean
  onToggleThinking?: () => void
}

interface ChatPropsWithoutSuggestions extends ChatPropsBase {
  append?: never
  suggestions?: never
}

interface ChatPropsWithSuggestions extends ChatPropsBase {
  append: (message: { role: "user"; content: string }) => void
  suggestions: string[]
}

type ChatProps = ChatPropsWithoutSuggestions | ChatPropsWithSuggestions

export function Chat({
  messages,
  handleSubmit,
  input,
  handleInputChange,
  stop,
  isGenerating,
  status,
  append,
  suggestions,
  className,
  onRateResponse,
  setMessages,
  transcribeAudio,
  selectedModel,
  setSelectedModel,
  thinkingEnabled,
  onToggleThinking,
}: ChatProps) {
  const t = useTranslations('chat')
  const lastMessage = messages.at(-1)
  const isEmpty = messages.length === 0
  const lastAssistant = [...messages].slice().reverse().find(m => m.role === 'assistant')
  const lastAssistantText = lastAssistant && Array.isArray((lastAssistant as any).parts)
    ? (lastAssistant as any).parts.filter((p: any) => p?.type === 'text').map((p: any) => p.text).join('')
    : (lastAssistant as any)?.content ?? ''
  // Precise typing indicator: show while request is submitted/streaming and
  // - the last message is user (awaiting assistant), or
  // - the last assistant placeholder has not produced any text yet
  const isTyping = (
    status === 'submitted' || status === 'streaming' || isGenerating
  ) && (
    lastMessage?.role === 'user' || (lastMessage?.role === 'assistant' && lastAssistantText.length === 0)
  )

  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const [files, setFiles] = useState<File[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)

  // Audio manager - completely independent from chat states
  const audioManager = useAudioManager({
    transcribeAudio,
    onTranscriptionComplete: (text) => {
      handleInputChange({ target: { value: `${input}${text}` } } as any)
    },
  })

  // Enhanced stop function that marks pending tool calls as cancelled
  const handleStop = useCallback(() => {
    stop?.()

    if (!setMessages) return

    const latestMessages = [...messagesRef.current]
    const lastAssistantMessage = latestMessages.findLast(
      (m) => m.role === "assistant"
    )

    if (!lastAssistantMessage) return

    let needsUpdate = false
    let updatedMessage = { ...lastAssistantMessage }

    if (lastAssistantMessage.toolInvocations) {
      const updatedToolInvocations = lastAssistantMessage.toolInvocations.map(
        (toolInvocation) => {
          if (toolInvocation.state === "call") {
            needsUpdate = true
            return {
              ...toolInvocation,
              state: "result",
              result: {
                content: "Tool execution was cancelled",
                __cancelled: true, // Special marker to indicate cancellation
              },
            } as const
          }
          return toolInvocation
        }
      )

      if (needsUpdate) {
        updatedMessage = {
          ...updatedMessage,
          toolInvocations: updatedToolInvocations,
        }
      }
    }

    if (lastAssistantMessage.parts && lastAssistantMessage.parts.length > 0) {
      const updatedParts = lastAssistantMessage.parts.map((part: any) => {
        if (
          part.type === "tool-invocation" &&
          part.toolInvocation &&
          part.toolInvocation.state === "call"
        ) {
          needsUpdate = true
          return {
            ...part,
            toolInvocation: {
              ...part.toolInvocation,
              state: "result",
              result: {
                content: "Tool execution was cancelled",
                __cancelled: true,
              },
            },
          }
        }
        return part
      })

      if (needsUpdate) {
        updatedMessage = {
          ...updatedMessage,
          parts: updatedParts,
        }
      }
    }

    if (needsUpdate) {
      const messageIndex = latestMessages.findIndex(
        (m) => m.id === lastAssistantMessage.id
      )
      if (messageIndex !== -1) {
        latestMessages[messageIndex] = updatedMessage
        setMessages(latestMessages)
      }
    }
  }, [stop, setMessages, messagesRef])

  // rating and copy actions are temporarily removed in ai-elements migration

  return (
    <ChatContainer className={className}>
      {isEmpty && append && suggestions ? (
        <PromptSuggestions
          label={t('trySuggestions')}
          append={append}
          suggestions={suggestions}
        />
      ) : null}

      <ChatMessages messages={messages} append={append as any} />

      <PromptInput
        className="mt-auto"
        onSubmit={(e) => {
          if (files && files.length > 0) {
            const list = createFileList(files)
            handleSubmit(e as any, { experimental_attachments: list })
            setFiles(null)
          } else {
            handleSubmit(e as any)
          }
        }}
      >
        <PromptInputTextarea
          value={input}
          onChange={handleInputChange}
          placeholder={t('inputPlaceholder')}
        />
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputModelSelect value={selectedModel} onValueChange={setSelectedModel}>
              <PromptInputModelSelectTrigger className="w-[180px]">
                <PromptInputModelSelectValue placeholder="Select Model" />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {MODELS.map((model) => (
                  <PromptInputModelSelectItem key={model.id} value={model.id}>
                    {model.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>

            {typeof onToggleThinking === 'function' ? (
              <PromptInputButton
                aria-label="Toggle thinking"
                aria-pressed={!!thinkingEnabled}
                type="button"
                onClick={onToggleThinking}
                variant="ghost"
                title={thinkingEnabled ? t('thinkingOn') : t('thinkingOff')}
              >
                <Brain className={cn('size-4', thinkingEnabled ? 'text-primary' : 'text-muted-foreground')} />
              </PromptInputButton>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const list = e.currentTarget.files
                if (!list || list.length === 0) return
                const imageFiles = Array.from(list).filter((f) => f.type.startsWith('image/'))
                if (imageFiles.length === 0) return
                try {
                  setIsOcrProcessing(true)
                  const form = new FormData()
                  for (const f of imageFiles) form.append('images', f)
                  const res = await fetch('/api/ocr', { method: 'POST', body: form })
                  if (!res.ok) return
                  const data = (await res.json()) as { text?: string }
                  const text = (data?.text ?? '').trim()
                  if (!text) return
                  const sep = input && !input.endsWith('\n') ? '\n' : ''
                  const nextValue = `${input}${sep}${text}`
                  ;(handleInputChange as any)({ target: { value: nextValue } })
                  setTimeout(() => {
                    try { (handleSubmit as any)() } catch {}
                  }, 0)
                } finally {
                  setIsOcrProcessing(false)
                  // Clear the input selection so same files can be re-selected if needed
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }
              }}
            />
            <PromptInputButton
              aria-label="Attach files"
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating || isOcrProcessing}
            >
              {isOcrProcessing ? (
                <Loader2Icon  className={cn("size-4", "animate-pulse animate-spin")} />
              ) : (
                <Paperclip className="size-4" />
              )}
            </PromptInputButton>

            {/* Voice recording button - completely independent from chat state */}
            <VoiceRecordingButton
              isListening={audioManager.recording.isListening}
              isRecording={audioManager.recording.isRecording}
              isTranscribing={audioManager.recording.isTranscribing}
              isSpeechSupported={audioManager.recording.isSpeechSupported}
              onToggleRecording={audioManager.recording.toggleListening}
            />

          </PromptInputTools>
          <PromptInputSubmit status={status} disabled={isGenerating || input === ''} />
        </PromptInputToolbar>
      </PromptInput>
    </ChatContainer>
  )
}
Chat.displayName = "Chat"

export function ChatMessages({ messages, append }: { messages: Message[]; append?: (message: { role: "user"; content: string }) => unknown }) {
  const renderMessageText = (m: Message): string => {
    if (Array.isArray((m as any).parts)) {
      return (m as any).parts
        .filter((p: any) => p?.type === 'text')
        .map((p: any) => p.text)
        .join('')
    }
    return (m as any).content ?? ''
  }

  const [copiedByKey, setCopiedByKey] = useState<Record<string, boolean>>({})
  
  // Audio manager for TTS - independent from chat state
  const audioManager = useAudioManager()

  const t = useTranslations('chat')
  const tCommon = useTranslations('common')

  return (
    <Conversation className="relative w-full pb-4">
      <ConversationContent>
        {messages.map((m, index) => {
          const from: 'user' | 'assistant' | 'system' =
            m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'system'
          const text = renderMessageText(m)
          const key = m.id ?? `${m.role}-${index}`
          const handleRetry = () => {
            if (!append) return
            // find the nearest previous user message before this assistant response
            for (let i = index - 1; i >= 0; i--) {
              if (messages[i]?.role === 'user') {
                const prevText = renderMessageText(messages[i] as Message)
                if (prevText) {
                  append({ role: 'user', content: prevText })
                }
                break
              }
            }
          }
          return (
          <AIMessage key={key} from={from}>
            <div className="flex flex-col gap-0">
              <MessageContent>
                {from === 'assistant' ? <Response>{text}</Response> : text}
              </MessageContent>
              {from === 'assistant' && (
                <Actions className="mt-1 self-start">
                  <Action aria-label={tCommon('retry')} tooltip={tCommon('retry')} onClick={handleRetry}>
                    <RefreshCw className="h-4 w-4" />
                  </Action>
                  <Action
                    aria-label={t('copy')}
                    tooltip={t('copy')}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(text)
                        setCopiedByKey((prev) => ({ ...prev, [key]: true }))
                        setTimeout(() => {
                          setCopiedByKey((prev) => ({ ...prev, [key]: false }))
                        }, 1200)
                      } catch {}
                    }}
                  >
                    {copiedByKey[key] ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Action>
                  <TextToSpeechButton
                    text={text}
                    messageId={key}
                    isSpeaking={audioManager.tts.isSpeaking(key)}
                    isLoading={audioManager.tts.isLoading(key)}
                    onToggleSpeech={audioManager.tts.speakText}
                  />
                </Actions>
              )}
            </div>
          </AIMessage>
        )})}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}

export const ChatContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid max-h-full w-full grid-rows-[1fr_auto]", className)}
      {...props}
    />
  )
})
ChatContainer.displayName = "ChatContainer"

interface ChatFormProps {
  className?: string
  isPending: boolean
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList }
  ) => void
  children: (props: {
    files: File[] | null
    setFiles: React.Dispatch<React.SetStateAction<File[] | null>>
  }) => ReactElement
}

export const ChatForm = forwardRef<HTMLFormElement, ChatFormProps>(
  ({ children, handleSubmit, isPending, className }, ref) => {
    const [files, setFiles] = useState<File[] | null>(null)

    const onSubmit = (event: React.FormEvent) => {
      if (!files) {
        handleSubmit(event)
        return
      }

      const fileList = createFileList(files)
      handleSubmit(event, { experimental_attachments: fileList })
      setFiles(null)
    }

    return (
      <form ref={ref} onSubmit={onSubmit} className={className}>
        {children({ files, setFiles })}
      </form>
    )
  }
)
ChatForm.displayName = "ChatForm"

function createFileList(files: File[] | FileList): FileList {
  const dataTransfer = new DataTransfer()
  for (const file of Array.from(files)) {
    dataTransfer.items.add(file)
  }
  return dataTransfer.files
}
