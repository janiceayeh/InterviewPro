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
} from "lucide-react";
import { cn } from "@/lib/utils";

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return "";
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export default function CopilotPage() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/copilot" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startNewSession = () => {
    setMessages([]);
    setInput("");
  };

  const requestSummary = () => {
    sendMessage({
      text: "I'd like to end this session. Please give me a summary and evaluation of my performance.",
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="size-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                Interview Copilot
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Practice with AI
            </h1>
            <p className="text-muted-foreground">
              Chat with our AI interviewer for real-time practice and feedback
            </p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestSummary}
                  disabled={isLoading}
                >
                  <FileText className="size-4 mr-2" />
                  Get Summary
                </Button>
                <Button variant="outline" size="sm" onClick={startNewSession}>
                  <RotateCcw className="size-4 mr-2" />
                  New Session
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-8"
            >
              <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-6">
                <Sparkles className="size-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Ready to Practice?
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                {
                  "Start a conversation with your AI interview coach. I'll ask you questions, evaluate your responses, and help you improve."
                }
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Start a behavioral interview",
                  "Practice for a tech role",
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
                        "flex items-center justify-center size-8 rounded-full flex-shrink-0",
                        message.role === "user" ? "bg-primary" : "bg-accent/20",
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
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {messageText}
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
              <div className="flex items-center justify-center size-8 rounded-full bg-accent/20 flex-shrink-0">
                <Bot className="size-4 text-accent" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
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
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              disabled={isLoading}
              className="min-h-[44px] max-h-[120px] resize-none"
              rows={1}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}
