import React, {
  useState,
  useRef,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  FileCheck2,
} from 'lucide-react'
import { useIngestMutation } from '../lib/api'

interface IngestModalProps {
  isOpen: boolean
  onClose: () => void
}

export const IngestModal: React.FC<IngestModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [adminKey, setAdminKey] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ingestMutation = useIngestMutation()

  if (!isOpen) return null

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      ingestMutation.reset()
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      ingestMutation.reset()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!file) return

    ingestMutation.mutate({
      file,
      adminKey: adminKey.trim() || 'change-me',
    })
  }

  const handleClose = () => {
    setFile(null)
    ingestMutation.reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-white/[0.1] bg-[#0e121a] p-5 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <UploadCloud className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-white font-['Space_Grotesk']">
                Index company document
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Stores chunked vectors in Pinecone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Admin Key */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5 font-mono">
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span>Admin authorization key</span>
            </label>
            <input
              type="password"
              placeholder="change-me"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500/40 transition-colors"
            />
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-500/5'
                : file
                  ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                  : 'border-white/[0.1] hover:border-white/[0.2] bg-white/[0.01]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex items-center justify-center gap-2.5 text-left">
                <FileCheck2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs font-medium text-white truncate">
                    {file.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {(file.size / 1024).toFixed(1)} KB · Ready to index
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <UploadCloud className="w-6 h-6 mx-auto text-slate-400" />
                <div className="text-xs text-slate-200">
                  Select a document or drag it here
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Supported formats: PDF, TXT, Markdown, DOCX
                </div>
              </div>
            )}
          </div>

          {/* Status Feedback */}
          {ingestMutation.isPending && (
            <div className="p-2.5 rounded border border-sky-500/25 bg-sky-500/10 flex items-center gap-2 text-xs text-sky-300 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-sky-400" />
              <span>Chunking and generating vectors into Pinecone...</span>
            </div>
          )}

          {ingestMutation.isSuccess && (
            <div className="p-2.5 rounded border border-emerald-500/25 bg-emerald-500/10 flex items-start gap-2 text-xs text-emerald-300 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-white block">
                  Document successfully indexed
                </span>
                <span>
                  {ingestMutation.data.chunks} chunks created in index{' '}
                  <code className="text-emerald-200 font-bold">
                    fde-it-support-rag
                  </code>
                  .
                </span>
              </div>
            </div>
          )}

          {ingestMutation.isError && (
            <div className="p-2.5 rounded border border-rose-500/25 bg-rose-500/10 flex items-start gap-2 text-xs text-rose-300 font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-white block">
                  Indexing failed
                </span>
                <span>{ingestMutation.error.message}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || ingestMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {ingestMutation.isPending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Indexing...</span>
                </>
              ) : (
                <span>Upload document</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default IngestModal
