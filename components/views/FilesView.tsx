'use client'

import { Paperclip, FileText, Image as ImageIcon, FileCode, FileSpreadsheet } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type FileItem = {
  id: string
  fileName: string
  fileUrl: string
  mimeType?: string | null
  jobName?: string | null
  uploaderEmail?: string | null
}

type FilesViewProps = {
  files: FileItem[]
}

// ─── File icon helper ─────────────────────────────────────────────────────────

function FileIcon({ mimeType }: { mimeType?: string | null }) {
  if (!mimeType) {
    return <FileText className="h-8 w-8 text-gray-300" />
  }
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-8 w-8 text-indigo-400" />
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel')) {
    return <FileSpreadsheet className="h-8 w-8 text-emerald-400" />
  }
  if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html')) {
    return <FileCode className="h-8 w-8 text-amber-400" />
  }
  return <FileText className="h-8 w-8 text-gray-400" />
}

// ─── File Card ────────────────────────────────────────────────────────────────

function FileCard({ file }: { file: FileItem }) {
  const isImage = file.mimeType?.startsWith('image/')

  return (
    <a
      href={file.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
    >
      {/* Thumbnail / icon area */}
      <div className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.fileUrl}
            alt={file.fileName}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <FileIcon mimeType={file.mimeType} />
        )}
      </div>

      {/* Meta */}
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-gray-800 truncate" title={file.fileName}>
          {file.fileName}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {[file.jobName, file.uploaderEmail].filter(Boolean).join(' · ')}
        </p>
      </div>
    </a>
  )
}

// ─── Files View ───────────────────────────────────────────────────────────────

export default function FilesView({ files }: FilesViewProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl w-full mx-auto px-6 py-6">

        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Paperclip className="h-8 w-8 text-gray-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                No files attached yet
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Files attached to tasks will appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {files.length} file{files.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
