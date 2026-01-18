'use client';

import { useState, useEffect } from 'react';
import { generateLogo, LogoResult, Rarity } from '@/lib/logoGenerator';
import { sdk } from '@farcaster/miniapp-sdk';
import Toast from './Toast';
import CastPreviewModal from './CastPreviewModal';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface DailyLimitState {
  date: string;
  words: string[];
  seedUsed: boolean;
}

interface LogoHistoryItem {
  result: LogoResult;
  createdAt: number;
}

type LimitCheck =
  | { ok: true; normalizedText: string; todayState: DailyLimitState }
  | { ok: false; message: string };

export default function LogoGenerator() {
  const [inputText, setInputText] = useState('');
  const [customSeed, setCustomSeed] = useState<string>('');
  const [seedError, setSeedError] = useState<string>('');
  const [logoResult, setLogoResult] = useState<LogoResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [userInfo, setUserInfo] = useState<{ fid?: number; username?: string } | null>(null);
  const [showCastPreview, setShowCastPreview] = useState(false);
  const [castPreviewImage, setCastPreviewImage] = useState<string | null>(null);
  const [castPreviewText, setCastPreviewText] = useState<string>('');
  const [logoHistory, setLogoHistory] = useState<LogoHistoryItem[]>([]);
  const [dailyLimit, setDailyLimit] = useState<DailyLimitState>({
    date: '',
    words: [],
    seedUsed: false,
  });
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const TRIES_PER_DAY = 3;
  const RANDOM_WORDS = ['Arcade', 'Pixel', 'Forge', 'Neon', 'Crt', 'Quest', 'Byte', 'Retro', 'Glitch'];
  const PRESETS = [
    {
      key: 'arcade',
      label: 'Arcade',
      config: { backgroundStyle: 'crt-scanlines', frameStyle: 'arcade-bezel', colorSystem: 'Classic', compositionMode: 'centered' },
    },
    {
      key: 'vaporwave',
      label: 'Vaporwave',
      config: { backgroundStyle: 'vaporwave-sky', frameStyle: 'trading-card', colorSystem: 'Vaporwave', compositionMode: 'vertical-stacked' },
    },
    {
      key: 'gameboy',
      label: 'Game Boy',
      config: { backgroundStyle: 'grid-horizon', frameStyle: 'none', colorSystem: 'GameBoy', compositionMode: 'centered' },
    },
  ] as const;
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const getTodayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const normalizeWord = (value: string) => value.trim().toLowerCase();

  const formatHistoryTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const saveDailyLimit = (state: DailyLimitState) => {
    try {
      localStorage.setItem('plf:dailyLimit', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to store daily limit:', error);
    }
  };

  const ensureDailyLimit = () => {
    const today = getTodayKey();
    try {
      const stored = localStorage.getItem('plf:dailyLimit');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<DailyLimitState>;
        if (parsed.date === today) {
          const hydrated = {
            date: parsed.date ?? today,
            words: parsed.words ?? [],
            seedUsed: parsed.seedUsed ?? false,
          };
          setDailyLimit(hydrated);
          return hydrated;
        }
      }
    } catch (error) {
      console.error('Failed to read daily limit:', error);
    }

    const reset = { date: today, words: [], seedUsed: false };
    setDailyLimit(reset);
    saveDailyLimit(reset);
    return reset;
  };

  const saveHistory = (items: LogoHistoryItem[]) => {
    try {
      localStorage.setItem('plf:history', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to store history:', error);
    }
  };

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('plf:history');
      if (!stored) return;
      const parsed = JSON.parse(stored) as LogoHistoryItem[];
      if (Array.isArray(parsed)) {
        setLogoHistory(parsed.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to read history:', error);
    }
  };

  useEffect(() => {
    const dailyState = ensureDailyLimit();
    loadHistory();
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
      const limitCheck = checkDailyLimits(textParam, !!seedParam);
      if (!limitCheck.ok) {
        setToast({ message: limitCheck.message, type: 'info' });
        return;
      }
      const seed = seedParam ? parseInt(seedParam, 10) : undefined;
      
      // Auto-generate if we have text
      setTimeout(() => {
        try {
          generateWithText(textParam, seed, selectedPreset);
          if (limitCheck.ok) {
            finalizeDailyLimit(limitCheck.normalizedText, limitCheck.todayState, !!seedParam);
          }
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

  const addToHistory = (result: LogoResult) => {
    setLogoHistory((prev) => {
      const next = [
        { result, createdAt: Date.now() },
        ...prev.filter(
          (item) =>
            item.result.seed !== result.seed || item.result.config.text !== result.config.text
        ),
      ];
      const trimmed = next.slice(0, 5);
      saveHistory(trimmed);
      return trimmed;
    });
  };

  const getPresetConfig = (presetKey?: string | null) => {
    if (!presetKey) return undefined;
    return PRESETS.find((preset) => preset.key === presetKey)?.config;
  };

  const checkDailyLimits = (text: string, seedProvided: boolean): LimitCheck => {
    const normalizedText = normalizeWord(text);
    const todayState = ensureDailyLimit();
    if (todayState.words.includes(normalizedText)) {
      return { ok: false, message: 'You already tried this word today. Please wait until tomorrow.' };
    }
    if (todayState.words.length >= TRIES_PER_DAY) {
      return { ok: false, message: 'Daily limit reached. Please wait until tomorrow.' };
    }
    if (seedProvided && todayState.seedUsed) {
      return { ok: false, message: 'Seed already used today. Please wait until tomorrow.' };
    }
    return { ok: true, normalizedText, todayState };
  };

  const finalizeDailyLimit = (normalizedText: string, todayState: DailyLimitState, seedProvided: boolean) => {
    const nextLimit = {
      ...todayState,
      words: [...todayState.words, normalizedText],
      seedUsed: todayState.seedUsed || seedProvided,
    };
    setDailyLimit(nextLimit);
    saveDailyLimit(nextLimit);
  };

  const generateWithText = (text: string, seed?: number, presetKey?: string | null) => {
    const presetConfig = getPresetConfig(presetKey);
    const result = generateLogo({
      text,
      seed,
      ...presetConfig,
    });
    setLogoResult(result);
    addToHistory(result);
    return result;
  };

  const handleGenerate = () => {
    if (!inputText.trim()) {
      setToast({ message: 'Please enter some text to generate a logo', type: 'error' });
      return;
    }

    const limitCheck = checkDailyLimits(inputText, !!customSeed.trim());
    if (!limitCheck.ok) {
      setToast({ message: limitCheck.message, type: 'info' });
      return;
    }

    const seedValue = customSeed.trim();
    let seed: number | undefined = undefined;
    if (seedValue) {
      const parsedSeed = parseInt(seedValue, 10);
      if (isNaN(parsedSeed)) {
        setSeedError('Seed must be a number');
        return;
      }
      if (parsedSeed < 0 || parsedSeed > 2147483647) {
        setSeedError('Seed must be between 0 and 2147483647');
        return;
      }
      seed = parsedSeed;
      setSeedError('');
    }

    setIsGenerating(true);
    setTimeout(() => {
      try {
        generateWithText(inputText.trim(), seed, selectedPreset);
        if (limitCheck.ok) {
          finalizeDailyLimit(limitCheck.normalizedText, limitCheck.todayState, !!seed);
        }
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

  const handleRandomize = () => {
    const randomText = RANDOM_WORDS[Math.floor(Math.random() * RANDOM_WORDS.length)];
    setInputText(randomText);
    setCustomSeed('');
    setSeedError('');
    setSelectedPreset(null);

    const limitCheck = checkDailyLimits(randomText, false);
    if (!limitCheck.ok) {
      setToast({ message: limitCheck.message, type: 'info' });
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      try {
        generateWithText(randomText, undefined, null);
        if (limitCheck.ok) {
          finalizeDailyLimit(limitCheck.normalizedText, limitCheck.todayState, false);
        }
        setToast({ message: 'Logo generated successfully!', type: 'success' });
      } catch (error) {
        console.error('Error generating logo:', error);
        setToast({
          message: error instanceof Error ? error.message : 'Failed to generate logo. Please try again.',
          type: 'error',
        });
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const handleDownload = async () => {
    if (!logoResult) return;
    
    const filename = `pixel-logo-${logoResult.config.text.replace(/\s+/g, '-')}-${logoResult.rarity.toLowerCase()}.png`;
    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    try {
      const response = await fetch(logoResult.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Pixel Logo: ${logoResult.config.text}`,
          text: 'Save your pixel logo',
        });
        setToast({ message: 'Image ready to save. Tap “Save Image” or “Save to Files”.', type: 'success' });
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = objectUrl;
      link.rel = 'noopener';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error('Download error:', error);
      setToast({
        message: isMobileDevice
          ? 'Failed to save image. Please try again.'
          : 'Download failed. Check your browser download settings or allow automatic downloads, then try again.',
        type: 'error',
      });
    }
  };

  const handleCopyImage = async () => {
    if (!logoResult) return;
    if (!navigator.clipboard?.write) {
      handleDownload();
      return;
    }

    try {
      const response = await fetch(logoResult.dataUrl);
      const blob = await response.blob();
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      setToast({ message: 'Image copied to clipboard!', type: 'success' });
    } catch (error) {
      console.error('Copy image error:', error);
      setToast({ message: 'Copy failed, downloading instead.', type: 'info' });
      handleDownload();
    }
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

  const handleCastClick = async () => {
    if (!logoResult) return;
    
    // Generate preview first
    try {
      const previewImage = await generateCastImage(logoResult);
      const shareUrl = `${window.location.origin}?text=${encodeURIComponent(logoResult.config.text)}&seed=${logoResult.seed}`;
      
      const rarityEmoji = {
        'COMMON': '⚪',
        'RARE': '🔵',
        'EPIC': '🟣',
        'LEGENDARY': '🟠',
      }[logoResult.rarity] || '🎮';
      
      const previewText = `${rarityEmoji} Forged a ${logoResult.rarity.toLowerCase()} pixel logo: "${logoResult.config.text}"

✨ Rarity: ${logoResult.rarity}
🎲 Seed: ${logoResult.seed}
🔗 Recreate: ${shareUrl}

#PixelLogoForge #${logoResult.rarity}Logo`;
      
      setCastPreviewImage(previewImage);
      setCastPreviewText(previewText);
      setShowCastPreview(true);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setToast({ message: 'Failed to generate preview. Casting directly...', type: 'error' });
      // Fall through to direct cast
      handleCast();
    }
  };

  const handleCast = async () => {
    if (!logoResult) return;
    
    setShowCastPreview(false);
    setIsCasting(true);
    try {
      // Create share URL with logo parameters
      const shareUrl = `${window.location.origin}?text=${encodeURIComponent(logoResult.config.text)}&seed=${logoResult.seed}`;
      
      console.log('Starting cast process...');
      console.log('SDK ready:', sdkReady);
      
      // Generate the composite cast image with logo, rarity, and owner
      let castImageUrl = logoResult.dataUrl; // Fallback to original logo
      
      try {
        console.log('Generating cast image...');
        const castImageDataUrl = await generateCastImage(logoResult);
        console.log('Cast image generated, length:', castImageDataUrl.length);
        
        // Upload the composite image to get a shareable URL
        console.log('Uploading image to get shareable URL...');
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
          console.log('Upload response:', uploadData);
          if (uploadData.imageUrl) {
            castImageUrl = uploadData.imageUrl;
            console.log('Using shareable URL:', castImageUrl);
          } else {
            console.log('No imageUrl in response, using data URL');
          }
        } else {
          console.error('Upload failed:', uploadResponse.status, await uploadResponse.text());
        }
      } catch (imageError) {
        console.error('Failed to generate/upload cast image:', imageError);
        // Continue with original logo
      }
      
      // Use Farcaster SDK composeCast
      if (sdkReady) {
        try {
          // Keep the full cast metadata, but do not embed the share link
          const rarityEmoji = {
            'COMMON': '⚪',
            'RARE': '🔵',
            'EPIC': '🟣',
            'LEGENDARY': '🟠',
          }[logoResult.rarity] || '🎮';
          
          const castText = `${rarityEmoji} Forged a ${logoResult.rarity.toLowerCase()} pixel logo: "${logoResult.config.text}"

✨ Rarity: ${logoResult.rarity}
🎲 Seed: ${logoResult.seed}
🔗 Recreate: ${shareUrl}

#PixelLogoForge #${logoResult.rarity}Logo`;
          
          // Farcaster embeds - build as tuple type
          let embeds: [string] | undefined = undefined;
          
          // Only add image embed if it's an HTTP URL (Farcaster prefers HTTP URLs over data URLs)
          if (castImageUrl && (castImageUrl.startsWith('http://') || castImageUrl.startsWith('https://'))) {
            embeds = [castImageUrl] as [string];
          } else if (castImageUrl && castImageUrl.startsWith('data:')) {
            // Try data URL (may not work in all clients)
            embeds = [castImageUrl] as [string];
          } else {
            embeds = undefined;
          }
          
          console.log('Calling SDK composeCast with:', {
            text: castText,
            embeds: embeds,
          });

          const result = await sdk.actions.composeCast({
            text: castText,
            embeds: embeds,
          });
          
          console.log('ComposeCast result:', result);
          
          if (result && result.cast) {
            setToast({ message: 'Logo casted! 🎉', type: 'success' });
          } else {
            setToast({ message: 'Cast cancelled', type: 'info' });
          }
          return;
        } catch (sdkError) {
          console.error('SDK cast error details:', sdkError);
          setToast({ 
            message: `Cast failed: ${sdkError instanceof Error ? sdkError.message : 'Unknown error'}. Check console for details.`, 
            type: 'error' 
          });
          throw sdkError;
        }
      } else {
        console.log('SDK not ready, using Warpcast fallback');
        // Fallback: open Warpcast compose URL
        const rarityEmoji = {
          'COMMON': '⚪',
          'RARE': '🔵',
          'EPIC': '🟣',
          'LEGENDARY': '🟠',
        }[logoResult.rarity] || '🎮';
        
        const castText = `${rarityEmoji} Forged a ${logoResult.rarity.toLowerCase()} pixel logo: "${logoResult.config.text}"

✨ Rarity: ${logoResult.rarity}
🎲 Seed: ${logoResult.seed}
🔗 Recreate: ${shareUrl}

#PixelLogoForge #${logoResult.rarity}Logo`;
        
        const warpcastUrl = castImageUrl
          ? `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(castImageUrl)}`
          : `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}`;
        window.open(warpcastUrl, '_blank');
        setToast({ message: 'Opening Warpcast to compose cast...', type: 'info' });
      }
    } catch (error) {
      console.error('Cast error:', error);
      setToast({ 
        message: `Failed to cast: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`, 
        type: 'error' 
      });
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

          // Draw gradient background
          const bgGradient = cardCtx.createLinearGradient(0, 0, cardWidth, cardHeight);
          bgGradient.addColorStop(0, '#050505');
          bgGradient.addColorStop(1, '#0c0c0c');
          cardCtx.fillStyle = bgGradient;
          cardCtx.fillRect(0, 0, cardWidth, cardHeight);

          // Subtle scanlines
          cardCtx.fillStyle = 'rgba(0, 0, 0, 0.18)';
          for (let y = 0; y < cardHeight; y += 4) {
            cardCtx.fillRect(0, y, cardWidth, 1);
          }

          // Draw border + glow
          const borderWidth = 10;
          const rarityColor = getRarityColor(logoResult.rarity);
          cardCtx.shadowColor = rarityColor;
          cardCtx.shadowBlur = 18;
          cardCtx.strokeStyle = rarityColor;
          cardCtx.lineWidth = borderWidth;
          cardCtx.strokeRect(borderWidth / 2, borderWidth / 2, cardWidth - borderWidth, cardHeight - borderWidth);
          cardCtx.shadowBlur = 0;

          // Title bar
          cardCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          cardCtx.fillRect(0, 0, cardWidth, 70);
          cardCtx.fillStyle = rarityColor;
          cardCtx.font = 'bold 22px "Press Start 2P", monospace';
          cardCtx.textAlign = 'left';
          cardCtx.textBaseline = 'middle';
          cardCtx.fillText('PIXEL LOGO FORGE', 32, 38);

          // Calculate logo size and position (bigger + centered)
          const logoPadding = 50;
          const maxLogoWidth = cardWidth - logoPadding * 2;
          const maxLogoHeight = cardHeight - logoPadding * 2 - 140;
          
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
          const logoY = 110;

          // Draw logo with a subtle glow
          cardCtx.shadowColor = 'rgba(0, 255, 0, 0.35)';
          cardCtx.shadowBlur = 12;
          cardCtx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
          cardCtx.shadowBlur = 0;

          // Draw rarity badge (top-right)
          const rarityY = 16;
          const rarityX = cardWidth - 220;
          cardCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          cardCtx.fillRect(rarityX - 10, rarityY - 8, 200, 56);
          cardCtx.strokeStyle = rarityColor;
          cardCtx.lineWidth = 4;
          cardCtx.strokeRect(rarityX - 10, rarityY - 8, 200, 56);
          
          cardCtx.fillStyle = rarityColor;
          cardCtx.font = 'bold 16px "Press Start 2P", monospace';
          cardCtx.textAlign = 'center';
          cardCtx.textBaseline = 'middle';
          cardCtx.fillText('RARITY', rarityX + 90, rarityY + 14);
          cardCtx.fillText(logoResult.rarity, rarityX + 90, rarityY + 36);

          // Draw owner info at bottom
          const ownerY = cardHeight - 70;
          const ownerText = userInfo?.username 
            ? `Generated by @${userInfo.username}`
            : userInfo?.fid 
            ? `Generated by FID ${userInfo.fid}`
            : 'Generated by Pixel Logo Forge';
          
          cardCtx.fillStyle = '#9adf9a';
          cardCtx.font = '15px "Courier New", monospace';
          cardCtx.textAlign = 'center';
          cardCtx.textBaseline = 'middle';
          cardCtx.fillText(ownerText, cardWidth / 2, ownerY);

          // Draw seed info
          cardCtx.fillStyle = '#6fae6f';
          cardCtx.font = '12px "Courier New", monospace';
          cardCtx.fillText(`Seed: ${logoResult.seed}`, cardWidth / 2, ownerY + 24);

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
      {showCastPreview && castPreviewImage && (
        <CastPreviewModal
          previewImage={castPreviewImage}
          castText={castPreviewText}
          onConfirm={handleCast}
          onCancel={() => setShowCastPreview(false)}
          isCasting={isCasting}
        />
      )}
      {showHowItWorks && (
        <div className="how-modal-overlay" role="dialog" aria-modal="true" aria-label="How it works">
          <div className="how-modal">
            <div className="how-modal-title">How it works</div>
            <div className="how-modal-body">
              <p>Each logo is generated from your text and a seed.</p>
              <p>The same text + seed always recreates the exact logo.</p>
              <p>Rarity is a random roll that unlocks extra effects.</p>
              <p>You can generate up to 3 words per day.</p>
              <p>You can enter a custom seed once per day.</p>
            </div>
            <button className="how-modal-close" onClick={() => setShowHowItWorks(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      <div className="input-section">
        <div className="daily-limit">
          Tries left today: {Math.max(0, TRIES_PER_DAY - dailyLimit.words.length)}/{TRIES_PER_DAY}
        </div>
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
          <div className="seed-label">
            <svg
              className="seed-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="6" y="2" width="4" height="2" />
              <rect x="5" y="4" width="6" height="2" />
              <rect x="4" y="6" width="8" height="2" />
              <rect x="4" y="8" width="8" height="2" />
              <rect x="5" y="10" width="6" height="2" />
              <rect x="6" y="12" width="4" height="2" />
            </svg>
            <span>Seed</span>
          </div>
          <input
            type="text"
            value={customSeed}
            onChange={(e) => {
              const value = e.target.value.trim();
              setCustomSeed(value);

              if (value === '') {
                setSeedError('');
                return;
              }

              const parsedSeed = parseInt(value, 10);
              if (isNaN(parsedSeed)) {
                setSeedError('Seed must be a number');
              } else if (parsedSeed < 0 || parsedSeed > 2147483647) {
                setSeedError('Seed must be between 0 and 2147483647');
              } else {
                setSeedError('');
              }
            }}
            placeholder="Optional: Use a seed once per day"
            className="seed-input"
            disabled={isGenerating || dailyLimit.seedUsed}
            aria-label="Optional seed input for deterministic logo generation"
            aria-invalid={seedError !== ''}
            aria-describedby={seedError ? 'seed-error' : 'seed-hint'}
          />
          {seedError ? (
            <span id="seed-error" className="seed-error" role="alert">
              {seedError}
            </span>
          ) : (
            <span id="seed-hint" className="seed-hint">
              {dailyLimit.seedUsed ? 'Seed used today — try again tomorrow' : 'One seed entry per day'}
            </span>
          )}
        </div>
        <div className="button-group">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            className="arcade-button"
            aria-label="Generate pixel logo"
            aria-busy={isGenerating ? 'true' : 'false'}
          >
            {isGenerating ? 'GENERATING...' : 'GENERATE'}
          </button>
          <button
            onClick={handleRandomize}
            disabled={isGenerating}
            className="arcade-button secondary"
            aria-label="Randomize logo"
          >
            RANDOMIZE
          </button>
        </div>
        <div className="preset-group">
          <div className="preset-title">Style presets</div>
          <div className="preset-list">
            {PRESETS.map((preset) => (
              <button
                key={preset.key}
                className={`preset-button${selectedPreset === preset.key ? ' active' : ''}`}
                onClick={() => {
                  setSelectedPreset(preset.key);
                  if (inputText.trim()) {
                    setTimeout(() => handleGenerate(), 0);
                  }
                }}
                type="button"
                aria-pressed={selectedPreset === preset.key}
              >
                {preset.label}
              </button>
            ))}
          </div>
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
              <button
                type="button"
                className="rarity-tooltip"
                aria-label="Rarity breakdown: Common 50, Rare 30, Epic 15, Legendary 5"
              >
                i
                <span className="rarity-tooltip-text">
                  Common 50% • Rare 30% • Epic 15% • Legendary 5%
                </span>
              </button>
            </div>
            <img
              key={`${logoResult.seed}-${logoResult.config.text}`}
              src={logoResult.dataUrl}
              alt={`Pixel logo: ${logoResult.config.text} with ${logoResult.rarity} rarity`}
              className="logo-image logo-image-reveal"
              role="img"
              aria-label={`Generated pixel logo for "${logoResult.config.text}" with ${logoResult.rarity} rarity`}
            />
            <div className="logo-info">
              <button
                className="how-it-works"
                type="button"
                onClick={() => setShowHowItWorks(true)}
                aria-label="How it works"
              >
                How it works
              </button>
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
                onClick={handleCopyImage} 
                className="action-button" 
                disabled={isGenerating}
                aria-label="Copy logo image"
              >
                COPY IMAGE
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
                onClick={handleCastClick} 
                className="action-button cast-button"
                disabled={isCasting || isGenerating}
                aria-label="Cast logo to Farcaster"
                aria-busy={isCasting ? 'true' : 'false'}
              >
                {isCasting ? 'CASTING...' : 'CAST THIS LOGO'}
              </button>
            </div>
          </div>
          {logoHistory.length > 0 && (
            <div className="history-strip" aria-label="Recent logos">
              <div className="history-title">Recent logos</div>
              <div className="history-list">
                {logoHistory.map((item) => (
                  <button
                    key={`${item.result.seed}-${item.result.config.text}`}
                    className="history-item"
                    onClick={() => {
                      setLogoResult(item.result);
                      setInputText(item.result.config.text);
                    }}
                    aria-label={`Load logo "${item.result.config.text}" with seed ${item.result.seed}`}
                  >
                    <img
                      src={item.result.dataUrl}
                      alt={`Recent logo: ${item.result.config.text}`}
                      className="history-image"
                    />
                    <span className="history-time">{formatHistoryTime(item.createdAt)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
