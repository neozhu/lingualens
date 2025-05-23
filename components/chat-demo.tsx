"use client"

import { useEffect, useState } from "react"
import { useChat, type UseChatOptions } from "@ai-sdk/react"
import { cn } from "@/lib/utils"
import { transcribeAudio } from "@/lib/utils/audio"
import { Chat } from "@/components/ui/chat"
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
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
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
    },
  })

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
        isGenerating={status==="streaming"}
        stop={stop}
        append={append}
        setMessages={setMessages}
        transcribeAudio={transcribeAudio}
        suggestions={[
          "你好，今天的会议在哪里举行？",
          "Please confirm your availability for the upcoming meeting.",
          "Können Sie mir bitte den Fehlercode senden?",
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
