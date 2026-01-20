"use client";

import { useState, useRef, useEffect } from "react";
import NextImage from "next/image";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = "",
  sizes,
  priority = false,
  onLoad,
  placeholder = "empty",
  blurDataURL,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return; // Skip intersection observer if priority

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before visible
        threshold: 0.01,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isVisible ? (
        <>
          <NextImage
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            onLoad={handleLoad}
            className={`transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {!isLoaded && (
            <div className="absolute inset-0 bg-[#0a0e27] animate-pulse flex items-center justify-center">
              <div className="text-[#00ff00] font-mono text-xs">Loading...</div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-[#0a0e27] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#00ff00] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
