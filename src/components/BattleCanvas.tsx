import React, { useEffect, useState } from 'react';
import { BossMonster } from '../types/game';
import { Skull, Sparkles, Zap, Shield, Heart } from 'lucide-react';

interface BattleCanvasProps {
  boss: BossMonster;
  bossCurrentHp: number;
  heroHp: number;
  heroMana: number;
  heroMaxMana: number;
  isCasting: boolean;
  lastActionResult?: {
    success: boolean;
    damage: number;
    message: string;
  } | null;
}

export const BattleCanvas: React.FC<BattleCanvasProps> = ({
  boss,
  bossCurrentHp,
  heroHp,
  heroMana,
  heroMaxMana,
  isCasting,
  lastActionResult,
}) => {
  const [floatingText, setFloatingText] = useState<{ id: number; text: string; color: string }[]>([]);
  const [bossShake, setBossShake] = useState(false);
  const [heroSpellAnim, setHeroSpellAnim] = useState(false);

  // Trigger battle animation whenever an action occurs
  useEffect(() => {
    if (!lastActionResult) return;

    if (lastActionResult.success) {
      setHeroSpellAnim(true);
      setBossShake(true);

      const id = Date.now();
      setFloatingText(prev => [
        ...prev,
        {
          id,
          text: `-${lastActionResult.damage} HP (CRITICAL STRIKE!)`,
          color: 'text-mana-core',
        },
      ]);

      const timer = setTimeout(() => {
        setBossShake(false);
        setHeroSpellAnim(false);
        setFloatingText(prev => prev.filter(item => item.id !== id));
      }, 1600);
      return () => clearTimeout(timer);
    } else {
      const id = Date.now();
      setFloatingText(prev => [
        ...prev,
        {
          id,
          text: 'SPELL FIZZLED!',
          color: 'text-glyph-crimson',
        },
      ]);
      const timer = setTimeout(() => {
        setFloatingText(prev => prev.filter(item => item.id !== id));
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [lastActionResult]);

  // Compute segmented ticks for Boss HP
  const hpPercent = Math.max(0, Math.min(100, Math.round((bossCurrentHp / boss.maxHp) * 100)));
  const totalTicks = 20;
  const activeTicks = Math.round((hpPercent / 100) * totalTicks);

  return (
    <div className="relative bg-dungeon-abyss border-2 border-dungeon-border p-3 sm:p-4 shadow-pixel overflow-hidden">
      {/* Background CRT scanlines effect */}
      <div className="absolute inset-0 crt-overlay opacity-50 pointer-events-none" />

      {/* Floating Damage Text */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
        {floatingText.map(ft => (
          <div
            key={ft.id}
            className={`font-display font-bold text-sm sm:text-base ${ft.color} animate-bounce bg-dungeon-abyss/90 px-3 py-1 border-2 border-current shadow-pixel-sm tracking-wider`}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* Top Header: Encounter Title */}
      <div className="flex items-center justify-between border-b border-dungeon-border pb-2 mb-3 text-xs font-display">
        <div className="flex items-center gap-2 text-quest-gold">
          <Zap className="w-3.5 h-3.5 fill-quest-gold" />
          <span className="tracking-wider uppercase">BATTLE STAGE: CHAMBER ENCOUNTER</span>
        </div>
        <div className="text-parchment-rune text-[11px] hidden sm:block">
          WEAKNESS: <span className="text-mana-core font-bold">{boss.weaknessSql}</span>
        </div>
      </div>

      {/* Arena Stage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center min-h-[140px] relative z-10">
        {/* Left Side: Hero Battler */}
        <div className="flex items-center space-x-3 bg-dungeon-chamber/60 border border-dungeon-highlight p-2.5">
          {/* Hero Pixel Sprite */}
          <div className="relative">
            <div
              className={`w-14 h-14 bg-dungeon-crypt border-2 border-mana-core flex items-center justify-center text-2xl shadow-pixel ${
                heroSpellAnim ? 'scale-110 border-quest-gold' : 'animate-bob'
              }`}
            >
              🧙‍♂️
            </div>
            {heroSpellAnim && (
              <div className="absolute -top-1 -right-1 text-mana-core animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs font-display font-bold mb-1">
              <span className="text-parchment-white">DATA ARCHMAGE</span>
              <span className="text-mana-core text-[10px]">HP: {heroHp}/100</span>
            </div>

            {/* Hero Mana Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-parchment-rune">
                <span>MANA CORE</span>
                <span>{heroMana}/{heroMaxMana}</span>
              </div>
              <div className="h-2 bg-dungeon-abyss border border-dungeon-highlight overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-mana-dark to-mana-core transition-all duration-300"
                  style={{ width: `${Math.min(100, (heroMana / heroMaxMana) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Boss Monster */}
        <div
          className={`flex items-center space-x-3 bg-dungeon-chamber/60 border border-dungeon-highlight p-2.5 ${
            bossShake ? 'animate-ping border-glyph-crimson' : ''
          }`}
        >
          <div className="flex-1 min-w-0 text-right sm:text-left order-2 sm:order-1">
            <div className="flex items-center justify-between text-xs font-display font-bold mb-1">
              <span className="text-glyph-crimson truncate">{boss.name}</span>
              <span className="text-xs text-parchment-rune">{bossCurrentHp}/{boss.maxHp} HP</span>
            </div>

            {/* Segmented Pixel Boss HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-parchment-rune">
                <span className="text-[10px] text-glyph-crimson font-bold uppercase">{boss.title}</span>
                <span>{hpPercent}%</span>
              </div>

              {/* Segmented Ticks Container */}
              <div className="h-3 bg-dungeon-abyss border-2 border-dungeon-highlight p-0.5 flex gap-0.5">
                {Array.from({ length: totalTicks }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-full transition-colors duration-200 ${
                      i < activeTicks ? 'bg-glyph-crimson shadow-pixel-sm' : 'bg-dungeon-crypt opacity-40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Boss Pixel Sprite */}
          <div className="order-1 sm:order-2">
            <div
              className={`w-14 h-14 bg-dungeon-crypt border-2 border-glyph-crimson flex items-center justify-center text-3xl shadow-pixel ${
                bossShake ? 'bg-glyph-crimson/30' : 'animate-bob'
              }`}
            >
              {boss.avatarType === 'slime' && '🟢'}
              {boss.avatarType === 'goblin' && '👺'}
              {boss.avatarType === 'lich' && '💀'}
              {boss.avatarType === 'hydra' && '🐉'}
              {boss.avatarType === 'dragon' && '🐲'}
            </div>
          </div>
        </div>
      </div>

      {/* Battle Status Dialogue Strip */}
      <div className="mt-2.5 bg-dungeon-chamber border border-dungeon-border px-3 py-1.5 flex items-center justify-between text-[11px] font-code">
        <div className="flex items-center gap-2 truncate">
          <span className="text-mana-core font-display font-bold">&gt;</span>
          <span className="text-parchment-rune truncate">
            {isCasting
              ? 'Chanting analytical incantation across Web Worker...'
              : lastActionResult
              ? lastActionResult.message
              : `The chamber echoes with ancient data. Craft your SQL query to deal damage!`}
          </span>
        </div>
        <div className="text-[10px] font-display text-quest-gold uppercase ml-2 whitespace-nowrap">
          {bossCurrentHp <= 0 ? 'SEAL BROKEN!' : 'HOSTILE ACTIVE'}
        </div>
      </div>
    </div>
  );
};
