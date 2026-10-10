import { PlayerProfile, CareerRole } from '../types/game';

const STORAGE_KEY = 'pixel_dungeon_codex_profile';
const SAVES_LIST_KEY = 'pixel_dungeon_codex_profiles_list';
const ACTIVE_USER_ID_KEY = 'pixel_codex_active_user_id';
const LOCAL_USERS_KEY = 'pixel_codex_local_users_registry';

export interface LocalAccount {
  id: string;
  username: string;
  email?: string;
  password?: string;
  profile: PlayerProfile;
  createdAt: string;
}

export class StorageService {
  /**
   * Generates a fresh profile for a new adventurer with 0 gems and 0 XP
   */
  static createDefaultProfile(gamerTag: string, role: CareerRole, pin = '0000'): PlayerProfile {
    return {
      id: `hero_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: `hero_${Date.now()}`,
      gamerTag: gamerTag.trim() || 'Data Knight',
      role,
      pin,
      level: 1,
      xp: 0,
      gems: 0, // Reset gems to 0!
      mana: 100,
      maxMana: 100,
      hp: 100,
      maxHp: 100,
      streak: 1,
      lastDailyDate: null,
      currentWorldId: 1,
      unlockedChapters: [1], // ONLY Chapter 1 unlocked by default
      completedLessons: [],
      completedCaseStudies: [],
      completedDailyTasks: [],
      solvedQueriesCount: 0,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Local accounts registry for GitHub Pages & offline play
   */
  static getLocalAccounts(): LocalAccount[] {
    try {
      const data = localStorage.getItem(LOCAL_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveLocalAccount(account: LocalAccount): void {
    try {
      const accounts = this.getLocalAccounts();
      const idx = accounts.findIndex(
        a => a.id === account.id || a.username.toLowerCase() === account.username.toLowerCase()
      );
      if (idx >= 0) {
        accounts[idx] = account;
      } else {
        accounts.push(account);
      }
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Failed to save local account', e);
    }
  }

  static findLocalAccount(identifier: string, password?: string): LocalAccount | null {
    const accounts = this.getLocalAccounts();
    const cleanId = identifier.trim().toLowerCase();
    const user = accounts.find(
      a => a.username.toLowerCase() === cleanId || (a.email && a.email.toLowerCase() === cleanId)
    );
    if (!user) return null;
    if (password && user.password && user.password !== password) {
      return null;
    }
    return user;
  }

  static localAccountExists(identifier: string): boolean {
    const accounts = this.getLocalAccounts();
    const cleanId = identifier.trim().toLowerCase();
    return accounts.some(
      a => a.username.toLowerCase() === cleanId || (a.email && a.email.toLowerCase() === cleanId)
    );
  }

  /**
   * Store only the active user ID for database session continuity
   */
  static setActiveUserId(userId: string): void {
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
  }

  static getActiveUserId(): string | null {
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  }

  static clearSession(): void {
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Cleans any legacy local storage cache that might have had stale gems or mocks
   */
  static cleanLegacyStorage(): void {
    // Preserved for backwards compatibility without wiping active session
  }

  /**
   * Retrieves current active profile
   */
  static getActiveProfile(): PlayerProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      // Guarantee gems is a number and not undefined
      parsed.gems = Number(parsed.gems ?? 0);
      return parsed;
    } catch (e) {
      console.error('Failed to load profile from localStorage', e);
      return null;
    }
  }

  /**
   * Saves active profile to local storage and registry
   */
  static saveActiveProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      this.updateProfileRegistry(profile);
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }

  /**
   * Update index of known profiles on this device
   */
  private static updateProfileRegistry(profile: PlayerProfile): void {
    try {
      const raw = localStorage.getItem(SAVES_LIST_KEY);
      const list: Array<{ id: string; gamerTag: string; role: string; level: number; lastSaved: string }> = raw ? JSON.parse(raw) : [];
      const index = list.findIndex(p => p.id === profile.id);
      const summary = {
        id: profile.id,
        gamerTag: profile.gamerTag,
        role: profile.role,
        level: profile.level,
        lastSaved: new Date().toISOString(),
      };
      if (index >= 0) {
        list[index] = summary;
      } else {
        list.push(summary);
      }
      localStorage.setItem(SAVES_LIST_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to update profile list', e);
    }
  }

  /**
   * Exports profile as a retro encoded Adventure Save Scroll string
   */
  static exportSaveCode(profile: PlayerProfile): string {
    const jsonStr = JSON.stringify(profile);
    // Base64 encode with codex prefix
    const b64 = btoa(encodeURIComponent(jsonStr));
    return `CODEX-SCROLL-V1-${b64}`;
  }

  /**
   * Imports an Adventure Save Scroll string and restores profile
   */
  static importSaveCode(scrollCode: string): { success: boolean; profile?: PlayerProfile; error?: string } {
    try {
      const cleaned = scrollCode.trim();
      if (!cleaned.startsWith('CODEX-SCROLL-V1-')) {
        return { success: false, error: 'Invalid Save Scroll header. Code must begin with CODEX-SCROLL-V1-' };
      }
      const b64 = cleaned.replace('CODEX-SCROLL-V1-', '');
      const jsonStr = decodeURIComponent(atob(b64));
      const parsed: PlayerProfile = JSON.parse(jsonStr);

      if (!parsed.id || !parsed.gamerTag || !Array.isArray(parsed.unlockedChapters)) {
        return { success: false, error: 'Corrupted save data structure.' };
      }

      this.saveActiveProfile(parsed);
      return { success: true, profile: parsed };
    } catch (err: any) {
      return { success: false, error: `Decryption failed: ${err.message || 'Corrupted string'}` };
    }
  }

  /**
   * Computes streak based on today's calendar date (YYYY-MM-DD)
   */
  static checkDailyStreak(profile: PlayerProfile): { updatedProfile: PlayerProfile; canClaimDaily: boolean } {
    const today = new Date().toISOString().split('T')[0];
    const clone = { ...profile };

    if (!clone.lastDailyDate) {
      return { updatedProfile: clone, canClaimDaily: true };
    }

    if (clone.lastDailyDate === today) {
      return { updatedProfile: clone, canClaimDaily: false };
    }

    const lastDate = new Date(clone.lastDailyDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      // Streak continues!
    } else if (diffDays > 1) {
      // Streak broken, resets to 1
      clone.streak = 1;
    }

    return { updatedProfile: clone, canClaimDaily: true };
  }

  /**
   * Claims daily bounty, increments streak & awards XP
   */
  static recordDailyBountyCompletion(profile: PlayerProfile, xpAward = 250): PlayerProfile {
    const today = new Date().toISOString().split('T')[0];
    const clone = { ...profile };
    clone.streak = (clone.streak || 0) + 1;
    clone.lastDailyDate = today;
    clone.xp += xpAward;
    clone.mana = Math.min(clone.maxMana, clone.mana + 40);
    if (!clone.completedDailyTasks.includes(today)) {
      clone.completedDailyTasks.push(today);
    }
    this.checkLevelUp(clone);
    this.saveActiveProfile(clone);
    return clone;
  }

  /**
   * Calculates Level from XP (each level requires Level * 350 XP)
   */
  static checkLevelUp(profile: PlayerProfile): boolean {
    let leveledUp = false;
    let requiredXp = profile.level * 350;
    while (profile.xp >= requiredXp) {
      profile.xp -= requiredXp;
      profile.level += 1;
      profile.maxHp += 20;
      profile.hp = profile.maxHp;
      profile.maxMana += 25;
      profile.mana = profile.maxMana;
      leveledUp = true;
      requiredXp = profile.level * 350;
    }
    return leveledUp;
  }

  /**
   * Clear local profile and start over
   */
  static resetLocalProgress(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
