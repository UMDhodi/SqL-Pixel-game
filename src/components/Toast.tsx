import React, { useEffect } from 'react';
import { Lock, X, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  isOpen,
  onClose,
  duration = 3500
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92vw] sm:w-auto animate-bounce-once">
      <div className="bg-dungeon-abyss/95 border-2 border-quest-gold p-3.5 sm:px-5 sm:py-3.5 shadow-[0_0_25px_rgba(251,191,36,0.45)] pixel-btn flex items-center gap-3 backdrop-blur-sm">
        {/* Lock Graphic */}
        <div className="w-8 h-8 bg-dungeon-chamber border border-quest-gold text-quest-gold flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4 animate-pulse" />
        </div>

        {/* Message Content */}
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5 text-quest-gold font-display font-bold text-xs sm:text-sm uppercase tracking-wider">
            <span>{message}</span>
          </div>
          <p className="text-[10px] text-parchment-rune font-code pt-0.5">
            Complete all 4 curriculum phases to unlock Technical Interviews & Case Studies.
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-quest-gold p-1 transition-colors cursor-pointer shrink-0"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
