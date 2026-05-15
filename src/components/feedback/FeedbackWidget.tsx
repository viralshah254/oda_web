'use client';

import React, { useState, useRef } from 'react';

type FeedbackCategory = 'BUG' | 'SUGGESTION' | 'CONTENT' | 'OTHER';

const CATEGORIES: { value: FeedbackCategory; label: string; emoji: string }[] = [
  { value: 'BUG', label: 'Bug / Error', emoji: '🐛' },
  { value: 'SUGGESTION', label: 'Suggestion', emoji: '💡' },
  { value: 'CONTENT', label: 'Wrong info', emoji: '📝' },
  { value: 'OTHER', label: 'Other', emoji: '💬' },
];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [text, setText] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setRating(0);
    setHoverRating(0);
    setCategory(null);
    setText('');
    setScreenshotFile(null);
    setSubmitted(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || !text.trim()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('rating', String(rating));
      formData.append('category', category ?? 'OTHER');
      formData.append('text', text);
      if (screenshotFile) formData.append('screenshot', screenshotFile);

      await fetch('/api/v1/feedback', { method: 'POST', body: formData });
      setSubmitted(true);
    } catch {
      // silently fail — feedback should never block the user
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => { setOpen(true); reset(); }}
        className="fixed bottom-6 right-6 z-40 bg-gray-900 text-white rounded-full px-4 py-2.5 text-sm font-medium shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        aria-label="Give feedback"
      >
        <span>💬</span>
        <span>Feedback</span>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">🙏</p>
                <p className="text-base font-semibold text-gray-900">Thank you!</p>
                <p className="text-sm text-gray-500 mt-1">Your feedback helps us improve Oda.</p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900">Share your feedback</h2>
                  <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>

                {/* Star rating */}
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">How would you rate your experience?</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="text-2xl transition-transform hover:scale-110"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      >
                        {star <= (hoverRating || rating) ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Category</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCategory(c.value)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                          category === c.value
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <span>{c.emoji}</span>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text */}
                <div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tell us what's on your mind…"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    rows={3}
                    maxLength={1000}
                    required
                  />
                  <p className="text-right text-xs text-gray-400 mt-0.5">{text.length}/1000</p>
                </div>

                {/* Screenshot */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setScreenshotFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-gray-500 hover:text-gray-800 underline"
                  >
                    {screenshotFile ? `📎 ${screenshotFile.name}` : '+ Attach screenshot (optional)'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!rating || !text.trim() || loading}
                  className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40"
                >
                  {loading ? 'Sending…' : 'Send feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FeedbackWidget;
