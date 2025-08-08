"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import type { Message as ChatMessage } from '@/components/ui/chat'

type HistoryMessage = ChatMessage & { createdAt?: Date }

interface ChatContextType {
  loadedMessages: HistoryMessage[]
  loadedSessionId: string | null
  loadedSessionModel: string | null
  loadedSessionScene: string | null
  shouldClearMessages: boolean
  setLoadedMessages: (messages: HistoryMessage[]) => void
  setLoadedSessionId: (sessionId: string | null) => void
  setLoadedSessionModel: (model: string | null) => void
  setLoadedSessionScene: (sceneName: string | null) => void
  clearLoadedSession: () => void
  triggerClearMessages: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [loadedMessages, setLoadedMessages] = useState<HistoryMessage[]>([])
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null)
  const [loadedSessionModel, setLoadedSessionModel] = useState<string | null>(null)
  const [loadedSessionScene, setLoadedSessionScene] = useState<string | null>(null)
  const [shouldClearMessages, setShouldClearMessages] = useState(false)

  const clearLoadedSession = () => {
    setLoadedMessages([])
    setLoadedSessionId(null)
    setLoadedSessionModel(null)
    setLoadedSessionScene(null)
  }

  const triggerClearMessages = () => {
    setShouldClearMessages(true)
    // Reset flag
    setTimeout(() => setShouldClearMessages(false), 100)
  }

  return (
    <ChatContext.Provider value={{
      loadedMessages,
      loadedSessionId,
      loadedSessionModel,
      loadedSessionScene,
      shouldClearMessages,
      setLoadedMessages,
      setLoadedSessionId,
      setLoadedSessionModel,
      setLoadedSessionScene,
      clearLoadedSession,
      triggerClearMessages
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
} 