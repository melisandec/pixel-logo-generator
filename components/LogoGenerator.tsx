'use client';

import { useState } from 'react';
import { generateLogo, LogoResult, Rarity } from '@/lib/logoGenerator';

export default function LogoGenerator() {
  const [inputText, setInputText] = useState('');
  const [customSeed, setCustomSeed] = useState<string>('');
  const [logoResult, setLogoResult] = useState<LogoResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const seed = customSeed.trim() 
          ? parseInt(customSeed.trim(), 10) || undefined 
          : undefined;
        const result = generateLogo({ 
          text: inputText.trim(),
          seed: seed
        });
        setLogoResult(result);
      } catch (error) {
        console.error('Error generating logo:', error);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const handleRegenerate = () => {
    if (!inputText.trim() || !logoResult) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      try {
        // Generate with same text but new random seed
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
    link.download = `pixel-logo-${logoResult.config.text.replace(/\s+/g, '-')}-${logoResult.rarity.toLowerCase()}.png`;
    link.href = logoResult.dataUrl;
    link.click();
  };

  const handleShare = () => {
    if (!logoResult) return;
    
    if (navigator.share) {
      navigator.share({
        title: `Pixel Logo: ${logoResult.config.text} [${logoResult.rarity}]`,
        text: `Check out my retro pixel logo: ${logoResult.config.text}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(logoResult.dataUrl).then(() => {
        alert('Logo copied to clipboard!');
      });
    }
  };

  const handleCast = () => {
    if (!logoResult) return;
    
    // For Farcaster, this would integrate with their API
    // For now, we'll prepare the data
    const castData = {
      text: `Just generated a ${logoResult.rarity} pixel logo: "${logoResult.config.text}"`,
      image: logoResult.dataUrl,
      seed: logoResult.seed,
    };
    
    console.log('Cast data:', castData);
    alert(`Ready to cast! Rarity: ${logoResult.rarity}\nSeed: ${logoResult.seed}\n\n(Integrate with Farcaster API)`);
  };

  const getRarityColor = (rarity: Rarity): string => {
    switch (rarity) {
      case 'COMMON': return '#AAAAAA';
      case 'RARE': return '#00AAFF';
      case 'EPIC': return '#AA00FF';
      case 'LEGENDARY': return '#FFAA00';
      default: return '#FFFFFF';
    }
  };

  const copySeed = () => {
    if (logoResult) {
      navigator.clipboard.writeText(logoResult.seed.toString()).then(() => {
        alert(`Seed ${logoResult.seed} copied! Share it to recreate this logo.`);
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
        <div className="seed-input-group">
          <input
            type="text"
            value={customSeed}
            onChange={(e) => setCustomSeed(e.target.value)}
            placeholder="Optional: Custom seed"
            className="seed-input"
            disabled={isGenerating}
          />
          <span className="seed-hint">Leave empty for random</span>
        </div>
        <div className="button-group">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            className="arcade-button"
          >
            {isGenerating ? 'GENERATING...' : 'GENERATE'}
          </button>
          {logoResult && (
            <button
              onClick={handleRegenerate}
              disabled={isGenerating || !inputText.trim()}
              className="arcade-button secondary"
            >
              REROLL
            </button>
          )}
        </div>
      </div>

      {logoResult && (
        <div className="output-section">
          <div className="logo-card">
            <div className="rarity-badge" style={{ borderColor: getRarityColor(logoResult.rarity) }}>
              <span className="rarity-label">RARITY:</span>
              <span className="rarity-value" style={{ color: getRarityColor(logoResult.rarity) }}>
                {logoResult.rarity}
              </span>
            </div>
            <img
              src={logoResult.dataUrl}
              alt={`Pixel logo: ${logoResult.config.text}`}
              className="logo-image"
            />
            <div className="logo-info">
              <div className="seed-display">
                <span>Seed: </span>
                <button onClick={copySeed} className="seed-button">
                  {logoResult.seed}
                </button>
                <span className="seed-help">(Click to copy)</span>
              </div>
              <div className="logo-footer">
                Generated by Pixel Logo Forge
              </div>
            </div>
            <div className="logo-actions">
              <button onClick={handleDownload} className="action-button">
                DOWNLOAD PNG
              </button>
              <button onClick={handleShare} className="action-button">
                SHARE
              </button>
              <button onClick={handleCast} className="action-button cast-button">
                CAST THIS LOGO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
