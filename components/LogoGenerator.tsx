'use client';

import { useState, useEffect } from 'react';
import { generateLogo, LogoResult, Rarity } from '@/lib/logoGenerator';
import { sdk } from '@farcaster/miniapp-sdk';
import Toast from './Toast';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function LogoGenerator() {
  const [inputText, setInputText] = useState('');
  const [customSeed, setCustomSeed] = useState<string>('');
  const [logoResult, setLogoResult] = useState<LogoResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [seedError, setSeedError] = useState<string>('');
  const [userInfo, setUserInfo] = useState<{ fid?: number; username?: string } | null>(null);

  useEffect(() => {
    // Initialize SDK and signal ready after 3 seconds (splash screen delay)
    const initSdk = async () => {
      // Wait 3 seconds before calling ready (splash screen duration)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        await sdk.actions.ready();
        setSdkReady(true);
        
        // Get user info if available
        try {
          const context = await sdk.context;
          if (context?.user) {
            setUserInfo({
              fid: context.user.fid,
              username: context.user.username,
            });
          }
        } catch (userError) {
          console.log('Could not get user info:', userError);
        }
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
          setToast({ 
            message: 'Failed to load logo from URL. Please try generating manually.', 
            type: 'error' 
          });
        }
      }, 100);
    }
  }, []);

  const handleGenerate = () => {
    if (!inputText.trim()) {
      setToast({ message: 'Please enter some text to generate a logo', type: 'error' });
      return;
    }
    
    if (seedError) {
      setToast({ message: 'Please fix the seed error before generating', type: 'error' });
      return;
    }
    
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
        setToast({ message: 'Logo generated successfully!', type: 'success' });
      } catch (error) {
        console.error('Error generating logo:', error);
        setToast({ 
          message: error instanceof Error ? error.message : 'Failed to generate logo. Please try again.', 
          type: 'error' 
        });
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
          // Use the logo image in the share
          const result = await sdk.actions.composeCast({
            text: `Just generated a ${logoResult.rarity.toLowerCase()} pixel logo: "${logoResult.config.text}" 🎮\n\nRecreate it: ${shareUrl}`,
            embeds: [logoResult.dataUrl, shareUrl], // Include image and share URL
          });
          
          if (result && result.cast) {
            setToast({ message: 'Logo shared to Farcaster! 🎉', type: 'success' });
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
        setToast({ message: 'Shared successfully!', type: 'success' });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setToast({ message: 'Share URL copied to clipboard!', type: 'success' });
      }
    } catch (error) {
      console.error('Share error:', error);
      setToast({ message: 'Failed to share. Please try again.', type: 'error' });
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
      
      // Generate the composite cast image with logo, rarity, and owner
      let castImageUrl = logoResult.dataUrl; // Fallback to original logo
      
      try {
        const castImageDataUrl = await generateCastImage(logoResult);
        
        // Upload the composite image to get a shareable URL
        const uploadResponse = await fetch('/api/logo-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dataUrl: castImageDataUrl,
            text: logoResult.config.text,
            seed: logoResult.seed,
          }),
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          if (uploadData.imageUrl) {
            castImageUrl = uploadData.imageUrl;
          }
        }
      } catch (imageError) {
        console.log('Failed to generate cast image, using original:', imageError);
        // Continue with original logo
      }
      
      // Use Farcaster SDK composeCast
      if (sdkReady) {
        try {
          const result = await sdk.actions.composeCast({
            text: `🎮 Generated a ${logoResult.rarity.toLowerCase()} pixel logo: "${logoResult.config.text}"\n\nRecreate it: ${shareUrl}\n\nSeed: ${logoResult.seed}`,
            embeds: [castImageUrl], // Include the composite image with rarity and owner
          });
          
          if (result && result.cast) {
            setToast({ message: 'Logo casted! 🎉', type: 'success' });
          } else {
            setToast({ message: 'Cast cancelled', type: 'info' });
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
        )}&embeds[]=${encodeURIComponent(castImageUrl)}`;
        window.open(warpcastUrl, '_blank');
        setToast({ message: 'Opening Warpcast to compose cast...', type: 'info' });
      }
    } catch (error) {
      console.error('Cast error:', error);
      setToast({ message: 'Failed to cast. Please try again or share manually.', type: 'error' });
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

  const generateCastImage = async (logoResult: LogoResult): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a larger canvas for the card
        const cardCanvas = document.createElement('canvas');
        const cardCtx = cardCanvas.getContext('2d');
        if (!cardCtx) {
          reject(new Error('Could not create canvas context'));
          return;
        }

        // Load the logo image
        const logoImg = new Image();
        logoImg.onload = () => {
          // Card dimensions - wider format for social sharing
          const cardWidth = 1200;
          const cardHeight = 630;
          cardCanvas.width = cardWidth;
          cardCanvas.height = cardHeight;

          // Disable smoothing for pixel art
          cardCtx.imageSmoothingEnabled = false;

          // Draw dark background
          cardCtx.fillStyle = '#000000';
          cardCtx.fillRect(0, 0, cardWidth, cardHeight);

          // Draw border
          const borderWidth = 8;
          const rarityColor = getRarityColor(logoResult.rarity);
          cardCtx.strokeStyle = rarityColor;
          cardCtx.lineWidth = borderWidth;
          cardCtx.strokeRect(borderWidth / 2, borderWidth / 2, cardWidth - borderWidth, cardHeight - borderWidth);

          // Calculate logo size and position (centered)
          const logoPadding = 40;
          const maxLogoWidth = cardWidth - logoPadding * 2 - 200; // Leave space for metadata
          const maxLogoHeight = cardHeight - logoPadding * 2 - 120;
          
          let logoWidth = logoImg.width;
          let logoHeight = logoImg.height;
          const logoAspect = logoWidth / logoHeight;
          
          if (logoWidth > maxLogoWidth) {
            logoWidth = maxLogoWidth;
            logoHeight = logoWidth / logoAspect;
          }
          if (logoHeight > maxLogoHeight) {
            logoHeight = maxLogoHeight;
            logoWidth = logoHeight * logoAspect;
          }

          const logoX = (cardWidth - logoWidth) / 2;
          const logoY = 80;

          // Draw logo
          cardCtx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

          // Draw rarity badge at top
          const rarityY = 20;
          const rarityX = cardWidth - 200;
          cardCtx.fillStyle = '#000000';
          cardCtx.fillRect(rarityX - 10, rarityY - 10, 180, 50);
          cardCtx.strokeStyle = rarityColor;
          cardCtx.lineWidth = 4;
          cardCtx.strokeRect(rarityX - 10, rarityY - 10, 180, 50);
          
          cardCtx.fillStyle = rarityColor;
          cardCtx.font = 'bold 20px "Press Start 2P", monospace';
          cardCtx.textAlign = 'center';
          cardCtx.textBaseline = 'middle';
          cardCtx.fillText('RARITY:', rarityX + 80, rarityY + 8);
          cardCtx.fillText(logoResult.rarity, rarityX + 80, rarityY + 32);

          // Draw owner info at bottom
          const ownerY = cardHeight - 60;
          const ownerText = userInfo?.username 
            ? `Generated by @${userInfo.username}`
            : userInfo?.fid 
            ? `Generated by FID ${userInfo.fid}`
            : 'Generated by Pixel Logo Forge';
          
          cardCtx.fillStyle = '#888888';
          cardCtx.font = '14px "Courier New", monospace';
          cardCtx.textAlign = 'center';
          cardCtx.textBaseline = 'middle';
          cardCtx.fillText(ownerText, cardWidth / 2, ownerY);

          // Draw seed info
          cardCtx.fillStyle = '#666666';
          cardCtx.font = '12px "Courier New", monospace';
          cardCtx.fillText(`Seed: ${logoResult.seed}`, cardWidth / 2, ownerY + 25);

          // Convert to data URL
          resolve(cardCanvas.toDataURL('image/png'));
        };

        logoImg.onerror = () => {
          reject(new Error('Failed to load logo image'));
        };

        logoImg.src = logoResult.dataUrl;
      } catch (error) {
        reject(error);
      }
    });
  };

  const copySeed = async () => {
    if (logoResult) {
      try {
        await navigator.clipboard.writeText(logoResult.seed.toString());
        setToast({ message: `Seed ${logoResult.seed} copied! Share it to recreate this logo.`, type: 'success' });
      } catch (error) {
        setToast({ message: 'Failed to copy seed to clipboard', type: 'error' });
      }
    }
  };

  return (
    <div className="logo-generator">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
          aria-label="Text input for logo generation"
          aria-required="true"
        />
        <div className="seed-input-group">
          <input
            type="text"
            value={customSeed}
            onChange={(e) => {
              const value = e.target.value.trim();
              setCustomSeed(value);
              
              // Validate seed input
              if (value === '') {
                setSeedError('');
              } else {
                const numValue = parseInt(value, 10);
                if (isNaN(numValue)) {
                  setSeedError('Seed must be a number');
                } else if (numValue < 0 || numValue > 2147483647) {
                  setSeedError('Seed must be between 0 and 2147483647');
                } else {
                  setSeedError('');
                }
              }
            }}
            placeholder="Optional: Custom seed (0-2147483647)"
            className="seed-input"
            disabled={isGenerating}
            aria-label="Custom seed input for deterministic logo generation"
            aria-invalid={seedError !== ''}
            aria-describedby={seedError ? 'seed-error' : 'seed-hint'}
          />
          {seedError ? (
            <span id="seed-error" className="seed-error" role="alert">
              {seedError}
            </span>
          ) : (
            <span id="seed-hint" className="seed-hint">Leave empty for random</span>
          )}
        </div>
        <div className="button-group">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !inputText.trim() || !!seedError}
            className="arcade-button"
            aria-label="Generate pixel logo"
            aria-busy={isGenerating ? 'true' : 'false'}
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
              alt={`Pixel logo: ${logoResult.config.text} with ${logoResult.rarity} rarity`}
              className="logo-image"
              role="img"
              aria-label={`Generated pixel logo for "${logoResult.config.text}" with ${logoResult.rarity} rarity`}
            />
            <div className="logo-info">
              <div className="seed-display">
                <span>Seed: </span>
                <button 
                  onClick={copySeed} 
                  className="seed-button"
                  aria-label={`Copy seed ${logoResult.seed} to clipboard`}
                >
                  {logoResult.seed}
                </button>
                <span className="seed-help">(Click to copy)</span>
              </div>
              <div className="logo-footer">
                Generated by Pixel Logo Forge
              </div>
            </div>
            <div className="logo-actions">
              <button 
                onClick={handleDownload} 
                className="action-button" 
                disabled={isGenerating}
                aria-label="Download logo as PNG"
              >
                DOWNLOAD PNG
              </button>
              <button 
                onClick={handleShare} 
                className="action-button"
                disabled={isSharing || isGenerating}
                aria-label="Share logo"
                aria-busy={isSharing}
              >
                {isSharing ? 'SHARING...' : 'SHARE'}
              </button>
              <button 
                onClick={handleCast} 
                className="action-button cast-button"
                disabled={isCasting || isGenerating}
                aria-label="Cast logo to Farcaster"
                aria-busy={isCasting}
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
