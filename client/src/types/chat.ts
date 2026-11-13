export interface Citation {
  title: string
  url: string
  type: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sourceUsed?: string
  citations?: Citation[]
  rewrittenQuery?: string
  trace?: string[]
  timestamp: string
}

export interface ChatApiResponse {
  answer: string
  source_used: string
  trace: string[]
  citations: Citation[]
  rewritten_query?: string
}

export interface IngestApiResponse {
  message: string
  file: string
  chunks: number
  ids_created: number
}

export interface HealthApiResponse {
  status: string
  service: string
}
