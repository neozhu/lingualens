/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
} from "react"
import { Square as SquareIcon, RefreshCw, Copy, Check, Brain, FileIcon } from "lucide-react"
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
import { Paperclip } from "lucide-react"
import { useAudioManager } from "@/hooks/use-audio-manager"
import { VoiceRecordingButton, TextToSpeechButton } from "@/components/audio"
import { FilePreview } from "@/components/ui/file-preview"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

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
        {files && files.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-b p-3 pb-2">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                file={file}
                onRemove={() =>
                  setFiles((prev) => {
                    if (!prev) return prev
                    const next = prev.filter((_, i) => i !== index)
                    return next.length > 0 ? next : null
                  })
                }
              />
            ))}
          </div>
        ) : null}
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
              accept="image/*,.pdf,.txt,.md,.csv,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              className="hidden"
              onChange={(e) => {
                const list = e.currentTarget.files
                if (!list || list.length === 0) return
                const selectedFiles = Array.from(list)
                setFiles((prev) => {
                  if (!prev || prev.length === 0) return selectedFiles
                  const map = new Map<string, File>()
                  for (const file of prev) {
                    map.set(`${file.name}-${file.size}-${file.lastModified}`, file)
                  }
                  for (const file of selectedFiles) {
                    map.set(`${file.name}-${file.size}-${file.lastModified}`, file)
                  }
                  return Array.from(map.values())
                })
                // Clear selection so the same file can be selected again later.
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
            />
            <PromptInputButton
              aria-label="Attach files"
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating}
            >
              <Paperclip className="size-4" />
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
          <PromptInputSubmit
            status={status}
            disabled={isGenerating || (input.trim() === '' && (!files || files.length === 0))}
          />
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

  const renderUserAttachments = (m: Message): ReactNode => {
    const parts = Array.isArray((m as any).parts) ? (m as any).parts : []
    const files = parts.filter((p: any) => p?.type === "file" && typeof p?.url === "string")
    if (files.length === 0) return null

    return (
      <div className="flex flex-wrap gap-2">
        {files.map((file: any, index: number) => {
          const key = `${file.filename ?? "file"}-${index}`
          const isImage = typeof file.mediaType === "string" && file.mediaType.startsWith("image/")

          if (isImage) {
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPreviewImage({ url: file.url, name: file.filename || "Attachment" })}
                aria-label={`Preview ${file.filename || "attachment image"}`}
                className="overflow-hidden rounded-md border border-primary-foreground/30 bg-primary-foreground/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.filename || "Attachment"}
                  className="h-24 w-24 object-cover"
                />
              </button>
            )
          }

          return (
            <div
              key={key}
              className="flex max-w-[220px] items-center gap-2 rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-2 py-1 text-xs text-primary-foreground"
            >
              <FileIcon className="h-4 w-4 shrink-0 text-primary-foreground/80" />
              <span className="truncate">{file.filename || "Attachment"}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const [copiedByKey, setCopiedByKey] = useState<Record<string, boolean>>({})
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null)
  
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
                {from === 'assistant' ? (
                  <Response>{text}</Response>
                ) : (
                  <div className="flex flex-col gap-2">
                    {renderUserAttachments(m)}
                    {text ? <div>{text}</div> : null}
                  </div>
                )}
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
      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null)
        }}
      >
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none" showCloseButton={false}>
          <DialogTitle className="sr-only">{previewImage?.name || "Attachment preview"}</DialogTitle>
          {previewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImage.url}
              alt={previewImage.name}
              className="max-h-[85vh] w-auto max-w-[90vw] rounded-lg object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
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
