// 'use client'

// import React from "react"

// import { useRef, useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { useChat } from '@ai-sdk/react'
// import { DefaultChatTransport, type UIMessage } from 'ai'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Button } from '@/components/ui/button'
// import { Textarea } from '@/components/ui/textarea'
// import { Card } from '@/components/ui/card'
// import { interviewTips } from '@/lib/interview-tips'
// import {
//   Send,
//   Loader2,
//   User,
//   Bot,
//   ChevronLeft,
//   Lightbulb,
// } from 'lucide-react'
// import { cn } from '@/lib/utils'
// import Link from 'next/link'

// function getUIMessageText(msg: UIMessage): string {
//   if (!msg.parts || !Array.isArray(msg.parts)) return ''
//   return msg.parts
//     .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
//     .map((p) => p.text)
//     .join('')
// }

// export default function TipChatPage() {
//   const params = useParams()
//   const router = useRouter()
//   const tipId = params.tipId as string
//   const tip = interviewTips.find((t) => t.id === tipId)

//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const textareaRef = useRef<HTMLTextAreaElement>(null)
//   const [input, setInput] = useState('')

//   const { messages, sendMessage, status } = useChat({
//     transport: new DefaultChatTransport({
//       api: '/api/tips-chat',
//       prepareSendMessagesRequest: ({ id, messages }) => ({
//         body: {
//           id,
//           messages,
//           tipId,
//         },
//       }),
//     }),
//   })

//   const isLoading = status === 'streaming' || status === 'submitted'

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!input.trim() || isLoading) return
//     sendMessage({ text: input })
//     setInput('')
//   }

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       handleSubmit(e)
//     }
//   }

//   if (!tip) {
//     return (
//       <div className="mx-auto max-w-2xl px-4 py-12 text-center">
//         <Lightbulb className="size-12 mx-auto text-muted-foreground mb-4" />
//         <h1 className="text-2xl font-bold mb-2">Tip Not Found</h1>
//         <p className="text-muted-foreground mb-6">
//           The interview tip you are looking for does not exist.
//         </p>
//         <Button onClick={() => router.push('/dashboard/tips')}>
//           <ChevronLeft className="size-4 mr-2" />
//           Back to Tips
//         </Button>
//       </div>
//     )
//   }

//   return (
//     <div className="mx-auto max-w-4xl px-4 py-8 h-[calc(100vh-8rem)] flex flex-col">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="mb-6"
//       >
//         <Link
//           href="/dashboard/tips"
//           className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
//         >
//           <ChevronLeft className="size-4" />
//           Back to tips
//         </Link>

//         <div className="flex items-center gap-2 mb-2">
//           <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
//             {tip.category}
//           </span>
//         </div>
//         <h1 className="text-xl font-bold text-foreground">{tip.title}</h1>
//         <p className="text-sm text-muted-foreground">{tip.summary}</p>
//       </motion.div>

//       {/* Chat Container */}
//       <Card className="flex-1 flex flex-col overflow-hidden">
//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="h-full flex flex-col items-center justify-center text-center p-8"
//             >
//               <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 mb-4">
//                 <Lightbulb className="size-7 text-primary" />
//               </div>
//               <h2 className="text-lg font-semibold text-foreground mb-2">
//                 Ask About This Tip
//               </h2>
//               <p className="text-muted-foreground max-w-md mb-6">
//                 Have questions about "{tip.title}"? Ask our AI coach for more details, examples, or personalized advice.
//               </p>
//               <div className="flex flex-wrap justify-center gap-2">
//                 {[
//                   'Give me more examples',
//                   'How do I practice this?',
//                   'What mistakes should I avoid?',
//                 ].map((prompt) => (
//                   <Button
//                     key={prompt}
//                     variant="outline"
//                     size="sm"
//                     onClick={() => {
//                       sendMessage({ text: prompt })
//                     }}
//                   >
//                     {prompt}
//                   </Button>
//                 ))}
//               </div>
//             </motion.div>
//           ) : (
//             <AnimatePresence initial={false}>
//               {messages.map((message) => {
//                 const messageText = getUIMessageText(message)
//                 return (
//                   <motion.div
//                     key={message.id}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className={cn(
//                       'flex gap-3',
//                       message.role === 'user' ? 'flex-row-reverse' : ''
//                     )}
//                   >
//                     <div
//                       className={cn(
//                         'flex items-center justify-center size-8 rounded-full flex-shrink-0',
//                         message.role === 'user' ? 'bg-primary' : 'bg-accent/20'
//                       )}
//                     >
//                       {message.role === 'user' ? (
//                         <User className="size-4 text-primary-foreground" />
//                       ) : (
//                         <Bot className="size-4 text-accent" />
//                       )}
//                     </div>
//                     <div
//                       className={cn(
//                         'max-w-[80%] rounded-2xl px-4 py-3',
//                         message.role === 'user'
//                           ? 'bg-primary text-primary-foreground'
//                           : 'bg-muted'
//                       )}
//                     >
//                       <div className="whitespace-pre-wrap text-sm leading-relaxed">
//                         {messageText}
//                       </div>
//                     </div>
//                   </motion.div>
//                 )
//               })}
//             </AnimatePresence>
//           )}
//           {status === 'submitted' && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="flex gap-3"
//             >
//               <div className="flex items-center justify-center size-8 rounded-full bg-accent/20 flex-shrink-0">
//                 <Bot className="size-4 text-accent" />
//               </div>
//               <div className="bg-muted rounded-2xl px-4 py-3">
//                 <div className="flex items-center gap-2">
//                   <Loader2 className="size-4 animate-spin" />
//                   <span className="text-sm text-muted-foreground">Thinking...</span>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className="border-t border-border p-4">
//           <form onSubmit={handleSubmit} className="flex gap-3">
//             <Textarea
//               ref={textareaRef}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Ask a question about this tip..."
//               disabled={isLoading}
//               className="min-h-[44px] max-h-[120px] resize-none"
//               rows={1}
//             />
//             <Button type="submit" disabled={!input.trim() || isLoading} size="icon" className="shrink-0">
//               {isLoading ? (
//                 <Loader2 className="size-4 animate-spin" />
//               ) : (
//                 <Send className="size-4" />
//               )}
//             </Button>
//           </form>
//         </div>
//       </Card>
//     </div>
//   )
// }
