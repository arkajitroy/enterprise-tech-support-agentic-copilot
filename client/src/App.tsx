import React, { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import TracePanel from './components/TracePanel'
import IngestModal from './components/IngestModal'
import { useChatMutation } from './lib/api'
import type { ChatMessage } from './types/chat'

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: `### NovaRetail IT Support Assistant

I provide grounded assistance for internal IT inquiries, hardware setup, VPN access, and service-desk escalations.

* **Private knowledge base**: Resolves questions directly from verified internal runbooks.
* **Automated web fallback**: Consults vendor advisories in real time when internal documentation is insufficient.
* **Traceable reasoning**: Inspect the decision path and source citations in the telemetry panel.

Select any prompt from the sidebar or enter your question below.`,
    sourceUsed: 'private_kb',
    citations: [
      { title: 'company_it_handbook.md', url: '', type: 'private_kb' },
      { title: 'service_desk_runbook.md', url: '', type: 'private_kb' },
    ],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
]

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [trace, setTrace] = useState<string[]>([
    'Router → KB',
    'Private KB retrieval → 4 chunks',
    'KB evidence grade → GOOD',
    'Answer generation → PRIVATE KB',
  ])
  const [sourceUsed, setSourceUsed] = useState<string>('private_kb')
  const [isTraceOpen, setIsTraceOpen] = useState<boolean>(true)
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false)

  const chatMutation = useChatMutation()

  const handleSendMessage = (question: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setTrace(['Routing question through LangGraph orchestrator...'])
    setSourceUsed('running')

    chatMutation.mutate(question, {
      onSuccess: (data) => {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          sourceUsed: data.source_used,
          citations: data.citations,
          rewrittenQuery: data.rewritten_query,
          trace: data.trace,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setTrace(data.trace || [])
        setSourceUsed(data.source_used)
      },
      onError: (error) => {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `**Request Failed**: ${error.message}\n\nPlease verify that the backend server is running at \`http://127.0.0.1:8080\`.`,
          sourceUsed: 'insufficient',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, errorMessage])
        setTrace(['Node Error: LangGraph execution interrupted'])
        setSourceUsed('insufficient')
      },
    })
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090b10] text-slate-100 antialiased">
      {/* Top Navigation */}
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        isTraceOpen={isTraceOpen}
        onToggleTrace={() => setIsTraceOpen((prev) => !prev)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          onSelectPrompt={handleSendMessage}
          disabled={chatMutation.isPending}
        />

        {/* Central Chat Stream */}
        <ChatArea
          messages={messages}
          isLoading={chatMutation.isPending}
          onSendMessage={handleSendMessage}
        />

        {/* Right LangGraph Telemetry Drawer */}
        {isTraceOpen && (
          <TracePanel
            trace={trace}
            sourceUsed={sourceUsed}
            isLoading={chatMutation.isPending}
            onClose={() => setIsTraceOpen(false)}
          />
        )}
      </div>

      {/* Document Ingestion Modal */}
      <IngestModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  )
}

export default App
