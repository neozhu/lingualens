import { useState, useEffect, useCallback } from 'react'
import type { Message as ChatMessage } from '@/components/ui/chat'

export type HistoryMessage = ChatMessage & { createdAt?: Date }

export interface ChatSession {
  id: string
  date: string
  timestamp: number
  messages: HistoryMessage[]
  scene: string
  model: string
}

export interface GroupedChatHistory {
  date: string
  sessions: ChatSession[]
}

const STORAGE_KEY = 'lingualens-chat-history'

export function useChatHistory() {
  const [history, setHistory] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Generate new session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Get today's date string
  const getTodayDateString = useCallback(() => {
    return new Date().toISOString().split('T')[0]
  }, [])

  // Load history from localStorage
  const loadHistory = useCallback(() => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ChatSession[]
        // Ensure correct date format and filter out empty sessions
        return parsed
          .filter(session => session.messages && session.messages.length > 0)
          .map(session => ({
            ...session,
            messages: session.messages.map(msg => ({
              ...msg,
              createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date()
            }))
          }))
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
    return []
  }, [])

  // Save history to localStorage
  const saveHistory = useCallback((sessions: ChatSession[]) => {
    if (typeof window === 'undefined') return
    
    try {
      // Only keep records from the last 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
      const filtered = sessions.filter(session => session.timestamp > thirtyDaysAgo)
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      setHistory(filtered)
    } catch (error) {
      console.error('Failed to save chat history:', error)
    }
  }, [])

  // Initialize and load history
  useEffect(() => {
    const loaded = loadHistory()
    setHistory(loaded)
  }, [loadHistory])

  // Create new session
  const createNewSession = useCallback((scene: string, model: string) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create session but don't save to history immediately
    // Session will be saved when first message is added via updateSessionMessages
    
    return sessionId
  }, [])

  // Update session messages
  const updateSessionMessages = useCallback((sessionId: string, messages: HistoryMessage[], scene?: string, model?: string) => {
    if (!sessionId) return
    
    setHistory(prevHistory => {
      // Don't save session if messages are empty
      if (messages.length === 0) {
        return prevHistory.filter(session => session.id !== sessionId)
      }
      
      // Find existing session
      const existingSessionIndex = prevHistory.findIndex(session => session.id === sessionId)
      
      let updatedHistory: ChatSession[]
      
      if (existingSessionIndex >= 0) {
        // Update existing session
        updatedHistory = prevHistory.map(session => 
          session.id === sessionId 
            ? { ...session, messages, timestamp: Date.now() }
            : session
        )
      } else {
        // Create new session (only when there are messages)
        const newSession: ChatSession = {
          id: sessionId,
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          messages,
          scene: scene || '日常沟通',
          model: model || 'gemini-2.5-flash-preview-05-20'
        }
        updatedHistory = [...prevHistory, newSession]
      }
      
      // Only save sessions with messages
      const filteredHistory = updatedHistory.filter(session => session.messages.length > 0)
      
      // Save directly without relying on saveHistory
      if (typeof window !== 'undefined') {
        try {
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
          const finalFiltered = filteredHistory.filter(session => session.timestamp > thirtyDaysAgo)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalFiltered))
          return finalFiltered
        } catch (error) {
          console.error('Failed to save chat history:', error)
        }
      }
      
      return filteredHistory
    })
  }, [])

  // Get today's sessions
  const getTodaySessions = useCallback(() => {
    const today = getTodayDateString()
    return history.filter(session => session.date === today)
  }, [history, getTodayDateString])

  // Group history by date
  const getGroupedHistory = useCallback((): GroupedChatHistory[] => {
    const grouped = history.reduce((acc, session) => {
      const date = session.date
      const existing = acc.find(group => group.date === date)
      
      if (existing) {
        existing.sessions.push(session)
      } else {
        acc.push({
          date,
          sessions: [session]
        })
      }
      
      return acc
    }, [] as GroupedChatHistory[])

    // Sort by date in descending order
    return grouped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(group => ({
        ...group,
        sessions: group.sessions.sort((a, b) => b.timestamp - a.timestamp)
      }))
  }, [history])

  // Load specific session
  const loadSession = useCallback((sessionId: string): ChatSession | null => {
    const session = history.find(s => s.id === sessionId)
    if (session && session.messages.length > 0) {
      setCurrentSessionId(sessionId)
      return session // Return the whole session object
    }
    return null // Return null if session not found or empty
  }, [history])

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.filter(session => session.id !== sessionId)
      
      // Save directly to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
        } catch (error) {
          console.error('Failed to save chat history:', error)
        }
      }
      
      return updatedHistory
    })
    
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null)
    }
  }, [currentSessionId])

  // Clear all history
  const clearAllHistory = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    setHistory([])
    setCurrentSessionId(null)
  }, [])

  // Clear today's history
  const clearTodayHistory = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.filter(session => session.date !== today)
      
      // Save directly to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
        } catch (error) {
          console.error('Failed to save chat history:', error)
        }
      }
      
      return updatedHistory
    })
  }, [])

  // Refresh history (reload from localStorage)
  const refreshHistory = useCallback(() => {
    const loaded = loadHistory()
    setHistory(loaded)
  }, [loadHistory])

  // Clear history by date
  const clearHistoryByDate = useCallback((dateToClear: string) => {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.filter(session => session.date !== dateToClear)
      
      // Save directly to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
        } catch (error) {
          console.error('Failed to save chat history:', error)
        }
      }
      
      return updatedHistory
    })
  }, [])

  return {
    history,
    currentSessionId,
    createNewSession,
    updateSessionMessages,
    getTodaySessions,
    getGroupedHistory,
    loadSession,
    deleteSession,
    clearAllHistory,
    clearTodayHistory,
    refreshHistory,
    setCurrentSessionId,
    clearHistoryByDate
  }
} 