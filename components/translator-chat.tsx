"use client"

import { useEffect, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { cn } from "@/lib/utils"
import { transcribeAudio } from "@/lib/utils/audio"
import { Chat } from "@/components/ui/chat"
import { toast } from "sonner"
import { SCENES as DEFAULT_SCENES, Scene } from "@/lib/scenes"
type Message = {
  id: string
  role: 'user' | 'assistant' | string
  content?: string
  parts?: Array<{ type?: string; text?: string }>
}
import { MODELS } from "@/lib/models"
import { SceneSelector } from "@/components/scene-selector"
import { useLocale } from "next-intl"
import { useChatHistory } from "@/hooks/use-chat-history"
import { useChatContext } from "@/components/chat-provider"

// no props currently

function getCustomScenes() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("customScenes");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function TranslatorChat() {  const [selectedModel, setSelectedModel] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedModel') || MODELS[0].id
  }
  return MODELS[0].id
})
  // Combine built-in scenes with local custom scenes for selection
  const [scenes, setScenes] = useState<Scene[]>(DEFAULT_SCENES);
  const [selectedScene, setSelectedScene] = useState(scenes[0]);
  const [input, setInput] = useState("");
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  
  const {
    currentSessionId,
    createNewSession,
    updateSessionMessages,
    setCurrentSessionId
  } = useChatHistory()
  
  const { loadedMessages, loadedSessionId, loadedSessionModel, loadedSessionScene, shouldClearMessages, clearLoadedSession } = useChatContext()
  
  useEffect(() => {
    const storedSceneName = localStorage.getItem("selectedScene")
    // Find scene by name if stored
    if (storedSceneName) {
      const combined = [...(getCustomScenes() || []), ...DEFAULT_SCENES]
      const foundScene = combined.find((s: Scene) => s.name === storedSceneName);
      if (foundScene) {
        setSelectedScene(foundScene);
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("selectedModel", selectedModel)
  }, [selectedModel])

  useEffect(() => {
    // Store just the name as string for backward compatibility
    localStorage.setItem("selectedScene", selectedScene.name)
  }, [selectedScene])
  
  const handleSceneClick = (scene: Scene) => {
    setSelectedScene(scene)
  }
  const locale = useLocale();
  type ChatHelpers = {
    messages: unknown[]
    input: string
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    handleSubmit: (e?: { preventDefault?: () => void }, options?: { experimental_attachments?: FileList }) => void
    error?: Error
    stop?: () => void
    status: 'submitted' | 'streaming' | 'ready' | 'error'
    setMessages: (msgs: unknown) => void
    sendMessage?: (msg: { text: string }, options?: { body?: Record<string, unknown> }) => unknown
    append?: (msg: { role: 'user'; content: string }) => unknown
  }

  const chat = useChat({}) as unknown as ChatHelpers

  const toChatStateMessage = (m: { id: string; role: "user" | "assistant" | "system" | "data"; content?: string; createdAt?: Date }): unknown => ({
    id: m.id,
    role: (m.role === 'data' ? 'user' : m.role),
    parts: [{ type: 'text', text: m.content ?? '' }],
  })

  const textFromChatStateMessage = (m: unknown): string => {
    if (typeof m === 'object' && m !== null) {
      const anyMsg = m as { content?: unknown; parts?: Array<{ type?: string; text?: unknown }> }
      const parts = anyMsg.parts
      if (Array.isArray(parts)) {
        return parts.map((p) => {
          if (p && p.type === 'text' && typeof p.text === 'string') {
            return p.text
          }
          return ''
        }).join('')
      }
      if (typeof anyMsg.content === 'string') return anyMsg.content
    }
    return ''
  }
  const { messages, error, stop, status, setMessages } = chat
  const handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => setInput(e.target.value)
  const handleSubmit = (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.()
    const text = input.trim()
    if (!text) return
    append({ role: 'user', content: text })
    setInput("")
  }
  const append = (msg: { role: 'user'; content: string }): unknown => {
    if (typeof chat.sendMessage === 'function') return chat.sendMessage(
      { text: msg.content },
      { body: { model: selectedModel, scene: selectedScene, locale, thinking: thinkingEnabled } }
    )
    if (typeof chat.append === 'function') return chat.append(msg)
    return undefined
  }

  // Automatically create new session
  useEffect(() => {
    if (!currentSessionId && messages.length === 0) {
      const sessionId = createNewSession(selectedScene.name, selectedModel)
      setCurrentSessionId(sessionId)
    }
  }, [currentSessionId, messages.length, selectedScene.name, selectedModel, createNewSession, setCurrentSessionId])

  // Handle new session creation (clear messages)
  useEffect(() => {
    if (shouldClearMessages) {
      setMessages([])
      setCurrentSessionId(null)
    }
  }, [shouldClearMessages, setMessages, setCurrentSessionId])

  // Load history session
  useEffect(() => {
    if (loadedSessionId && loadedSessionModel && loadedSessionScene && loadedMessages.length > 0) {
      setCurrentSessionId(loadedSessionId)
      setSelectedModel(loadedSessionModel);
      
      // Find and set the scene
      const sceneToLoad = scenes.find(s => s.name === loadedSessionScene);
      if (sceneToLoad) {
        setSelectedScene(sceneToLoad);
      } else {
        // Optionally handle if the scene is not found (e.g., log a warning or default)
        console.warn(`Loaded session's scene "${loadedSessionScene}" not found in available scenes.`);
      }

      setMessages(loadedMessages.map((msg) => toChatStateMessage({
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system" | "data",
        content: msg.content,
        createdAt: msg.createdAt,
      })))
      clearLoadedSession() // Clear all loaded session data from context
    }
  }, [loadedSessionId, loadedMessages, loadedSessionModel, loadedSessionScene, setCurrentSessionId, setSelectedModel, setSelectedScene, scenes, setMessages, clearLoadedSession])

  // Save messages to history
  useEffect(() => {
    if (currentSessionId) {
      // Convert message format
      const historyMessages = (messages as unknown[]).map((m) => {
        const anyMsg = m as { id?: string; role?: string; createdAt?: Date }
        return {
          id: anyMsg.id ?? '',
          role: anyMsg.role ?? 'user',
          content: textFromChatStateMessage(m),
          createdAt: anyMsg.createdAt || new Date(),
        }
      })
      updateSessionMessages(currentSessionId, historyMessages, selectedScene.name, selectedModel)
    }
  }, [currentSessionId, messages, selectedModel, selectedScene.name, updateSessionMessages])

  // Load custom scenes from localStorage and merge with defaults
  useEffect(() => {
    const custom = getCustomScenes() || [];
    setScenes([...custom, ...DEFAULT_SCENES]);
  }, []);
  // Listen for visibility changes to sync scene changes
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const custom = getCustomScenes() || [];
        setScenes([...custom, ...DEFAULT_SCENES]);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);
    // Display error messages
  useEffect(() => {
    if (error) {
      toast.error("Translation Error", {
        description: `${error.message || "An error occurred during translation."} ${selectedModel === MODELS[0].id ? "The selected model may not be available with your current API key." : ""} Please try again or select a different model.`,
        duration: 8000,
      });
    }
  }, [error, selectedModel]);

  return (
    <div className={cn("flex","flex-col", "w-full")}>
      <Chat
        className="w-full"
        messages={messages as unknown as Message[]}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={(status === 'streaming' )}
        status={status}
        stop={stop}
        append={append}
        setMessages={setMessages}        
        transcribeAudio={transcribeAudio}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        thinkingEnabled={thinkingEnabled}
        onToggleThinking={() => setThinkingEnabled(prev => !prev)}
        suggestions={[
          "生活就像一盒巧克力，你永远不知道下一颗是什么味道。",
          "The greatest glory in living lies not in never falling, but in rising every time we fall.",
          "Das Leben ist wie ein Fahrrad. Man muss sich vorwärts bewegen, um das Gleichgewicht zu halten.",
        ]}
      />
        <SceneSelector 
        scenes={scenes} 
        selectedScene={selectedScene}
        onSelectScene={handleSceneClick} 
      />
    </div>
  )
}
