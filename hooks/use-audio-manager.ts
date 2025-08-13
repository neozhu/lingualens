import { useEffect, useRef, useState } from "react"
import { recordAudio } from "@/lib/audio-utils"

interface UseAudioManagerOptions {
  transcribeAudio?: (blob: Blob) => Promise<string>
  onTranscriptionComplete?: (text: string) => void
}

interface AudioManagerState {
  // Recording states
  isListening: boolean
  isRecording: boolean
  isTranscribing: boolean
  isSpeechSupported: boolean
  audioStream: MediaStream | null
  
  // TTS states
  speakingMessages: Record<string, boolean>
  audioRefs: Record<string, HTMLAudioElement | null>
}

export function useAudioManager({
  transcribeAudio,
  onTranscriptionComplete,
}: UseAudioManagerOptions = {}) {
  // Recording states
  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(!!transcribeAudio)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const activeRecordingRef = useRef<any>(null)

  // TTS states
  const [speakingMessages, setSpeakingMessages] = useState<Record<string, boolean>>({})
  const [loadingMessages, setLoadingMessages] = useState<Record<string, boolean>>({})
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})

  useEffect(() => {
    const checkSpeechSupport = async () => {
      const hasMediaDevices = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      )
      setIsSpeechSupported(hasMediaDevices && !!transcribeAudio)
    }

    checkSpeechSupport()
  }, [transcribeAudio])

  // Recording functions
  const stopRecording = async () => {
    setIsRecording(false)
    setIsTranscribing(true)
    try {
      recordAudio.stop()
      const recording = await activeRecordingRef.current
      if (transcribeAudio) {
        const text = await transcribeAudio(recording)
        onTranscriptionComplete?.(text)
      }
    } catch (error) {
      console.error("Error transcribing audio:", error)
    } finally {
      setIsTranscribing(false)
      setIsListening(false)
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop())
        setAudioStream(null)
      }
      activeRecordingRef.current = null
    }
  }

  const toggleListening = async () => {
    if (!isListening) {
      try {
        setIsListening(true)
        setIsRecording(true)
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        setAudioStream(stream)
        activeRecordingRef.current = recordAudio(stream)
      } catch (error) {
        console.error("Error recording audio:", error)
        setIsListening(false)
        setIsRecording(false)
        if (audioStream) {
          audioStream.getTracks().forEach((track) => track.stop())
          setAudioStream(null)
        }
      }
    } else {
      await stopRecording()
    }
  }

  // TTS functions
  const speakText = async (text: string, messageId: string) => {
    try {
      const current = audioRefs.current[messageId]
      const isCurrentlySpeaking = speakingMessages[messageId]
      const isCurrentlyLoading = loadingMessages[messageId]
      
      // If already speaking, stop it
      if (isCurrentlySpeaking && current) {
        current.pause()
        audioRefs.current[messageId] = null
        setSpeakingMessages((prev) => ({ ...prev, [messageId]: false }))
        return
      }
      
      // If already loading, ignore the click to prevent duplicate requests
      if (isCurrentlyLoading) {
        return
      }

      // Set loading state immediately to prevent duplicate requests
      setLoadingMessages((prev) => ({ ...prev, [messageId]: true }))

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      
      if (!res.ok) {
        setLoadingMessages((prev) => ({ ...prev, [messageId]: false }))
        return
      }
      
      const blob = await res.blob()
      if (blob.size === 0) {
        setLoadingMessages((prev) => ({ ...prev, [messageId]: false }))
        return
      }
      
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRefs.current[messageId] = audio
      
      audio.onended = () => {
        setSpeakingMessages((prev) => ({ ...prev, [messageId]: false }))
        audioRefs.current[messageId] = null
      }
      
      audio.onerror = () => {
        setSpeakingMessages((prev) => ({ ...prev, [messageId]: false }))
        audioRefs.current[messageId] = null
      }
      
      // Clear loading state and set speaking state
      setLoadingMessages((prev) => ({ ...prev, [messageId]: false }))
      setSpeakingMessages((prev) => ({ ...prev, [messageId]: true }))
      await audio.play()
    } catch (error) {
      console.error('TTS error:', error)
      setLoadingMessages((prev) => ({ ...prev, [messageId]: false }))
      setSpeakingMessages((prev) => ({ ...prev, [messageId]: false }))
    }
  }

  const stopSpeaking = (messageId: string) => {
    const audio = audioRefs.current[messageId]
    if (audio) {
      audio.pause()
      audioRefs.current[messageId] = null
    }
    setSpeakingMessages((prev) => ({ ...prev, [messageId]: false }))
    setLoadingMessages((prev) => ({ ...prev, [messageId]: false }))
  }

  const stopAllSpeaking = () => {
    Object.keys(audioRefs.current).forEach(messageId => {
      const audio = audioRefs.current[messageId]
      if (audio) {
        audio.pause()
        audioRefs.current[messageId] = null
      }
    })
    setSpeakingMessages({})
    setLoadingMessages({})
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop all TTS
      stopAllSpeaking()
      
      // Stop recording
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop())
      }
      if (activeRecordingRef.current) {
        try {
          recordAudio.stop()
        } catch (error) {
          console.error("Error stopping recording on cleanup:", error)
        }
      }
    }
  }, [])

  return {
    // Recording interface
    recording: {
      isListening,
      isRecording,
      isTranscribing,
      isSpeechSupported,
      audioStream,
      toggleListening,
      stopRecording,
      isActive: isListening || isRecording || isTranscribing,
    },
    
    // TTS interface
    tts: {
      speakingMessages,
      loadingMessages,
      speakText,
      stopSpeaking,
      stopAllSpeaking,
      isSpeaking: (messageId: string) => !!speakingMessages[messageId],
      isLoading: (messageId: string) => !!loadingMessages[messageId],
    }
  }
}

