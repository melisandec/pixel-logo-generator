'use client';

import { useState, useEffect } from 'react';
import { generateLogo, LogoResult, Rarity } from '@/lib/logoGenerator';
import { sdk } from '@farcaster/miniapp-sdk';

export default function LogoGenerator() {
  const [inputText, setInputText] = useState('');
  const [customSeed, setCustomSeed] = useState<string>('');
  const [logoResult, setLogoResult] = useState<LogoResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // Initialize SDK and signal ready
    const initSdk = async () => {
      try {
        await sdk.actions.ready();
        setSdkReady(true);
      } catch (error) {
        console.log('SDK not available (running outside Farcaster client)');
        setSdkReady(false);
      }
    };
    initSdk();

    // Load logo from URL parameters if present
    const params = new URLSearchParams(window.location.search);
    const textParam = params.get('text');
    const seedParam = params.get('seed');
    
    if (textParam) {
      setInputText(textParam);
      const seed = seedParam ? parseInt(seedParam, 10) : undefined;
      if (seed) {
        setCustomSeed(seed.toString());
      }
      
      // Auto-generate if we have text
      setTimeout(() => {
        try {
          const result = generateLogo({
            text: textParam,
            seed: seed,
          });
          setLogoResult(result);
        } catch (error) {
          console.error('Error loading logo from URL:', error);
        }
      }, 100);
    }
  }, []);

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

  const handleDownload = () => {
    if (!logoResult) return;
    
    const link = document.createElement('a');
    link.download = `pixel-logo-${logoResult.config.text.replace(/\s+/g, '-')}-${logoResult.rarity.toLowerCase()}.png`;
    link.href = logoResult.dataUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!logoResult) return;
    
    setIsSharing(true);
    try {
      // Create share URL with logo parameters
      const shareUrl = `${window.location.origin}?text=${encodeURIComponent(logoResult.config.text)}&seed=${logoResult.seed}`;
      
      // Try Farcaster SDK first if available
      if (sdkReady) {
        try {
          const result = await sdk.actions.composeCast({
            text: `Just generated a ${logoResult.rarity.toLowerCase()} pixel logo: "${logoResult.config.text}" 🎮\n\nRecreate it: ${shareUrl}`,
            embeds: [logoResult.dataUrl], // Data URL can work as embed
          });
          
          if (result && result.castHash) {
            alert('Logo shared to Farcaster! 🎉');
          }
          return;
        } catch (sdkError) {
          console.log('SDK share failed, trying fallback:', sdkError);
        }
      }
      
      // Fallback to Web Share API
      if (navigator.share) {
        await navigator.share({
          title: `Pixel Logo: ${logoResult.config.text} [${logoResult.rarity}]`,
          text: `Check out my retro pixel logo: ${logoResult.config.text}`,
          url: shareUrl,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Share URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCast = async () => {
    if (!logoResult) return;
    
    setIsCasting(true);
    try {
      // Create share URL with logo parameters
      const shareUrl = `${window.location.origin}?text=${encodeURIComponent(logoResult.config.text)}&seed=${logoResult.seed}`;
      
      // Use Farcaster SDK composeCast
      if (sdkReady) {
        try {
          const result = await sdk.actions.composeCast({
            text: `🎮 Generated a ${logoResult.rarity.toLowerCase()} pixel logo: "${logoResult.config.text}"\n\nRecreate it: ${shareUrl}\n\nSeed: ${logoResult.seed}`,
            embeds: [logoResult.dataUrl, shareUrl], // Include both image and link
          });
          
          if (result && result.castHash) {
            alert(`Logo casted! 🎉\nCast hash: ${result.castHash}`);
          } else {
            alert('Cast cancelled');
          }
          return;
        } catch (sdkError) {
          console.error('SDK cast error:', sdkError);
          throw sdkError;
        }
      } else {
        // Fallback: open Warpcast compose URL
        const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
          `🎮 Generated a ${logoResult.rarity.toLowerCase()} pixel logo: "${logoResult.config.text}"\n\nRecreate it: ${shareUrl}`
        )}`;
        window.open(warpcastUrl, '_blank');
        alert('Opening Warpcast to compose cast...');
      }
    } catch (error) {
      console.error('Cast error:', error);
      alert('Failed to cast. Please try again or share manually.');
    } finally {
      setIsCasting(false);
    }
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
              <button onClick={handleDownload} className="action-button" disabled={isGenerating}>
                DOWNLOAD PNG
              </button>
              <button 
                onClick={handleShare} 
                className="action-button"
                disabled={isSharing || isGenerating}
              >
                {isSharing ? 'SHARING...' : 'SHARE'}
              </button>
              <button 
                onClick={handleCast} 
                className="action-button cast-button"
                disabled={isCasting || isGenerating}
              >
                {isCasting ? 'CASTING...' : 'CAST THIS LOGO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
