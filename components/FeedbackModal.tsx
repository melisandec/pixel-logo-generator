"use client";

import { useState } from "react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (feedback: {
    type: string;
    message: string;
    rating?: number;
  }) => Promise<void>;
}

const FEEDBACK_TYPES = [
  { value: "bug", label: "🐛 Bug Report", emoji: "🐛" },
  { value: "feature", label: "💡 Feature Request", emoji: "💡" },
  { value: "ux", label: "🎨 UX Improvement", emoji: "🎨" },
  { value: "praise", label: "❤️ Praise", emoji: "❤️" },
  { value: "other", label: "💬 Other", emoji: "💬" },
];

export default function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
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
        className="relative bg-gradient-to-br from-[#0a0e27] to-[#1a1e37] border-2 border-[#00ff00] rounded-lg p-4 max-w-sm w-full shadow-[0_0_20px_rgba(0,255,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow:
            "0 0 20px rgba(0, 255, 0, 0.2), inset 0 0 10px rgba(0, 255, 0, 0.05)",
        }}
      >
        {/* CRT Effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5 rounded-lg"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff00 2px, #00ff00 4px)",
          }}
        />

        {submitted ? (
          // Success State
          <div className="text-center py-4">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="text-base font-bold text-[#00ff00] mb-1 font-mono">
              Thanks!
            </h3>
            <p className="text-white/70 text-xs font-mono">
              Your feedback helps improve the forge.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#00ff00] font-mono">
                Give Feedback
              </h2>
              <button
                onClick={handleClose}
                className="text-white/50 hover:text-white text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Feedback Type */}
            <div className="mb-3">
              <label className="block text-[#00ff00] font-mono text-xs mb-1">
                Type
              </label>
              <div className="grid grid-cols-2 gap-1">
                {FEEDBACK_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFeedbackType(type.value)}
                    className={`px-2 py-1 rounded font-mono text-[10px] transition-all border ${
                      feedbackType === type.value
                        ? "bg-[#00ff00]/20 border-[#00ff00] text-[#00ff00]"
                        : "border-white/20 text-white/60 hover:border-white/40"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating (Optional) */}
            <div className="mb-3">
              <label className="block text-[#00ff00] font-mono text-xs mb-1">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-sm transition-transform hover:scale-110 ${
                      rating && star <= rating
                        ? "text-[#ffaa00]"
                        : "text-white/20"
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-3">
              <label className="block text-[#00ff00] font-mono text-xs mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
                rows={3}
                className="w-full px-2 py-2 bg-[#0a0e27]/50 border border-[#00ff00]/50 text-white rounded font-mono text-xs focus:outline-none focus:border-[#00ff00] placeholder-white/30 resize-none"
              />
              <div className="text-right text-[10px] text-white/30 mt-0.5 font-mono">
                {message.length}/500
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || isSubmitting}
              className="w-full px-3 py-1.5 bg-[#00ff00] text-[#0a0e27] rounded font-mono font-bold text-xs hover:bg-[#00ff00]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(0,255,0,0.3)]"
            >
              {isSubmitting ? "Sending..." : "Submit"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
