"use client";

import { useState } from "react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (feedback: { type: string; message: string; rating?: number }) => Promise<void>;
}

const FEEDBACK_TYPES = [
  { value: "bug", label: "🐛 Bug Report", emoji: "🐛" },
  { value: "feature", label: "💡 Feature Request", emoji: "💡" },
  { value: "ux", label: "🎨 UX Improvement", emoji: "🎨" },
  { value: "praise", label: "❤️ Praise", emoji: "❤️" },
  { value: "other", label: "💬 Other", emoji: "💬" },
];

export default function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState("feature");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ type: feedbackType, message, rating });
      } else {
        // Default API call
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: feedbackType, message, rating }),
        });
      }
      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Feedback submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage("");
    setRating(undefined);
    setFeedbackType("feature");
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative bg-gradient-to-br from-[#0a0e27] to-[#1a1e37] border-4 border-[#00ff00] rounded-xl p-6 max-w-lg w-full shadow-[0_0_30px_rgba(0,255,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 0 30px rgba(0, 255, 0, 0.3), inset 0 0 20px rgba(0, 255, 0, 0.1)",
        }}
      >
        {/* CRT Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10 rounded-lg"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff00 2px, #00ff00 4px)",
          }}
        />

        {submitted ? (
          // Success State
          <div className="text-center py-8">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold text-[#00ff00] mb-2 font-mono">
              Thanks for your feedback!
            </h3>
            <p className="text-white/70 text-sm font-mono">
              Your input helps make Pixel Logo Forge better.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#00ff00] font-mono">Give Feedback</h2>
              <button
                onClick={handleClose}
                className="text-white/50 hover:text-white text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Feedback Type */}
            <div className="mb-4">
              <label className="block text-[#00ff00] font-mono text-sm mb-2">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {FEEDBACK_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFeedbackType(type.value)}
                    className={`px-3 py-2 rounded-lg font-mono text-sm transition-all border-2 ${
                      feedbackType === type.value
                        ? "bg-[#00ff00]/20 border-[#00ff00] text-[#00ff00]"
                        : "border-white/20 text-white/70 hover:border-white/40"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating (Optional) */}
            <div className="mb-4">
              <label className="block text-[#00ff00] font-mono text-sm mb-2">
                Rating (Optional)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-transform hover:scale-110 ${
                      rating && star <= rating ? "text-[#ffaa00]" : "text-white/20"
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-[#00ff00] font-mono text-sm mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
                rows={4}
                className="w-full px-4 py-3 bg-[#0a0e27]/50 border-2 border-[#00ff00]/50 text-white rounded-lg font-mono text-sm focus:outline-none focus:border-[#00ff00] placeholder-white/30 resize-none"
              />
              <div className="text-right text-xs text-white/40 mt-1 font-mono">
                {message.length} / 500
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || isSubmitting}
              className="w-full px-4 py-3 bg-[#00ff00] text-[#0a0e27] rounded-lg font-mono font-bold hover:bg-[#00ff00]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(0,255,0,0.5)]"
            >
              {isSubmitting ? "Sending..." : "Submit Feedback"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
