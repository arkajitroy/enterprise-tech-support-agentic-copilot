import React from 'react'
import {
  FileText,
  Compass,
  ArrowRight,
  Database,
  GitFork,
} from 'lucide-react'

interface SidebarProps {
  onSelectPrompt: (prompt: string) => void
  disabled?: boolean
}

const WORKFLOW_STAGES = [
  { step: '1', title: 'Route intent', desc: 'Direct chat or IT support triage' },
  { step: '2', title: 'Private KB retrieval', desc: 'Queries Pinecone 384d semantic index' },
  { step: '3', title: 'Evidence evaluation', desc: 'Grades document sufficiency before answering' },
  { step: '4', title: 'Web search fallback', desc: 'Runs Tavily vendor query if internal KB is weak' },
  { step: '5', title: 'Query reformulator', desc: 'Rewrites technical keywords and retries' },
  { step: '6', title: 'Grounded generation', desc: 'Synthesizes answer with exact citations' },
]

const QUICK_PROMPTS = [
  'How do I connect to the company VPN?',
  'What is our password reset policy?',
  'What is the latest Microsoft Teams outage guidance?',
  'What are the SLAs for P1 versus P2 tickets?',
  'Hello! Can you introduce yourself?',
]

export const Sidebar: React.FC<SidebarProps> = ({ onSelectPrompt, disabled }) => {
  return (
    <aside className="w-76 h-full border-r border-white/[0.07] bg-[#0c0f17] flex flex-col justify-between shrink-0 overflow-y-auto p-4 select-none">
      <div className="space-y-6">
        {/* Knowledge Base Overview */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-['Space_Grotesk']">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Company knowledge base
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.2 rounded">
              synced
            </span>
          </div>

          <div className="space-y-1.5 mt-2">
            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.05] text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-200 truncate">company_it_handbook.md</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 pl-5.5">
                VPN, passwords, MFA, and device policies
              </p>
            </div>

            <div className="p-2 rounded bg-white/[0.02] border border-white/[0.05] text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-medium text-slate-200 truncate">service_desk_runbook.md</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 pl-5.5">
                Incident triage SLAs (P1 through P4)
              </p>
            </div>
          </div>
        </div>

        {/* LangGraph Architecture Pipeline */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2.5 px-1 font-['Space_Grotesk']">
            <GitFork className="w-3.5 h-3.5 text-sky-400" />
            <span>Agent workflow stages</span>
          </div>

          <div className="space-y-1 relative pl-2 border-l border-white/[0.07] ml-2">
            {WORKFLOW_STAGES.map((stage) => (
              <div
                key={stage.step}
                className="py-1 px-2 rounded hover:bg-white/[0.02] transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold text-slate-400">
                    {stage.step}
                  </span>
                  <span className="font-medium text-slate-200 text-xs">
                    {stage.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-4 leading-tight mt-0.5">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Queries */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2 px-1 font-['Space_Grotesk']">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Common questions</span>
          </div>

          <div className="space-y-1">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                disabled={disabled}
                onClick={() => onSelectPrompt(prompt)}
                className="w-full text-left py-1.5 px-2.5 rounded text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors flex items-center justify-between group disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400"
              >
                <span className="truncate pr-2">{prompt}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-sky-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-white/[0.07] text-[11px] text-slate-400 font-mono flex items-center justify-between">
        <span>NovaRetail IT</span>
        <span>Version 1.0</span>
      </div>
    </aside>
  )
}
export default Sidebar
