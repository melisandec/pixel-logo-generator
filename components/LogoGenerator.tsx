'use client';

import { useState } from 'react';
import { generateLogo, LogoResult } from '@/lib/logoGenerator';

export default function LogoGenerator() {
  const [inputText, setInputText] = useState('');
  const [logoResult, setLogoResult] = useState<LogoResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const result = generateLogo({ text: inputText.trim() });
        setLogoResult(result);
      } catch (error) {
        console.error('Error generating logo:', error);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const handleDownload = () => {
    if (!logoResult) return;
    
    const link = document.createElement('a');
    link.download = `pixel-logo-${logoResult.config.text.replace(/\s+/g, '-')}.png`;
    link.href = logoResult.dataUrl;
    link.click();
  };

  const handleShare = () => {
    if (!logoResult) return;
    
    // For Farcaster, we can share the image URL or use their API
    if (navigator.share) {
      navigator.share({
        title: `Pixel Logo: ${logoResult.config.text}`,
        text: `Check out my retro pixel logo: ${logoResult.config.text}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: copy image to clipboard or show share options
      navigator.clipboard.writeText(logoResult.dataUrl).then(() => {
        alert('Logo copied to clipboard!');
      });
    }
  };

  return (
    <div className="logo-generator">
      <div className="input-section">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="Enter your text (max 30 chars)"
          maxLength={30}
          className="terminal-input"
          disabled={isGenerating}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !inputText.trim()}
          className="arcade-button"
        >
          {isGenerating ? 'GENERATING...' : 'GENERATE'}
        </button>
      </div>

      {logoResult && (
        <div className="output-section">
          <div className="logo-card">
            <img
              src={logoResult.dataUrl}
              alt={`Pixel logo: ${logoResult.config.text}`}
              className="logo-image"
            />
            <div className="logo-actions">
              <button onClick={handleDownload} className="action-button">
                DOWNLOAD PNG
              </button>
              <button onClick={handleShare} className="action-button">
                SHARE
              </button>
            </div>
            {logoResult.config.seed && (
              <div className="seed-info">
                Seed: {logoResult.config.seed}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
