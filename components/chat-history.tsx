"use client";

import { Button } from "@/components/ui/button";
import { History, Trash2, Calendar, MessageSquare, X, MoreVertical, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useChatHistory, GroupedChatHistory, ChatSession } from "@/hooks/use-chat-history";
import { useChatContext } from "@/components/chat-provider";
import { toast } from "sonner";
import{ScrollArea} from "@/components/ui/scroll-area";
export const ChatHistory = () => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  
  const {
    getGroupedHistory,
    loadSession,
    deleteSession,
    clearAllHistory,
    clearTodayHistory,
    refreshHistory,
    clearHistoryByDate
  } = useChatHistory();
  
  const { setLoadedMessages, setLoadedSessionId, clearLoadedSession, triggerClearMessages, setLoadedSessionModel, setLoadedSessionScene } = useChatContext();
  const [groupedHistory, setGroupedHistory] = useState<GroupedChatHistory[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load history on initialization
  useEffect(() => {
    setGroupedHistory(getGroupedHistory());
  }, [getGroupedHistory]);

  // Refresh history when menu opens
  const handleMenuOpenChange = (open: boolean) => {
    if (open) {
      refreshHistory();
      setGroupedHistory(getGroupedHistory());
    }
  };

  const handleLoadSession = (sessionId: string) => {
    const session = loadSession(sessionId);
    if (session) {
      setLoadedMessages(session.messages);
      setLoadedSessionId(session.id);
      setLoadedSessionModel(session.model);
      setLoadedSessionScene(session.scene);
      
      // Check if we're not on the home page, if so, navigate to home
      if (pathname !== '/') {
        router.push('/');
      }
      
      toast.success(t('history.sessionLoaded') || 'Session loaded');
    } else {
      toast.error(t('history.sessionLoadError') || 'Failed to load session');
    }
  };

  const handleNewSession = () => {
    clearLoadedSession();
    triggerClearMessages();
    toast.success(t('history.newSession') || 'New session created');
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(sessionId);
    setGroupedHistory(getGroupedHistory()); // Refresh the display
    toast.success(t('history.sessionDeleted') || 'Session deleted');
  };

  const handleClearHistory = (type: "all" | "today") => {
    if (type === "all") {
      clearAllHistory();
      toast.success(t('history.allCleared') || 'All history cleared');
    } else {
      clearTodayHistory();
      toast.success(t('history.todayCleared') || 'Today\'s history cleared');
    }
    setGroupedHistory(getGroupedHistory()); // Refresh the display
  };

  const handleClearDateHistory = (date: string) => {
    clearHistoryByDate(date);
    toast.success(t('history.dateCleared', { date: formatDate(date) }) || `History for ${formatDate(date)} cleared`);
    setGroupedHistory(getGroupedHistory()); // Refresh the display
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return t('history.today') || 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return t('history.yesterday') || 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionPreview = (session: ChatSession) => {
    const userMessages = session.messages.filter((m) => m.role === 'user');
    if (userMessages.length > 0) {
      const preview = userMessages[0].content ?? '';
      return preview.length > 30 ? preview.substring(0, 30) + '...' : preview;
    }
    return t('history.emptySession') || 'Empty session';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenu onOpenChange={handleMenuOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <History className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={`w-80 ${isMobile ? 'max-w-[90vw]' : 'max-w-80'} max-h-[500px] overflow-y-auto overflow-x-hidden`} align="end">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>{t('history.title') || 'Chat History'}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleNewSession}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('history.newSession') || 'New Session'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleClearHistory("all")}
                    
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('history.clearAll') || 'Clear All'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            {groupedHistory.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t('history.empty') || 'No chat history'}
              </div>
            ) : (
              <ScrollArea className="bg-background max-h-[400px] overflow-y-auto overflow-x-hidden">
                {groupedHistory.map((group) => (
                  <div key={group.date} className="w-full">
                    <DropdownMenuLabel className="flex items-center justify-between text-xs text-muted-foreground sticky top-0 bg-background border-b w-full">
                      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{formatDate(group.date)}</span>
                        <Badge variant="secondary" className="text-xs px-1 py-0 ml-1 flex-shrink-0">
                          {group.sessions.length}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearDateHistory(group.date);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </DropdownMenuLabel>
                    
                    {group.sessions.map((session) => (                      <DropdownMenuItem
                        key={session.id}
                        className={`flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 ${isMobile ? 'min-h-[70px]' : 'min-h-[60px]'} w-full`}
                        onClick={() => handleLoadSession(session.id)}
                      >
                        <div className="flex-1 min-w-0 max-w-[calc(100%-2rem)] overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatTime(session.timestamp)}
                            </span>
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {session.scene}
                            </Badge>
                          </div>
                          <p className="text-sm truncate text-foreground">
                            {getSessionPreview(session)}
                          </p>
                        </div>                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${isMobile ? 'h-8 w-8' : 'h-6 w-6'} p-0 ml-2 opacity-60 hover:opacity-100`}
                          onClick={(e) => handleDeleteSession(session.id, e)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </DropdownMenuItem>
                    ))}
                    
                    <DropdownMenuSeparator />
                  </div>
                ))}
              </ScrollArea>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('history.tooltip') || 'Chat History'}</p>
      </TooltipContent>
    </Tooltip>
  );
};