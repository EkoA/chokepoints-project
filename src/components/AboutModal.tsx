import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAtlasStore } from '../store/useAtlasStore'

export function AboutModal() {
  const aboutOpen = useAtlasStore((s) => s.aboutOpen)
  const setAboutOpen = useAtlasStore((s) => s.setAboutOpen)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus management: save previously focused element, restore on close
  useEffect(() => {
    if (!aboutOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => {
      previousFocus?.focus()
    }
  }, [aboutOpen])

  // Escape to close + Tab focus trap
  useEffect(() => {
    if (!aboutOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAboutOpen(false)
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
  }, [aboutOpen, setAboutOpen])

  if (!aboutOpen) return null

  return createPortal(
    <>
      <style>{`
        @keyframes about-backdrop-in {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes about-modal-in {
          from { opacity: 0; transform: translateY(10px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes about-sheet-in {
          from { transform: translateY(100%) }
          to   { transform: translateY(0) }
        }
        @media (max-width: 767px) {
          .about-backdrop { align-items: flex-end !important; padding: 0 !important; }
          .about-dialog {
            width: 100% !important;
            max-width: 100% !important;
            max-height: 88vh !important;
            border-radius: 14px 14px 0 0 !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: none !important;
            animation: about-sheet-in 280ms ease !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={() => setAboutOpen(false)}
        className="about-backdrop"
        style={{
          position: 'fixed', inset: 0, zIndex: 9500,
          background: 'rgba(0,0,0,.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
          animation: 'about-backdrop-in 150ms ease',
        }}
      >
        {/* Dialog */}
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-modal-heading"
          onClick={(e) => e.stopPropagation()}
          className="about-dialog"
          style={{
            width: '90vw',
            maxWidth: 560,
            maxHeight: '90vh',
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'about-modal-in 150ms ease',
          }}
        >
          {/* Mobile drag handle */}
          <div
            className="about-drag-handle"
            style={{ display: 'none', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}
          >
            <style>{`@media (max-width: 767px) { .about-drag-handle { display: flex !important; } }`}</style>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--rule2)' }} />
          </div>

          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid var(--rule)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ink3)',
              }}
            >
              About
            </span>
            <button
              ref={closeRef}
              onClick={() => setAboutOpen(false)}
              aria-label="Close about modal"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ink3)',
                fontSize: 20,
                lineHeight: 1,
                padding: '0 2px',
                borderRadius: 3,
                transition: 'color .15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink3)' }}
            >
              ×
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ padding: 20, overflowY: 'auto' }}>

            {/* ── Section 1: About the project ── */}
            <h2
              id="about-modal-heading"
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: 14,
              }}
            >
              About this project
            </h2>

            <p style={{ fontSize: 14, lineHeight: 1.78, color: 'var(--ink2)', marginBottom: 12 }}>
              Every day, billions of dollars of goods, energy and data travel across the world through
              a surprisingly small number of bottlenecks. A narrow strip of water in the Middle East.
              A cluster of undersea cables off the coast of Egypt. A single chip factory on a small island
              in the Pacific. A payment network headquartered in Belgium that almost every bank on earth
              depends on.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.78, color: 'var(--ink2)', marginBottom: 12 }}>
              I first heard about this during an Global strategy class at the University of Oxford and
              what I found striking, was how invisible these places
              are to most people until something breaks. When a giant cargo ship ran aground in the
              Suez Canal in 2021, it held up $10 billion of goods every day for a week. When the US
              sanctioned Russia in 2022, two American card companies cut off 100 million Russian
              cardholders within 72 hours. When Yemen's Houthi rebels started attacking ships in the
              Red Sea in 2024, global shipping costs doubled overnight.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.78, color: 'var(--ink2)', marginBottom: 12 }}>
              I built this map to make those chokepoints visible — across shipping, the internet, money,
              technology and energy, and to show what happens when they break.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.78, color: 'var(--ink2)' }}>
              Data sources: IMF PortWatch (shipping), TeleGeography (internet cables), BIS and SWIFT
              (financial networks), IEA and EIA (energy), and public company filings (technology).
              All figures verified against primary sources.
            </p>

            {/* Separator */}
            <div style={{ height: 1, background: 'var(--rule)', margin: '20px 0' }} />

            {/* ── Section 2: Built by ── */}
            <h2
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: 10,
              }}
            >
              Built by
            </h2>

            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
              Adetolani Eko
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink3)', lineHeight: 1.6, marginBottom: 14 }}>
              Product Executive and Global Business student at the Saïd Business School, University of Oxford.
            </p>

            {/* Social links */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/adetolani-eko-gmcpn/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{ color: 'var(--ink3)', display: 'flex', transition: 'color .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink3)' }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              {/* Medium */}
              <a
                href="https://medium.com/@eko-adetolani"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Medium"
                style={{ color: 'var(--ink3)', display: 'flex', transition: 'color .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink3)' }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                </svg>
              </a>

              {/* Personal site — globe */}
              <a
                href="https://adetolanieko.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Personal site"
                style={{ color: 'var(--ink3)', display: 'flex', transition: 'color .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink3)' }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/EkoA"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                style={{ color: 'var(--ink3)', display: 'flex', transition: 'color .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink3)' }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>

            {/* Open source line */}
            <p style={{ fontSize: 12, color: 'var(--ink3)' }}>
              Open source · MIT licensed ·{' '}
              <a
                href="https://github.com/EkoA/chokepoints-project"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--ink3)',
                  textDecoration: 'underline',
                  textDecorationColor: 'var(--rule2)',
                  transition: 'color .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink3)' }}
              >
                view the code
              </a>
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
