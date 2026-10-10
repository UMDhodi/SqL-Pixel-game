import React, { useState } from 'react';
import { HintTier } from '../types/game';
import { X, Lightbulb, Lock, Unlock, Eye, Sparkles } from 'lucide-react';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hints: HintTier[];
  onApplySolution?: (sql: string) => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  hints,
  onApplySolution,
}) => {
  if (!isOpen || !hints || hints.length === 0) return null;

  const [revealedTiers, setRevealedTiers] = useState<number[]>([1]); // Tier 1 unlocked by default

  const toggleReveal = (tier: number) => {
    if (revealedTiers.includes(tier)) return;
    setRevealedTiers(prev => [...prev, tier]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-dungeon-chamber border-2 border-quest-gold w-full max-w-md shadow-pixel-modal flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-dungeon-crypt border-b-2 border-dungeon-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-quest-gold" />
            <span className="font-display font-bold text-xs uppercase text-parchment-white">
              THE ORACLE'S GRIMOIRE HINTS
            </span>
          </div>
          <button onClick={onClose} className="text-parchment-rune hover:text-glyph-crimson p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          <p className="text-xs text-parchment-rune leading-relaxed">
            The Oracle offers 3 tiers of enlightenment. Deeper tiers reveal direct syntax scaffolding but deduct small XP tithes from your victory reward.
          </p>

          <div className="space-y-3">
            {hints.map(hint => {
              const isRevealed = revealedTiers.includes(hint.tier);

              return (
                <div
                  key={hint.tier}
                  className={`border-2 p-3 ${
                    isRevealed
                      ? 'bg-dungeon-abyss border-dungeon-highlight'
                      : 'bg-dungeon-crypt/50 border-dungeon-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-xs text-quest-gold">
                        TIER {hint.tier}: {hint.title}
                      </span>
                    </div>
                    {hint.xpPenalty > 0 && (
                      <span className="text-[10px] text-glyph-crimson font-display">
                        -{hint.xpPenalty} XP PENALTY
                      </span>
                    )}
                  </div>

                  {isRevealed ? (
                    <div>
                      <p className="text-xs text-parchment-white font-code bg-dungeon-chamber p-2 border border-dungeon-border whitespace-pre-wrap">
                        {hint.content}
                      </p>
                      {hint.tier === 3 && onApplySolution && (
                        <button
                          onClick={() => {
                            onApplySolution(hint.content);
                            onClose();
                          }}
                          className="mt-2 text-[11px] bg-mana-core text-dungeon-abyss font-display font-bold px-3 py-1 pixel-btn hover:bg-mana-glow"
                        >
                          COPY DIRECTLY TO TERMINAL
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleReveal(hint.tier)}
                      className="w-full bg-dungeon-chamber hover:bg-dungeon-crypt border border-quest-gold text-quest-gold py-1.5 px-3 text-xs font-display font-bold pixel-btn flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>REVEAL TIER {hint.tier} HINT</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
