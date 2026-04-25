import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAtlasStore } from '../store/useAtlasStore'
import { buildEmbedSrc } from '../utils/embedUrl'

type EmbedSize = 'compact' | 'medium' | 'wide' | 'fullwidth'

interface SizeOption {
  id: EmbedSize
  label: string
  width: number | string
  height: number
  display: string
}

const SIZE_OPTIONS: SizeOption[] = [
  { id: 'compact',   label: 'Compact',    width: 400,    height: 280, display: '400 × 280' },
  { id: 'medium',    label: 'Medium',     width: 600,    height: 400, display: '600 × 400' },
  { id: 'wide',      label: 'Wide',       width: 800,    height: 500, display: '800 × 500' },
  { id: 'fullwidth', label: 'Full Width', width: '100%', height: 500, display: '100% × 500' },
]

function buildSnippet(size: SizeOption, src: string): string {
  const w = String(size.width)
  const h = String(size.height)
  return `<iframe\n  src="${src}"\n  width="${w}"\n  height="${h}"\n  style="border:none;border-radius:8px"\n  title="Chokepoints — Critical Node Atlas"\n  loading="lazy"\n  allowfullscreen\n></iframe>`
}

export function EmbedModal() {
  const embedModalOpen = useAtlasStore((s) => s.embedModalOpen)
  const setEmbedModalOpen = useAtlasStore((s) => s.setEmbedModalOpen)
  const activeLayers = useAtlasStore((s) => s.activeLayers)
  const selectedNodeId = useAtlasStore((s) => s.selectedNodeId)

  const [selectedSize, setSelectedSize] = useState<EmbedSize>('medium')
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!embedModalOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => { previousFocus?.focus() }
  }, [embedModalOpen])

  useEffect(() => {
    if (!embedModalOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEmbedModalOpen(false)
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [embedModalOpen, setEmbedModalOpen])

  if (!embedModalOpen) return null

  const size = SIZE_OPTIONS.find((s) => s.id === selectedSize) ?? SIZE_OPTIONS[1]
  const src = buildEmbedSrc(activeLayers, selectedNodeId)
  const snippet = buildSnippet(size, src)

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    })
  }

  return createPortal(
    <>
      <style>{`
        @keyframes embed-backdrop-in {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes embed-modal-in {
          from { opacity: 0; transform: translateY(10px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes embed-sheet-in {
          from { transform: translateY(100%) }
          to   { transform: translateY(0) }
        }
        @media (max-width: 767px) {
          .embed-backdrop { align-items: flex-end !important; padding: 0 !important; }
          .embed-dialog {
            width: 100% !important;
            max-width: 100% !important;
            max-height: 88vh !important;
            border-radius: 14px 14px 0 0 !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: none !important;
            animation: embed-sheet-in 280ms ease !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={() => setEmbedModalOpen(false)}
        className="embed-backdrop"
        style={{
          position: 'fixed', inset: 0, zIndex: 9500,
          background: 'rgba(0,0,0,.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
          animation: 'embed-backdrop-in 150ms ease',
        }}
      >
        {/* Dialog */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="embed-modal-heading"
          onClick={(e) => e.stopPropagation()}
          className="embed-dialog"
          style={{
            width: '90vw',
            maxWidth: 520,
            maxHeight: '90vh',
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'embed-modal-in 150ms ease',
          }}
        >
          {/* Mobile drag handle */}
          <div
            className="embed-drag-handle"
            style={{ display: 'none', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}
          >
            <style>{`@media (max-width: 767px) { .embed-drag-handle { display: flex !important; } }`}</style>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--rule2)' }} />
          </div>

          {/* Header */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid var(--rule)',
              flexShrink: 0,
            }}
          >
            <span
              id="embed-modal-heading"
              style={{
                fontSize: 11, fontWeight: 500, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: 'var(--ink3)',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Embed this map
            </span>
            <button
              ref={closeRef}
              onClick={() => setEmbedModalOpen(false)}
              aria-label="Close embed dialog"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--ink3)', fontSize: 22, lineHeight: 1,
                padding: '2px 6px', fontFamily: 'DM Sans, sans-serif',
              }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Intro */}
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif' }}>
              Paste the snippet below into any HTML page, blog post, or docs site to embed an interactive version of this map. Clicking a node in the embed opens the full map in a new tab.
            </p>

            {/* Size picker */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 10, fontFamily: 'DM Sans, sans-serif' }}>
                Size
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SIZE_OPTIONS.map((opt) => {
                  const active = opt.id === selectedSize
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedSize(opt.id)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 4,
                        border: active ? '1.5px solid var(--ink2)' : '1.5px solid var(--rule)',
                        background: active ? 'var(--paper3)' : 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 12,
                        fontWeight: active ? 600 : 400,
                        color: active ? 'var(--ink)' : 'var(--ink2)',
                        transition: 'all .15s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        lineHeight: 1.3,
                      }}
                    >
                      <span>{opt.label}</span>
                      <span style={{ fontSize: 10, color: active ? 'var(--ink2)' : 'var(--ink3)', fontWeight: 400 }}>{opt.display}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Snippet */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 10, fontFamily: 'DM Sans, sans-serif' }}>
                HTML snippet
              </div>
              <div style={{ position: 'relative' }}>
                <textarea
                  readOnly
                  value={snippet}
                  rows={6}
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", monospace',
                    fontSize: 11,
                    lineHeight: 1.6,
                    padding: '12px',
                    background: 'var(--paper2)',
                    border: '1px solid var(--rule)',
                    borderRadius: 4,
                    color: 'var(--ink)',
                    resize: 'none',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setEmbedModalOpen(false)}
                style={{
                  fontSize: 12, fontWeight: 500, padding: '8px 18px', borderRadius: 4,
                  border: '1px solid var(--rule)', background: 'transparent',
                  color: 'var(--ink2)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  transition: 'background .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--paper3)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Close
              </button>
              <button
                onClick={handleCopy}
                style={{
                  fontSize: 12, fontWeight: 500, padding: '8px 18px', borderRadius: 4,
                  border: 'none',
                  background: copyState === 'copied' ? '#2e7d32' : 'var(--ink)',
                  color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  transition: 'background .2s',
                  minWidth: 80,
                }}
              >
                {copyState === 'copied' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
