"use client";

import React from "react";
import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  Send,
  Loader2,
  User,
  Bot,
  Sparkles,
  RotateCcw,
  FileText,
  Menu,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import Markdown from "react-markdown";
import { routes } from "@/lib/routes";
import { toast } from "sonner";
import { getIdToken } from "firebase/auth";
import {
  ApiResponse,
  SaveCopilotChatResponseDto,
  GetCopilotChatHistoryResponseDto,
} from "@/lib/types";

interface ChatSession {
  id: string;
  title: string;
  messages: UIMessage[];
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return "";
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export default function CopilotPage() {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: routes.api.copilot() }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Load chat history on mount
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  // Auto-save chat when messages change (after a delay)
  useEffect(() => {
    if (messages.length === 0 || !user) return;

    const timer = setTimeout(() => {
      saveChatSession();
    }, 1500);

    return () => clearTimeout(timer);
  }, [messages, user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(routes.api.getCopilotChatHistory(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          uid: user?.uid,
          authorization: await getIdToken(user),
        },
      });
      if (response.ok) {
        const data: ApiResponse<GetCopilotChatHistoryResponseDto> =
          await response.json();

        setChatHistory(
          data?.data?.chatHistory?.map((chat: any) => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
          })),
        );
      } else {
        toast.error(`Failed to load chat history`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to load chat history: ${error.message}`);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveChatSession = async () => {
    if (!user || messages.length === 0) return;

    try {
      // Generate title from first user message
      let title = "New Chat";
      const firstUserMsg = messages.find((m) => m.role === "user");
      if (firstUserMsg) {
        const text = getUIMessageText(firstUserMsg);
        title = text.slice(0, 50) + (text.length > 50 ? "..." : "");
      }

      const response = await fetch(routes.api.saveCopilotChat(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          uid: user?.uid,
          authorization: await getIdToken(user),
        },
        body: JSON.stringify({
          chatId: currentChatId,
          title,
          messages,
        }),
      });

      if (response.ok) {
        const savedChat: ApiResponse<SaveCopilotChatResponseDto> =
          await response.json();
        if (!currentChatId) {
          setCurrentChatId(savedChat?.data?.chat?.id);
        }
        // Refresh history
        await loadChatHistory();
      } else {
        toast.error(`Failed to save chat`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to save chat: ${error.message}`);
    }
  };

  const loadChat = (chat: ChatSession) => {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        routes.api.deleteCopilotChat({ chatId: chatId }),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            uid: user?.uid,
            authorization: await getIdToken(user),
          },
        },
      );

      if (response.ok) {
        if (currentChatId === chatId) {
          startNewSession();
        }
        await loadChatHistory();
      } else {
        toast.error(`Failed to delete chat`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete chat: ${error.message}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const startNewSession = () => {
    setMessages([]);
    setInput("");
    setCurrentChatId(null);
  };

  const requestSummary = () => {
    sendMessage({
      text: "I'd like to end this session. Please give me a summary and evaluation of my performance.",
    });
  };

  return (
    <div className="h-[calc(100dvh-5rem)] flex gap-0 bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -256 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -256 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-0 bottom-0 z-50 w-64 bg-background border-r border-border flex flex-col overflow-hidden"
            >
              <div className="p-4 space-y-2 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="size-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Interview Copilot
                  </span>
                </div>
                <h1 className="text-xl font-bold text-foreground">
                  Practice with AI
                </h1>
                <p className="text-muted-foreground text-xs">
                  Chat with our AI interviewer for real-time practice and
                  feedback
                </p>
                <div className="flex items-center">
                  {messages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={requestSummary}
                        disabled={isLoading}
                      >
                        <FileText className="size-4  " />
                        Summary
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                {/* New Chat Button */}
                <Button
                  onClick={startNewSession}
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                  New Chat
                </Button>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto space-y-1 p-4">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-4 animate-spin text-primary" />
                  </div>
                ) : chatHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No chat history yet
                  </p>
                ) : (
                  chatHistory.map((chat) => (
                    <motion.div
                      key={chat.id}
                      onClick={() => loadChat(chat)}
                      whileHover={{ x: 4 }}
                      className={cn(
                        "w-full text-left py-1 px-2 rounded-lg transition-colors group cursor-pointer",
                        currentChatId === chat.id
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted border border-transparent",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {chat.title}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => deleteChat(chat.id, e)}
                        >
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
            <div className="w-64 h-100vh"></div>
          </>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        <div className="p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="size-4" />
          </Button>
        </div>
        {/* Chat Container */}
        <div className="flex-1 flex flex-col overflow-hidden mx-auto md:min-w-4xl md:max-w-4xl">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center px-4"
              >
                <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-6">
                  <Sparkles className="size-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Ready to Practice?
                </h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  Start a conversation with your AI interview coach. I&apos;ll
                  ask you questions, evaluate your responses, and help you
                  improve.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Start a behavioral interview",
                    "Practice for a role",
                    "Help me with common questions",
                  ].map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        sendMessage({ text: prompt });
                      }}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message) => {
                  const messageText = getUIMessageText(message);
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "flex-row-reverse" : "",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center size-8 rounded-full shrink-0",
                          message.role === "user"
                            ? "bg-primary"
                            : "bg-accent/20",
                        )}
                      >
                        {message.role === "user" ? (
                          <User className="size-4 text-primary-foreground" />
                        ) : (
                          <Bot className="size-4 text-accent" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-xs md:max-w-md lg:max-w-xl rounded-2xl px-4 py-3",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
                        )}
                      >
                        <div className="text-sm leading-relaxed wrap-break-word">
                          <Markdown>{messageText}</Markdown>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            {status === "submitted" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex items-center justify-center size-8 rounded-full bg-accent/20 shrink-0">
                  <Bot className="size-4 text-accent" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <Card className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                disabled={isLoading}
                className="min-h-11 max-h-40 resize-none"
                rows={1}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground  text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
