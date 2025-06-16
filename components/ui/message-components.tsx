"use client"

// This file re-exports the ChatMessage component and related types
// to fix the import issues in message-list.tsx

import { ChatMessage as OriginalChatMessage, type ChatMessageProps, type Message } from "./chat-message"

// Re-export with explicit named exports
export const ChatMessage = OriginalChatMessage
export type { ChatMessageProps, Message }
