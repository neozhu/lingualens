"use client"

import { useEffect, useState } from "react"
import { useChat, type UseChatOptions } from "@ai-sdk/react"
import { cn } from "@/lib/utils"
import { transcribeAudio } from "@/lib/utils/audio"
import { Chat } from "@/components/ui/chat"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SCENES as DEFAULT_SCENES, Scene } from "@/lib/scenes"
import { Message } from "@/components/ui/chat-message"
import { MODELS } from "@/lib/models"
import { SceneSelector } from "@/components/scene-selector"
import { useLocale } from "next-intl"
import { useChatHistory } from "@/hooks/use-chat-history"
import { useChatContext } from "@/components/chat-provider"

type ChatDemoProps = {
  initialMessages?: UseChatOptions["initialMessages"]
}

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

export default function ChatDemo(props: ChatDemoProps) {  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
  const [scenes, setScenes] = useState(DEFAULT_SCENES);
  const [selectedScene, setSelectedScene] = useState(scenes[0]);
  
  const {
    currentSessionId,
    createNewSession,
    updateSessionMessages,
    setCurrentSessionId
  } = useChatHistory()
  
  const { loadedMessages, loadedSessionId, loadedSessionModel, loadedSessionScene, shouldClearMessages, clearLoadedSession } = useChatContext()
  
  useEffect(() => {
    const storedModel = localStorage.getItem("selectedModel")
    const storedSceneName = localStorage.getItem("selectedScene")
    
    if (storedModel) setSelectedModel(storedModel)
    
    // Find scene by name if stored
    if (storedSceneName) {      const customScenes = getCustomScenes() || DEFAULT_SCENES;
      const foundScene = customScenes.find((s: Scene) => s.name === storedSceneName);
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
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    append,
    stop,
    status,
    setMessages,
  } = useChat({
    ...props,
    api: "/api/chat",
    body: {
      model: selectedModel,
      scene: selectedScene,
      locale,
    },
  })

  // Automatically create new session
  useEffect(() => {
    if (!currentSessionId && messages.length === 0) {
      const sessionId = createNewSession(selectedScene.name, selectedModel)
      setCurrentSessionId(sessionId)
    }
  }, [currentSessionId, messages.length, selectedScene.name, selectedModel])

  // Handle new session creation (clear messages)
  useEffect(() => {
    if (shouldClearMessages) {
      setMessages([])
      setCurrentSessionId(null)
    }
  }, [shouldClearMessages])

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

      setMessages(loadedMessages.map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system" | "data",
        content: msg.content,
        createdAt: msg.createdAt
      })))
      clearLoadedSession() // Clear all loaded session data from context
    }
  }, [loadedSessionId, loadedMessages, loadedSessionModel, loadedSessionScene, setCurrentSessionId, setSelectedModel, setSelectedScene, scenes, setMessages, clearLoadedSession])

  // Save messages to history
  useEffect(() => {
    if (currentSessionId) {
      // Convert message format
      const historyMessages = messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt || new Date()
      }))
      updateSessionMessages(currentSessionId, historyMessages, selectedScene.name, selectedModel)
    }
  }, [currentSessionId, messages])

  // Load custom scenes from localStorage
  useEffect(() => {
    const custom = getCustomScenes();
    setScenes(custom || DEFAULT_SCENES);
  }, []);
  // Listen for visibility changes to sync scene changes
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const custom = getCustomScenes();
        setScenes(custom || DEFAULT_SCENES);
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
      <div className={cn("flex", "justify-end", "mb-2")}>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Chat
        className="w-full"
        messages={messages as unknown as Message[]}
        handleSubmit={handleSubmit}
        input={input}
        handleInputChange={handleInputChange}
        isGenerating={(status === 'streaming' )}
        stop={stop}
        append={append}
        setMessages={setMessages}        
        transcribeAudio={transcribeAudio}
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
