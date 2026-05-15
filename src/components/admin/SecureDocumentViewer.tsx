'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Shield, Clock, AlertTriangle, Loader2, X } from 'lucide-react';

interface SecureDocumentViewerProps {
  docId: string;
  docType?: string;
  adminName: string;
  onClose?: () => void;
}

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 min

export function SecureDocumentViewer({
  docId,
  docType,
  adminName,
  onClose,
}: SecureDocumentViewerProps) {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(INACTIVITY_TIMEOUT_MS / 1000);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch signed view URL
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/v1/documents/${docId}/view-url`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setViewUrl(data.url);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [docId]);

  // Inactivity timeout
  const resetTimer = useCallback(() => {
    setTimeLeft(INACTIVITY_TIMEOUT_MS / 1000);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => setExpired(true), INACTIVITY_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    if (!viewUrl) return;
    resetTimer();

    countdownTimer.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(countdownTimer.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [viewUrl, resetTimer]);

  // Disable right-click and keyboard shortcuts
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['p', 's', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (expired) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 bg-[#F5F5F0] rounded-2xl p-8">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
          <Clock size={32} className="text-orange-500" />
        </div>
        <h3 className="text-lg font-bold text-[#1A1A1A] font-plus-jakarta">Session Expired</h3>
        <p className="text-sm text-[#666] text-center font-plus-jakarta">
          This document view has expired due to inactivity. Please reload to view again.
        </p>
        <button
          onClick={() => { setExpired(false); setViewUrl(null); setLoading(true); }}
          className="px-6 py-2.5 bg-[#198A2E] text-white rounded-xl text-sm font-bold font-plus-jakarta"
        >
          Reload Document
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={resetTimer}
      onKeyDown={resetTimer}
      className="relative flex flex-col bg-[#1A1A1A] rounded-2xl overflow-hidden select-none"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#198A2E]" />
          <span className="text-sm font-semibold text-white font-plus-jakarta">
            Secure Viewer {docType && `· ${docType}`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 text-xs font-plus-jakarta ${timeLeft < 120 ? 'text-orange-400' : 'text-white/60'}`}>
            <Clock size={13} />
            <span>Expires in {formatTime(timeLeft)}</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X size={16} className="text-white/70" />
            </button>
          )}
        </div>
      </div>

      {/* Document content */}
      <div className="relative flex-1 min-h-[500px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
            <Loader2 size={32} className="animate-spin text-[#198A2E]" />
          </div>
        )}

        {viewUrl && !loading && (
          <iframe
            src={viewUrl}
            className="w-full h-full min-h-[500px] border-0"
            sandbox="allow-same-origin allow-scripts"
            title="Secure Document"
          />
        )}

        {/* Watermark overlay */}
        {viewUrl && !loading && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-white/10 text-xs font-bold whitespace-nowrap select-none"
                style={{
                  transform: `rotate(-30deg)`,
                  top: `${10 + i * 12}%`,
                  left: `-10%`,
                  right: `-10%`,
                  textAlign: 'center',
                }}
              >
                {adminName} · {new Date().toLocaleDateString('en-KE')} · CONFIDENTIAL
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning footer */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[#111] border-t border-white/10">
        <AlertTriangle size={13} className="text-yellow-500 shrink-0" />
        <p className="text-xs text-white/50 font-plus-jakarta">
          This document is confidential. Unauthorised sharing or screenshotting is a policy violation.
        </p>
      </div>
    </div>
  );
}
