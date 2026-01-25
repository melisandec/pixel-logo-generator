import { useState, useCallback } from "react";

interface UserInfo {
  fid?: number;
  username?: string;
}

/**
 * Manages Farcaster SDK state:
 * - SDK readiness
 * - User info (FID, username)
 * - Mini-app added status
 * - Cast preview modal visibility
 * - Casting target and draft text
 */
export function useFarcasterSDK() {
  const [sdkReady, setSdkReady] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [miniappAdded, setMiniappAdded] = useState(false);
  const [showCastPreview, setShowCastPreview] = useState(false);
  const [castPreviewImage, setCastPreviewImage] = useState<string | null>(null);
  const [castPreviewText, setCastPreviewText] = useState<string>("");
  const [castDraftText, setCastDraftText] = useState<string>("");
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [includeCastOverlays, setIncludeCastOverlays] = useState(true);

  const setUserSignedIn = useCallback((fid: number, username: string) => {
    setUserInfo({ fid, username });
  }, []);

  const setUserSignedOut = useCallback(() => {
    setUserInfo(null);
  }, []);

  const toggleAutoReply = useCallback(() => {
    setAutoReplyEnabled((prev) => {
      localStorage.setItem("plf:autoReplyEnabled", JSON.stringify(!prev));
      return !prev;
    });
  }, []);

  const openCastPreview = useCallback((image: string, text: string) => {
    setCastPreviewImage(image);
    setCastPreviewText(text);
    setShowCastPreview(true);
  }, []);

  const closeCastPreview = useCallback(() => {
    setShowCastPreview(false);
  }, []);

  return {
    sdkReady,
    setSdkReady,
    userInfo,
    setUserSignedIn,
    setUserSignedOut,
    miniappAdded,
    setMiniappAdded,
    showCastPreview,
    openCastPreview,
    closeCastPreview,
    castPreviewImage,
    setCastPreviewImage,
    castPreviewText,
    setCastPreviewText,
    castDraftText,
    setCastDraftText,
    autoReplyEnabled,
    toggleAutoReply,
    includeCastOverlays,
    setIncludeCastOverlays,
  };
}
