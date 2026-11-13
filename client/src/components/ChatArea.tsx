import React, { useState, useRef, useEffect, KeyboardEvent } from 'react'
import {
  Send,
  Bot,
  User,
  ExternalLink,
  Loader2,
  FileText,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Globe,
} from 'lucide-react'
import { marked } from 'marked'
import type { ChatMessage } from '../types/chat'

interface ChatAreaProps {
  messages: ChatMessage[]
  isLoading: boolean
  onSendMessage: (question: string) => void
}

function renderSourcePill(source?: string) {
  const norm = (source || '').toLowerCase()
  if (norm.includes('private_kb') || norm === 'kb') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        Verified company KB
      </span>
    )
  }
  if (norm.includes('web')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-500/10 border border-amber-500/25 text-amber-400">
        <Globe className="w-3 h-3 text-amber-400" />
        External web fallback
      </span>
    )
  }
  if (norm.includes('direct')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-sky-500/10 border border-sky-500/25 text-sky-400">
        <Bot className="w-3 h-3 text-sky-400" />
        Direct reply
      </span>
    )
  }
  if (norm.includes('insufficient')) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-500/10 border border-rose-500/25 text-rose-400">
        <AlertTriangle className="w-3 h-3 text-rose-400" />
        Insufficient evidence
      </span>
    )
  }
  return null
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSendMessage,
}) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    onSendMessage(text)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  return (
    <main className="flex-1 h-full flex flex-col justify-between bg-[#090b10] overflow-hidden relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`rounded-xl p-4 sm:p-5 max-w-[85%] border transition-all ${
                  msg.role === 'user'
                    ? 'bg-sky-500/10 border-sky-500/25 text-white'
                    : 'bg-white/[0.02] border-white/[0.07] text-slate-100'
                }`}
              >
                {/* Assistant Metadata Header */}
                {msg.role === 'assistant' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white font-['Space_Grotesk']">
                        IT Copilot
                      </span>
                      {renderSourcePill(msg.sourceUsed)}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* Rewritten Query Notice */}
                {msg.rewrittenQuery && (
                  <div className="mb-3 px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono flex items-center gap-2">
                    <RotateCcw className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>
                      Refined search query: <strong>{msg.rewrittenQuery}</strong>
                    </span>
                  </div>
                )}

                {/* Message Content */}
                {msg.role === 'assistant' ? (
                  <div
                    className="markdown-body"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(msg.content) as string,
                    }}
                  />
                ) : (
                  <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                )}

                {/* Citations List */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <span className="text-[11px] font-mono text-slate-400 block mb-2">
                      Sources referenced ({msg.citations.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-white/[0.03] border border-white/[0.08] text-slate-300"
                        >
                          {c.type === 'web' ? (
                            <>
                              <Globe className="w-3 h-3 text-amber-400 shrink-0" />
                              {c.url ? (
                                <a
                                  href={c.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:text-emerald-400 flex items-center gap-1 truncate max-w-[220px]"
                                >
                                  {c.title}
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              ) : (
                                <span className="truncate max-w-[220px]">{c.title}</span>
                              )}
                            </>
                          ) : (
                            <>
                              <FileText className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate max-w-[220px]">{c.title}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0 mt-1">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="rounded-xl p-3.5 bg-white/[0.02] border border-white/[0.06] text-slate-300 flex items-center gap-2.5">
                <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span className="text-xs font-mono text-slate-300">
                  Executing LangGraph workflow...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Composer */}
      <div className="p-4 sm:p-5 bg-gradient-to-t from-[#090b10] via-[#090b10]/95 to-transparent border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-xl border border-white/[0.08] bg-[#0f131c] p-2 focus-within:border-sky-500/40 transition-colors">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              disabled={isLoading}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              placeholder="Ask an IT support question (e.g., VPN setup, password rules, Teams status)..."
              className="w-full bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none font-sans"
              style={{ minHeight: '38px', maxHeight: '160px' }}
            />

            <div className="flex items-center justify-between pt-1.5 px-2.5 border-t border-white/[0.04] text-[11px] font-mono text-slate-400">
              <span className="hidden sm:inline">
                Enter to send · Shift+Enter for new line
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="ml-auto flex items-center gap-1.5 px-3.5 py-1 rounded-md text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing</span>
                  </>
                ) : (
                  <>
                    <span>Ask assistant</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
export default ChatArea
