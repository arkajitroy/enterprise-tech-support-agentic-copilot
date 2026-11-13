import React from 'react'
import {
  GitBranch,
  Database,
  Globe,
  FileCheck,
  RotateCcw,
  Sparkles,
  X,
  Layers,
  AlertTriangle,
} from 'lucide-react'

interface TracePanelProps {
  trace: string[]
  sourceUsed: string
  isLoading: boolean
  onClose: () => void
}

function getTraceIcon(step: string) {
  const s = step.toLowerCase()
  if (s.includes('router')) return <GitBranch className="w-3.5 h-3.5 text-sky-400" />
  if (s.includes('retrieval') || s.includes('kb'))
    return <Database className="w-3.5 h-3.5 text-emerald-400" />
  if (s.includes('grade')) return <FileCheck className="w-3.5 h-3.5 text-purple-400" />
  if (s.includes('web') || s.includes('tavily'))
    return <Globe className="w-3.5 h-3.5 text-amber-400" />
  if (s.includes('rewrite')) return <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
  if (s.includes('generation') || s.includes('direct'))
    return <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
  return <Layers className="w-3.5 h-3.5 text-slate-400" />
}

function getSourceBadge(source: string) {
  const norm = (source || '').toLowerCase()
  if (norm.includes('private_kb') || norm === 'kb') {
    return {
      label: 'Private knowledge base',
      className: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
    }
  }
  if (norm.includes('web')) {
    return {
      label: 'External web fallback',
      className: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
    }
  }
  if (norm.includes('direct')) {
    return {
      label: 'Direct response',
      className: 'bg-sky-500/10 border-sky-500/25 text-sky-400',
    }
  }
  if (norm.includes('insufficient')) {
    return {
      label: 'Insufficient evidence',
      className: 'bg-rose-500/10 border-rose-500/25 text-rose-400',
    }
  }
  if (norm === 'running') {
    return {
      label: 'Executing graph...',
      className: 'bg-sky-500/10 border-sky-500/25 text-sky-300 animate-pulse',
    }
  }
  return {
    label: source || 'Awaiting request',
    className: 'bg-white/[0.04] border-white/[0.08] text-slate-400',
  }
}

export const TracePanel: React.FC<TracePanelProps> = ({
  trace,
  sourceUsed,
  isLoading,
  onClose,
}) => {
  const badge = getSourceBadge(sourceUsed)

  return (
    <aside className="w-76 h-full border-l border-white/[0.07] bg-[#0c0f17] flex flex-col justify-between shrink-0 overflow-y-auto p-4 select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
          <div>
            <h2 className="text-xs font-semibold text-white font-['Space_Grotesk']">
              Execution telemetry
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              LangGraph node traversal
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            title="Close telemetry drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current State Resolution */}
        <div className="my-3.5 p-3 rounded bg-white/[0.02] border border-white/[0.06]">
          <span className="text-[10px] font-mono text-slate-400 block mb-1">
            Resolved answer source
          </span>
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${badge.className}`}
          >
            {badge.label}
          </div>
        </div>

        {/* Timeline List */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2 px-1">
            <span>Graph nodes</span>
            <span>{trace.length} passed</span>
          </div>

          <div className="space-y-1.5 relative pl-2 border-l border-white/[0.07] ml-2">
            {trace.length === 0 ? (
              <div className="p-3 rounded border border-dashed border-white/[0.08] text-center text-xs text-slate-400 font-mono">
                Submit an inquiry to view execution steps.
              </div>
            ) : (
              trace.map((step, idx) => (
                <div
                  key={idx}
                  className="py-1 px-2 rounded bg-white/[0.02] border border-white/[0.04] text-xs text-slate-200"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="shrink-0">{getTraceIcon(step)}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Step {idx + 1}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 break-words leading-tight pl-5.5">
                    {step}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>State engine</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Active
        </span>
      </div>
    </aside>
  )
}
export default TracePanel
