"use client";

import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  variant?: 'light' | 'dark';
}

export default function FullscreenToggle({ variant = 'light' }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error attempting to enable full-screen mode:", err);
    }
  };

  if (!mounted) return null;

  const isLight = variant === 'light';
  
  const buttonStyle = isLight 
    ? { backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }
    : {};

  const buttonClasses = isLight
    ? "flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-white/20 text-white"
    : "flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-transparent";

  return (
    <button
      onClick={toggleFullscreen}
      className={buttonClasses}
      style={buttonStyle}
      title={isFullscreen ? "تصغير الشاشة" : "تكبير الشاشة (شاشة كاملة)"}
    >
      <AnimatePresence mode="wait">
        {isFullscreen ? (
          <motion.div
            key="minimize"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Minimize className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="maximize"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Maximize className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
