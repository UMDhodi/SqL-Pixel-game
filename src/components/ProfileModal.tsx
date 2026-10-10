import React, { useState } from 'react';
import { PlayerProfile, CareerRole } from '../types/game';
import { ApiService } from '../services/apiService';
import { X, Key, Check, LogOut, Zap, Flame, Gem, Swords, Shield } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onProfileUpdated: (updated: PlayerProfile) => void;
  onLogout: () => void;
  onResetProgress?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [tag, setTag] = useState(profile.gamerTag);
  const [role, setRole] = useState<CareerRole>(profile.role);
  const [pin, setPin] = useState(profile.pin);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Level & EXP stats calculation
  const currentLvl = profile.level || 1;
  const currentXp = profile.xp || 0;
  const xpNeeded = currentLvl * 350;
  const xpPercent = Math.min(100, Math.round((currentXp / xpNeeded) * 100));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = {
      ...profile,
      gamerTag: tag.trim() || 'Data Knight',
      role,
      pin: pin.trim() || '0000',
    };
    try {
      await ApiService.updateUserProfile(profile.id || profile.userId, {
        gamerTag: updated.gamerTag,
        role: updated.role,
        pin: updated.pin,
      });
      onProfileUpdated(updated);
      setSaveSuccessMsg('Profile saved to database!');
      setTimeout(() => setSaveSuccessMsg(''), 2500);
    } catch {
      setSaveSuccessMsg('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = () => {
    if (window.confirm('Are you sure you want to log out from SQL Quest?')) {
      onLogout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-dungeon-chamber border-2 border-mana-core w-full max-w-lg shadow-pixel-modal max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-dungeon-crypt border-b-2 border-dungeon-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-mana-core" />
            <span className="font-display font-bold text-sm text-parchment-white uppercase">
              ADVENTURER CODEX PROFILE
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-parchment-rune hover:text-glyph-crimson p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs font-code">
          {saveSuccessMsg && (
            <div className="p-2.5 bg-glyph-emerald/20 border border-glyph-emerald text-glyph-emerald font-display text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* 1. EXP & LEVEL HUD CARD */}
          <div className="bg-dungeon-abyss border-2 border-dungeon-border p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-mana-core/20 border-2 border-mana-core flex items-center justify-center text-mana-core font-display font-black text-base">
                  {currentLvl}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-sm text-parchment-white">
                      LEVEL {currentLvl}
                    </span>
                    <span className="bg-quest-gold text-dungeon-abyss text-[9px] font-display font-bold px-1.5 py-0.5">
                      {profile.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-parchment-rune font-display">
                    {profile.gamerTag}
                  </span>
                </div>
              </div>

              {/* Total XP Badge */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-quest-gold font-display font-bold text-sm">
                  <Zap className="w-4 h-4 fill-quest-gold" />
                  <span>{currentXp.toLocaleString()} XP</span>
                </div>
                <span className="text-[10px] text-parchment-rune">TOTAL EXPERIENCE</span>
              </div>
            </div>

            {/* EXP Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-display">
                <span className="text-mana-core font-bold">EXP PROGRESS</span>
                <span className="text-parchment-rune">
                  {currentXp} / {xpNeeded} XP ({xpPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-dungeon-chamber border border-dungeon-highlight overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-mana-core to-mana-glow transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-dungeon-highlight/50 text-center font-display">
              <div className="bg-dungeon-chamber/60 border border-dungeon-highlight p-2">
                <div className="flex items-center justify-center gap-1 text-quest-gold text-xs font-bold">
                  <Gem className="w-3.5 h-3.5 fill-quest-gold" />
                  <span>{profile.gems ?? 0}</span>
                </div>
                <span className="text-[9px] text-parchment-rune block mt-0.5">GEMS</span>
              </div>

              <div className="bg-dungeon-chamber/60 border border-dungeon-highlight p-2">
                <div className="flex items-center justify-center gap-1 text-mana-glow text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-mana-glow" />
                  <span>{profile.streak ?? 1} DAYS</span>
                </div>
                <span className="text-[9px] text-parchment-rune block mt-0.5">STREAK</span>
              </div>

              <div className="bg-dungeon-chamber/60 border border-dungeon-highlight p-2">
                <div className="flex items-center justify-center gap-1 text-glyph-emerald text-xs font-bold">
                  <Swords className="w-3.5 h-3.5" />
                  <span>{profile.completedLessons?.length ?? 0}</span>
                </div>
                <span className="text-[9px] text-parchment-rune block mt-0.5">QUESTS WON</span>
              </div>
            </div>
          </div>

          {/* 2. Form: Profile Edit */}
          <form onSubmit={handleSaveProfile} className="space-y-3 bg-dungeon-abyss border border-dungeon-border p-3.5">
            <div className="font-display font-bold text-xs text-mana-core uppercase flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>Adventurer Identity Settings</span>
            </div>

            <div>
              <label className="block text-[11px] text-parchment-rune mb-1 font-display">
                GAMER TAG / CHARACTER NAME:
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-dungeon-chamber border border-dungeon-highlight focus:border-mana-core text-parchment-white p-2 text-xs focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-parchment-rune mb-1 font-display">
                  CAREER CLASS:
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as CareerRole)}
                  className="w-full bg-dungeon-chamber border border-dungeon-highlight focus:border-mana-core text-parchment-white p-2 text-xs focus:outline-none"
                >
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Analytics Engineer">Analytics Engineer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-parchment-rune mb-1 font-display">
                  VAULT PIN (LOCAL KEY):
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-dungeon-chamber border border-dungeon-highlight focus:border-mana-core text-parchment-white p-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-mana-core text-dungeon-abyss font-display font-bold text-xs py-2 pixel-btn hover:bg-mana-glow transition-colors mt-2"
            >
              {isSaving ? 'SAVING...' : 'SAVE PROFILE'}
            </button>
          </form>

          {/* 3. LOGOUT BUTTON SECTION */}
          <div className="pt-2 border-t border-dungeon-border flex items-center justify-between">
            <span className="text-[11px] text-parchment-rune font-display">
              End session & sign out?
            </span>
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="bg-glyph-crimson/20 border border-glyph-crimson text-glyph-crimson hover:bg-glyph-crimson hover:text-white px-3 py-1.5 font-display font-bold text-xs pixel-btn flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
