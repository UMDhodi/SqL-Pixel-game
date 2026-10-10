import React from 'react';
import { PlayerProfile } from '../types/game';
import { Flame, Sparkles, Key, RotateCcw, Calendar, Shield, Swords } from 'lucide-react';

interface HeaderProps {
  profile: PlayerProfile;
  onOpenProfile: () => void;
  onOpenDaily: () => void;
  onResetDb: () => void;
  dailyClaimed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenProfile,
  onOpenDaily,
  onResetDb,
  dailyClaimed,
}) => {
  const xpNeeded = profile.level * 350;
  const xpPercent = Math.min(100, Math.round((profile.xp / xpNeeded) * 100));

  return (
    <header className="border-b-2 border-dungeon-border bg-dungeon-chamber px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-pixel sticky top-0 z-40">
      {/* Title & Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-dungeon-abyss border-2 border-mana-core flex items-center justify-center text-mana-core shadow-pixel-sm">
          <Swords className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base md:text-lg text-mana-core tracking-wider">
              PIXEL DUNGEON CODEX
            </span>
            <span className="bg-quest-gold text-dungeon-abyss text-[10px] font-display font-bold px-1.5 py-0.5 shadow-pixel-sm uppercase">
              16-BIT SQL
            </span>
          </div>
          <p className="text-[11px] text-parchment-rune font-code hidden sm:block">
            Analytical Dungeon Engine • Career SQL Battler
          </p>
        </div>
      </div>

      {/* Hero Stats HUD */}
      <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
        {/* Profile Card & Role */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 bg-dungeon-crypt border-2 border-dungeon-highlight hover:border-mana-core px-2.5 py-1.5 pixel-btn cursor-pointer"
          title="Click to view adventurer profile and export/import save codes"
        >
          <div className="w-6 h-6 bg-dungeon-abyss border border-quest-gold flex items-center justify-center text-quest-gold font-display text-xs font-bold">
            {profile.gamerTag.charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="text-xs font-display font-bold text-parchment-white flex items-center gap-1.5">
              <span>{profile.gamerTag}</span>
              <span className="text-[10px] text-quest-gold">LVL {profile.level}</span>
            </div>
            <div className="text-[10px] text-parchment-rune">
              {profile.role}
            </div>
          </div>
        </button>

        {/* XP Progress Bar */}
        <div className="hidden md:flex flex-col w-32">
          <div className="flex justify-between text-[10px] font-display text-parchment-rune mb-0.5">
            <span className="text-quest-gold font-bold">XP</span>
            <span>{profile.xp} / {xpNeeded}</span>
          </div>
          <div className="h-2.5 bg-dungeon-abyss border border-dungeon-highlight relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-quest-amber to-quest-gold transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Daily Streak */}
        <button
          onClick={onOpenDaily}
          className={`flex items-center gap-1.5 border-2 px-2.5 py-1.5 pixel-btn text-xs font-display font-bold ${
            dailyClaimed
              ? 'bg-dungeon-crypt border-glyph-emerald text-glyph-emerald'
              : 'bg-dungeon-crypt border-quest-gold text-quest-gold animate-bounce'
          }`}
          title="Daily SQL Bounty"
        >
          <Flame className="w-4 h-4 text-quest-amber fill-quest-amber" />
          <span>{profile.streak} DAY{profile.streak === 1 ? '' : 'S'}</span>
          {!dailyClaimed && (
            <span className="w-2 h-2 bg-mana-core animate-ping rounded-full" />
          )}
        </button>

        {/* Save / Secret Key Trigger */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1 bg-dungeon-crypt border-2 border-dungeon-highlight hover:border-mana-core text-parchment-white hover:text-mana-core px-2 py-1.5 pixel-btn text-xs font-display font-bold"
          title="Save Code & Backup"
        >
          <Key className="w-3.5 h-3.5 text-mana-core" />
          <span className="hidden lg:inline">SAVE</span>
        </button>

        {/* Reset DB to Pristine State */}
        <button
          onClick={onResetDb}
          className="flex items-center gap-1 bg-dungeon-crypt border-2 border-dungeon-highlight hover:border-glyph-crimson text-parchment-rune hover:text-glyph-crimson px-2 py-1.5 pixel-btn text-xs font-display font-bold"
          title="Reset Dungeon Database back to pristine state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">RESET DB</span>
        </button>
      </div>
    </header>
  );
};
