import { PlayerProfile } from '../types/game';
import { StorageService } from './storageService';
import { sqlEngine } from '../engine/sqlEngine';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

export interface ExecuteQueryResponse {
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  lessonPassed?: boolean;
  feedbackMessage?: string;
  updatedProgress?: any;
  error?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  gamerTag: string;
  role: string;
  level: number;
  xp: number;
  gems: number;
  streak: number;
  solvedQueriesCount: number;
  completedQuestsCount: number;
}

// Safely attempts to read JSON response; returns null if non-JSON (e.g. static 404 HTML)
async function parseSafeJson(res: Response): Promise<any | null> {
  try {
    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      return null;
    }
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export class ApiService {
  /**
   * Health check - seamlessly detects live PostgreSQL server or falls back to in-browser engine
   */
  static async checkHealth(): Promise<{ status: string; db: string; version: string; isLiveDb: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const json = await parseSafeJson(res);
        if (json && json.status === 'connected') {
          return { status: 'connected', db: json.db || 'PostgreSQL 17', version: json.version || 'Neon Cloud', isLiveDb: true };
        }
      }
    } catch {
      // Backend not running / static host
    }
    return { status: 'connected', db: 'In-Browser PG17', version: 'AlaSQL Engine', isLiveDb: false };
  }

  /**
   * Check username availability
   */
  static async checkUsernameAvailability(username: string): Promise<{
    available: boolean;
    exists: boolean;
    latencyMs: number;
    bitPositions?: number[];
    arrayBitsCount?: number;
    method?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/auth/check-username?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const json = await parseSafeJson(res);
        if (json) return json;
      }
    } catch {
      // Offline fallback
    }

    const existsLocally = StorageService.localAccountExists(username);
    return { available: !existsLocally, exists: existsLocally, latencyMs: 2, method: 'Browser Storage Filter' };
  }

  /**
   * Sign Up - Registers into PostgreSQL if backend available, otherwise stores in local persistent account registry
   */
  static async signUp(data: {
    username: string;
    email?: string;
    password?: string;
    role?: string;
    gamerTag?: string;
  }): Promise<{ success: boolean; user?: PlayerProfile; error?: string; alreadyExists?: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await parseSafeJson(res);
      if (json) {
        if (!res.ok) {
          return { success: false, error: json.error || 'Failed to sign up', alreadyExists: json.alreadyExists || false };
        }
        if (json.user) {
          StorageService.saveActiveProfile(json.user);
          StorageService.setActiveUserId(json.user.id || json.user.userId);
        }
        return { success: true, user: json.user };
      }
    } catch {
      // Fallback below
    }

    // Seamless in-browser fallback
    if (StorageService.localAccountExists(data.username)) {
      return { success: false, error: 'Username or email already registered. Please Sign In.', alreadyExists: true };
    }

    const localProfile = StorageService.createDefaultProfile(
      data.gamerTag || data.username,
      (data.role as any) || 'Data Analyst'
    );

    StorageService.saveLocalAccount({
      id: localProfile.id,
      username: data.username,
      email: data.email,
      password: data.password,
      profile: localProfile,
      createdAt: new Date().toISOString(),
    });
    StorageService.saveActiveProfile(localProfile);
    StorageService.setActiveUserId(localProfile.id);

    return { success: true, user: localProfile };
  }

  /**
   * Sign In - Authenticates with PostgreSQL if online, or authenticates/provisions locally
   */
  static async signIn(identifier: string, password?: string): Promise<{ success: boolean; user?: PlayerProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, username: identifier, password }),
      });

      const json = await parseSafeJson(res);
      if (json) {
        if (!res.ok) {
          return { success: false, error: json.error || 'Failed to sign in' };
        }
        if (json.user) {
          StorageService.saveActiveProfile(json.user);
          StorageService.setActiveUserId(json.user.id || json.user.userId);
        }
        return { success: true, user: json.user };
      }
    } catch {
      // Fallback below
    }

    // Seamless in-browser authentication
    const existing = StorageService.findLocalAccount(identifier, password);
    if (existing) {
      StorageService.saveActiveProfile(existing.profile);
      return { success: true, user: existing.profile };
    }

    // If identifier exists with different password
    if (StorageService.localAccountExists(identifier)) {
      return { success: false, error: 'Incorrect credentials for this account.' };
    }

    // Auto-provision fresh hero profile for frictionless user experience
    const newProfile = StorageService.createDefaultProfile(identifier, 'Data Analyst');
    StorageService.saveLocalAccount({
      id: newProfile.id,
      username: identifier,
      password,
      profile: newProfile,
      createdAt: new Date().toISOString(),
    });
    StorageService.saveActiveProfile(newProfile);

    return { success: true, user: newProfile };
  }

  /**
   * Get User Progress
   */
  static async getProgress(userId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/progress/${userId}`);
      if (res.ok) {
        const json = await parseSafeJson(res);
        if (json) return json;
      }
    } catch {}

    const profile = StorageService.getActiveProfile();
    return profile || null;
  }

  /**
   * Execute Query - runs against live backend if available, or in-browser SQL engine
   */
  static async executeQuery(
    sql: string,
    userId?: string,
    lessonId?: string,
    chapterId?: number
  ): Promise<ExecuteQueryResponse> {
    try {
      const res = await fetch(`${API_BASE}/query/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, userId, lessonId, chapterId }),
      });

      const json = await parseSafeJson(res);
      if (json && res.ok) {
        return json;
      }
    } catch {}

    // Fallback to embedded AlaSQL database engine
    const localRes = sqlEngine.executeQuery(sql);
    return {
      success: localRes.success,
      columns: localRes.columns,
      rows: localRes.rows,
      rowCount: localRes.rowCount,
      executionTimeMs: localRes.executionTimeMs,
      error: localRes.error,
    };
  }

  /**
   * Fetch user profile
   */
  static async getUserProfile(userId: string): Promise<PlayerProfile | null> {
    try {
      const res = await fetch(`${API_BASE}/user/${userId}`);
      if (res.ok) {
        const json = await parseSafeJson(res);
        if (json && json.user) {
          StorageService.saveActiveProfile(json.user);
          return json.user;
        }
      }
    } catch {}

    const local = StorageService.getActiveProfile();
    if (local && (local.id === userId || local.userId === userId)) {
      return local;
    }
    return local;
  }

  /**
   * Reset user progress
   */
  static async resetUserProgress(userId: string): Promise<{ success: boolean; user?: PlayerProfile; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/user/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const json = await parseSafeJson(res);
      if (json && res.ok) {
        return { success: true, user: json.user, message: json.message };
      }
    } catch {}

    const current = StorageService.getActiveProfile();
    const fresh = StorageService.createDefaultProfile(current ? current.gamerTag : 'Adventurer', current ? current.role : 'Data Analyst');
    StorageService.saveActiveProfile(fresh);
    return { success: true, user: fresh, message: 'All progress reset to 0.' };
  }

  /**
   * Update Profile
   */
  static async updateUserProfile(userId: string, data: { gamerTag?: string; role?: string; pin?: string }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return true;
    } catch {}

    const profile = StorageService.getActiveProfile();
    if (profile) {
      if (data.gamerTag) profile.gamerTag = data.gamerTag;
      if (data.role) profile.role = data.role as any;
      if (data.pin) profile.pin = data.pin;
      StorageService.saveActiveProfile(profile);
      return true;
    }
    return false;
  }

  /**
   * Claim Daily Bounty
   */
  static async claimDailyBounty(userId: string): Promise<{ success: boolean; streak?: number; xp?: number; gems?: number }> {
    try {
      const res = await fetch(`${API_BASE}/user/daily-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await parseSafeJson(res);
      if (json && res.ok) return json;
    } catch {}

    const profile = StorageService.getActiveProfile();
    if (profile) {
      const updated = StorageService.recordDailyBountyCompletion(profile);
      return { success: true, streak: updated.streak, xp: updated.xp, gems: updated.gems };
    }
    return { success: false };
  }

  /**
   * Fetch Schema
   */
  static async getLiveSchema(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/schema`);
      if (res.ok) {
        const json = await parseSafeJson(res);
        if (json && json.schemas) return json.schemas;
      }
    } catch {}

    return sqlEngine.getSchemas();
  }

  /**
   * Fetch Leaderboard
   */
  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const res = await fetch(`${API_BASE}/leaderboard`);
      if (res.ok) {
        const json = await parseSafeJson(res);
        if (json && json.leaderboard) return json.leaderboard;
      }
    } catch {}

    const localProfile = StorageService.getActiveProfile();
    if (!localProfile) return [];
    return [
      {
        rank: 1,
        id: localProfile.id || 'player-1',
        username: localProfile.gamerTag || 'Adventurer',
        gamerTag: localProfile.gamerTag || 'Adventurer',
        role: localProfile.role || 'Data Analyst',
        level: Number(localProfile.level) || 1,
        xp: Number(localProfile.xp) || 0,
        gems: Number(localProfile.gems) || 0,
        streak: Number(localProfile.streak) || 1,
        solvedQueriesCount: Number(localProfile.solvedQueriesCount) || 0,
        completedQuestsCount: (localProfile.completedLessons || []).length,
      },
    ];
  }
}
