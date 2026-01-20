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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          position: "relative",
          backgroundColor: "#0a0e27",
          border: "1px solid #00ff00",
          borderRadius: "4px",
          padding: "12px",
          width: "100%",
          maxWidth: "320px",
          fontSize: "11px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-2">
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>🎉</div>
            <div
              className="text-[#00ff00] font-mono"
              style={{ fontSize: "11px", fontWeight: "bold" }}
            >
              Thanks!
            </div>
          </div>
        ) : (
          <>
            <div style={{ position: "relative", marginBottom: "8px" }}>
              <div
                className="text-[#00ff00] font-mono"
                style={{ fontSize: "11px", fontWeight: "bold" }}
              >
                Feedback
              </div>
              <button
                onClick={handleClose}
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "0",
                  fontSize: "16px",
                  lineHeight: 1,
                  color: "#888",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0",
                  minWidth: "20px",
                }}
              >
              >
                ✕
              </button>
            </div>

            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              style={{
                width: "100%",
                padding: "2px 4px",
                fontSize: "11px",
                marginBottom: "6px",
                border: "1px solid #0a0",
                borderRadius: "2px",
                background: "#0a0e27",
                color: "#0a0",
              }}
            >
              {FEEDBACK_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your feedback..."
              rows={3}
              style={{
                width: "100%",
                padding: "4px",
                fontSize: "11px",
                marginBottom: "6px",
                border: "1px solid #0a0",
                borderRadius: "2px",
                background: "#0a0e27",
                color: "white",
                resize: "none",
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={!message.trim() || isSubmitting}
              style={{
                width: "100%",
                padding: "4px",
                fontSize: "11px",
                border: "1px solid #0a0",
                borderRadius: "2px",
                background: "#0a0",
                color: "white",
                cursor:
                  !message.trim() || isSubmitting ? "not-allowed" : "pointer",
                opacity: !message.trim() || isSubmitting ? 0.5 : 1,
              }}
            >
              {isSubmitting ? "Sending..." : "Submit"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
