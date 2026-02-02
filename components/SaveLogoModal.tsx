"use client";

import { useState } from "react";
import styles from "./LogoGenerator.module.css";

interface SaveLogoModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onSave: (username: string) => Promise<void>;
  onSkip: () => Promise<void>;
  logoText: string;
}

export default function SaveLogoModal({
  isOpen,
  isLoading,
  onSave,
  onSkip,
  logoText,
}: SaveLogoModalProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Please enter a username");
      return;
    }

    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    if (trimmedUsername.length > 30) {
      setError("Username must be 30 characters or less");
      return;
    }

    try {
      setError("");
      await onSave(trimmedUsername);
      setUsername("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save logo");
    }
  };

  const handleSkip = async () => {
    try {
      setError("");
      await onSkip();
      setUsername("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete logo");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.saveLogoModal}>
        <div className={styles.saveModalHeader}>
          <h2 className={styles.saveModalTitle}>Save Your Logo?</h2>
          <p className={styles.saveModalSubtitle}>
            {logoText ? `"${logoText}"` : "Your creation"}
          </p>
        </div>

        <div className={styles.saveModalContent}>
          <p className={styles.saveModalDescription}>
            Join the leaderboard and earn badges! Enter a username to save your
            logo and compete with others.
          </p>

          <div className={styles.usernameInputGroup}>
            <label htmlFor="save-username" className={styles.usernameLabel}>
              Choose a username
            </label>
            <input
              id="save-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Your username (3-30 chars)"
              maxLength={30}
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSave();
                }
              }}
              aria-label="Username for saving logo"
              className={styles.usernameInput}
            />
            {error && (
              <span className={styles.inputError} role="alert">
                {error}
              </span>
            )}
          </div>

          <div className={styles.modalBenefits}>
            <ul className={styles.benefitsList}>
              <li>📈 Appear on the leaderboard</li>
              <li>🏆 Earn badges and rewards</li>
              <li>❤️ Get likes and feedback</li>
              <li>🔗 Share your creations</li>
            </ul>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={handleSkip}
            disabled={isLoading}
            aria-label="Don't save this logo"
          >
            {isLoading ? "Processing..." : "Skip for now"}
          </button>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={handleSave}
            disabled={isLoading || !username.trim()}
            aria-label="Save logo with username"
          >
            {isLoading ? "Saving..." : "Save & Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
