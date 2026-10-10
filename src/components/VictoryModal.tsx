import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ArrowRight, CheckCircle2, Swords } from 'lucide-react';
import { Chapter } from '../types/game';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter;
  nextChapter?: Chapter | null;
  onAdvanceChapter: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  chapter,
  nextChapter,
  onAdvanceChapter,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f2fe', '#fbbf24', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore if confetti blocked
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="bg-dungeon-chamber border-2 border-mana-core w-full max-w-md shadow-pixel-modal flex flex-col overflow-hidden text-center">
        {/* Banner */}
        <div className="bg-gradient-to-r from-mana-dark via-dungeon-crypt to-mana-dark border-b-2 border-mana-core p-4">
          <div className="w-14 h-14 mx-auto bg-dungeon-abyss border-2 border-quest-gold flex items-center justify-center text-3xl shadow-pixel mb-2">
            🏆
          </div>
          <span className="text-[10px] font-display text-quest-gold uppercase tracking-widest block">
            CHAMBER GATE UNSEALED
          </span>
          <h2 className="font-display font-bold text-lg text-mana-core mt-0.5">
            BOSS DEFEATED!
          </h2>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs font-code">
          <p className="text-parchment-white leading-relaxed italic bg-dungeon-abyss border border-dungeon-border p-3">
            "{chapter.caseStudy.boss.defeatLore}"
          </p>

          {/* Loot Rewards Box */}
          <div className="bg-dungeon-abyss border border-quest-gold p-3 space-y-2">
            <span className="text-[10px] font-display text-quest-gold uppercase block">
              🎁 CODEX REWARDS EARNED
            </span>
            <div className="flex justify-around font-display">
              <div>
                <span className="text-[10px] text-parchment-rune block">EXPERIENCE</span>
                <span className="text-sm font-bold text-quest-gold">+{chapter.caseStudy.xpReward} XP</span>
              </div>
              <div>
                <span className="text-[10px] text-parchment-rune block">MANA REFILL</span>
                <span className="text-sm font-bold text-mana-core">FULL RESTORE</span>
              </div>
            </div>
          </div>

          {nextChapter ? (
            <div className="space-y-2">
              <span className="text-[10px] font-display text-glyph-emerald block">
                🔓 PORTAL TO {nextChapter.code} IS NOW OPEN!
              </span>
              <button
                onClick={() => {
                  onAdvanceChapter();
                  onClose();
                }}
                className="w-full bg-mana-core hover:bg-mana-glow text-dungeon-abyss font-display font-bold text-xs py-2.5 pixel-btn flex items-center justify-center gap-2"
              >
                <span>ENTER {nextChapter.code}: {nextChapter.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-display text-quest-gold block">
                👑 YOU HAVE REACHED THE PINNACLE OF THE CODEX!
              </span>
              <button
                onClick={onClose}
                className="w-full bg-quest-gold text-dungeon-abyss font-display font-bold text-xs py-2 pixel-btn"
              >
                RETURN TO CHAMBER
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
