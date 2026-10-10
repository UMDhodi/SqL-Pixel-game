import React, { useState } from 'react';
import { PlayerProfile } from '../types/game';
import { ApiService } from '../services/apiService';
import { StorageService } from '../services/storageService';
import { X, Key, Check, LogOut, Zap, Flame, Gem, Swords, Shield, Pencil, Lock, Loader2 } from 'lucide-react';

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
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Level & EXP stats calculation
  const currentLvl = profile.level || 1;
  const currentXp = profile.xp || 0;
  const xpNeeded = currentLvl * 350;
  const xpPercent = Math.min(100, Math.round((currentXp / xpNeeded) * 100));

  const handleSaveGamerTag = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTag = tag.trim();
    if (!cleanTag) {
      setErrorMsg('Gamer tag cannot be blank.');
      return;
    }
    if (cleanTag === profile.gamerTag) {
      setIsEditingTag(false);
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      const success = await ApiService.updateUserProfile(profile.id || profile.userId, {
        gamerTag: cleanTag,
        role: profile.role,
      });

      if (success) {
        const updated: PlayerProfile = {
          ...profile,
          gamerTag: cleanTag,
        };
        onProfileUpdated(updated);
        StorageService.saveActiveProfile(updated);
        setIsEditingTag(false);
        setSaveSuccessMsg('Gamer Tag saved to database!');
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      } else {
        setErrorMsg('Failed to update Gamer Tag in database.');
      }
    } catch {
      setErrorMsg('Network error updating Gamer Tag.');
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
            className="text-parchment-rune hover:text-glyph-crimson p-1 transition-colors cursor-pointer"
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

          {errorMsg && (
            <div className="p-2.5 bg-glyph-crimson/20 border border-glyph-crimson text-glyph-crimson font-display text-xs flex items-center gap-2">
              <X className="w-4 h-4" />
              <span>{errorMsg}</span>
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

          {/* 2. ADVENTURER IDENTITY SETTINGS */}
          <div className="space-y-3.5 bg-dungeon-abyss border border-dungeon-border p-3.5">
            <div className="font-display font-bold text-xs text-mana-core uppercase flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>ADVENTURER IDENTITY SETTINGS</span>
            </div>

            {/* GAMER TAG / CHARACTER NAME WITH EDIT FUNCTION */}
            <div>
              <label className="block text-[11px] text-parchment-rune mb-1.5 font-display flex items-center justify-between">
                <span>GAMER TAG / CHARACTER NAME:</span>
                {isEditingTag && (
                  <span className="text-[10px] text-quest-gold font-bold">EDITING</span>
                )}
              </label>

              {!isEditingTag ? (
                /* Read-only view with Edit Button */
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-dungeon-chamber border border-dungeon-highlight p-2.5 text-xs text-parchment-white font-display font-bold flex items-center justify-between">
                    <span>{profile.gamerTag}</span>
                    <span className="text-[10px] text-mana-core font-code font-normal">SAVED</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTag(profile.gamerTag);
                      setIsEditingTag(true);
                      setErrorMsg('');
                    }}
                    className="bg-mana-core/20 hover:bg-mana-core hover:text-dungeon-abyss text-mana-core border border-mana-core px-3 py-2 text-xs font-display font-bold pixel-btn transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>EDIT</span>
                  </button>
                </div>
              ) : (
                /* Editable mode with Save & Cancel Buttons */
                <form onSubmit={handleSaveGamerTag} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="Enter new gamer tag..."
                      className="flex-1 bg-dungeon-chamber border-2 border-mana-core text-parchment-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-mana-glow font-display font-bold"
                      autoFocus
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSaving || !tag.trim()}
                      className="bg-mana-core hover:bg-mana-glow text-dungeon-abyss font-display font-bold text-xs px-3.5 py-2 pixel-btn transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-pixel"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>SAVING...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>SAVE</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        setTag(profile.gamerTag);
                        setIsEditingTag(false);
                        setErrorMsg('');
                      }}
                      className="bg-dungeon-abyss border border-dungeon-border text-parchment-rune hover:text-parchment-white px-2.5 py-2 text-xs font-display pixel-btn transition-colors cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* CAREER CLASS (LOCKED / READ-ONLY) */}
            <div>
              <label className="block text-[11px] text-parchment-rune mb-1.5 font-display flex items-center justify-between">
                <span>CAREER CLASS:</span>
                <span className="text-[10px] text-neutral-500 font-display flex items-center gap-1">
                  <Lock className="w-3 h-3 text-neutral-500" />
                  CANNOT BE EDITED
                </span>
              </label>
              <div className="w-full bg-dungeon-chamber/60 border border-dungeon-highlight/60 text-parchment-white p-2.5 text-xs flex items-center justify-between cursor-not-allowed select-none">
                <span className="font-display font-bold text-quest-gold">{profile.role}</span>
                <span className="text-[10px] bg-dungeon-abyss border border-neutral-800 text-neutral-400 font-display px-2 py-0.5 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-neutral-500" />
                  CLASS LOCKED
                </span>
              </div>
            </div>
          </div>

          {/* 3. LOGOUT BUTTON SECTION */}
          <div className="pt-2 border-t border-dungeon-border flex items-center justify-between">
            <span className="text-[11px] text-parchment-rune font-display">
              End session & sign out?
            </span>
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="bg-glyph-crimson/20 border border-glyph-crimson text-glyph-crimson hover:bg-glyph-crimson hover:text-white px-3 py-1.5 font-display font-bold text-xs pixel-btn flex items-center gap-1.5 transition-colors cursor-pointer"
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
