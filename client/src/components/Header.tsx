import React from 'react'
import {
  Upload,
  Layers,
  Cpu,
  Database,
  Globe,
} from 'lucide-react'
import { useHealthStatus } from '../lib/api'

interface HeaderProps {
  onOpenUpload: () => void
  isTraceOpen: boolean
  onToggleTrace: () => void
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  isTraceOpen,
  onToggleTrace,
}) => {
  const { data: health, isLoading: isHealthLoading, isError } = useHealthStatus()

  return (
    <header className="h-15 px-5 border-b border-white/[0.07] bg-[#0c0f17] flex items-center justify-between shrink-0 z-20 select-none">
      {/* Brand & Context */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-mono text-xs font-semibold">
          NR
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-white font-['Space_Grotesk']">
              NovaRetail
            </span>
            <span className="text-slate-500 font-normal text-xs">/</span>
            <span className="text-xs font-medium text-slate-300">
              IT Support Copilot
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-none mt-0.5">
            Internal knowledge base with automated web search fallback
          </p>
        </div>
      </div>

      {/* Center Architecture Telemetry */}
      <div className="hidden lg:flex items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono text-[11px] text-slate-400">gpt-oss-120b</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-slate-300">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[11px] text-slate-400">pinecone · 384d</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-slate-300">
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[11px] text-slate-400">tavily fallback</span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.06]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isError
                ? 'bg-rose-500'
                : isHealthLoading
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-[11px] text-slate-300 font-mono">
            {isError ? 'offline' : isHealthLoading ? 'connecting' : 'system ready'}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload document</span>
        </button>

        <button
          onClick={onToggleTrace}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 ${
            isTraceOpen
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
              : 'bg-white/[0.03] border-white/[0.07] text-slate-400 hover:text-white'
          }`}
          title="Toggle execution telemetry drawer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Telemetry</span>
        </button>
      </div>
    </header>
  )
}
export default Header
