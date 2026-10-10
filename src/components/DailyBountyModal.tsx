import React from 'react';
import { DailyBounty } from '../types/game';
import { X, Flame, Calendar, Award, CheckCircle2, Play } from 'lucide-react';

interface DailyBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  bounty: DailyBounty;
  streak: number;
  isClaimed: boolean;
  onLoadBountySql: (sql: string) => void;
}

export const DailyBountyModal: React.FC<DailyBountyModalProps> = ({
  isOpen,
  onClose,
  bounty,
  streak,
  isClaimed,
  onLoadBountySql,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-dungeon-chamber border-2 border-quest-gold w-full max-w-lg shadow-pixel-modal flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-dungeon-crypt border-b-2 border-dungeon-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-quest-gold fill-quest-gold" />
            <span className="font-display font-bold text-xs uppercase text-parchment-white">
              DAILY SQL BOUNTY CHAMBER
            </span>
          </div>
          <button onClick={onClose} className="text-parchment-rune hover:text-glyph-crimson p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs font-code">
          {/* Streak Banner */}
          <div className="bg-dungeon-abyss border-2 border-dungeon-highlight p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-dungeon-crypt border border-quest-gold flex items-center justify-center text-xl">
                🔥
              </div>
              <div>
                <span className="text-[10px] font-display text-parchment-rune uppercase">
                  ACTIVE ADVENTURE STREAK
                </span>
                <div className="font-display font-bold text-sm text-quest-gold">
                  {streak} CONSECUTIVE DAY{streak === 1 ? '' : 'S'}
                </div>
              </div>
            </div>

            <div>
              {isClaimed ? (
                <span className="bg-glyph-emerald/20 text-glyph-emerald border border-glyph-emerald px-2 py-1 text-[10px] font-display font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  CLAIMED TODAY
                </span>
              ) : (
                <span className="bg-quest-gold/20 text-quest-gold border border-quest-gold px-2 py-1 text-[10px] font-display font-bold">
                  UNRESOLVED
                </span>
              )}
            </div>
          </div>

          {/* Today's Bounty Details */}
          <div className="space-y-2 bg-dungeon-abyss border border-dungeon-border p-3">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-xs text-mana-core uppercase">
                {bounty.title}
              </span>
              <span className="text-[10px] font-display text-quest-gold">
                +{bounty.xpReward} XP
              </span>
            </div>

            <p className="text-parchment-rune leading-relaxed">
              {bounty.scenario}
            </p>

            <div className="bg-dungeon-chamber border border-dungeon-border p-2">
              <span className="text-[10px] font-display text-glyph-emerald block uppercase mb-1">
                🎯 Target Objective:
              </span>
              <p className="text-parchment-white font-code">
                {bounty.objective}
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={() => {
                onLoadBountySql(bounty.starterSql);
                onClose();
              }}
              className="w-full bg-mana-core text-dungeon-abyss font-display font-bold text-xs py-2.5 pixel-btn hover:bg-mana-glow flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>LOAD BOUNTY QUERY INTO TERMINAL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
