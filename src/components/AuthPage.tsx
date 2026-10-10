import React, { useState, useEffect } from 'react';
import { PlayerProfile, CareerRole } from '../types/game';
import { ApiService } from '../services/apiService';
import { StorageService } from '../services/storageService';
import {
  Swords, Lock, User, Mail, UserPlus, LogIn,
  Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2, Zap, Wifi, WifiOff
} from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (profile: PlayerProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [role, setRole] = useState<CareerRole>('Data Analyst');

  // Database engine state
  const [isLiveDb, setIsLiveDb] = useState<boolean>(false);

  // Username availability check state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
  }>({ checking: false });

  const [errorMsg, setErrorMsg] = useState('');
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);

  // Periodic health check for PostgreSQL backend / Browser engine
  useEffect(() => {
    let isMounted = true;
    const checkServer = () => {
      ApiService.checkHealth().then(res => {
        if (!isMounted) return;
        setIsLiveDb(Boolean(res && res.isLiveDb));
      }).catch(() => {
        if (!isMounted) return;
        setIsLiveDb(false);
      });
    };

    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Debounced username availability check
  useEffect(() => {
    if (!isSignUp || !username.trim() || username.trim().length < 3) {
      setUsernameStatus({ checking: false });
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      const res = await ApiService.checkUsernameAvailability(username.trim());
      setUsernameStatus({
        checking: false,
        available: res.available,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [username, isSignUp]);

  // Lockout countdown tick
  useEffect(() => {
    if (lockoutTimer === null || lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer(prev => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'NONE', color: 'bg-dungeon-highlight' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'WEAK', color: 'bg-glyph-crimson' };
    if (score <= 4) return { score: 2, label: 'MEDIUM', color: 'bg-quest-amber' };
    return { score: 3, label: 'STRONG', color: 'bg-glyph-emerald' };
  };

  const strength = getPasswordStrength(password);

  // Sign Up handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setAlreadyExists(false);

    if (username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await ApiService.signUp({
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });

      if (res.success && res.user) {
        StorageService.setActiveUserId(res.user.id);
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
        if (res.alreadyExists) setAlreadyExists(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign In handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signInIdentifier.trim()) {
      setErrorMsg('Please enter your username or email.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await ApiService.signIn(signInIdentifier.trim(), password.trim());
      if (res.success && res.user) {
        StorageService.setActiveUserId(res.user.id);
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'Failed to sign in. Check credentials.');
        if (res.error && res.error.includes('Vault locked')) {
          setLockoutTimer(900); // 15 mins lock
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error signing in.');
    } finally {
      setIsLoading(false);
    }
  };

  // Offline / Guest Mode Fallback
  const handleOfflineLogin = () => {
    const rawTag = (signInIdentifier || username || 'Mayank_D').trim();
    const cleanTag = rawTag || 'Adventurer';
    const defaultProfile = StorageService.createDefaultProfile(cleanTag, role);
    StorageService.saveActiveProfile(defaultProfile);
    StorageService.setActiveUserId(defaultProfile.id);
    onLoginSuccess(defaultProfile);
  };

  return (
    <div className="min-h-screen bg-dungeon-abyss text-parchment-white flex flex-col items-center justify-center p-4 relative font-code">
      {/* Background scanlines */}
      <div className="absolute inset-0 crt-overlay opacity-40 pointer-events-none" />

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-dungeon-chamber border-2 border-mana-core shadow-pixel-modal relative z-10 overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-dungeon-crypt border-b-2 border-dungeon-border p-3.5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-dungeon-abyss border border-mana-core flex items-center justify-center text-mana-core">
              <Swords className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-xs uppercase text-mana-core tracking-wider">
              SQL QUEST ACADEMY
            </span>
          </div>

          {/* Live DB connection badge */}
          <div className="flex items-center gap-1.5 text-[10px] font-display">
            {isLiveDb ? (
              <span className="flex items-center gap-1 text-glyph-emerald">
                <span className="w-1.5 h-1.5 rounded-full bg-glyph-emerald animate-pulse inline-block" />
                PG17 CLOUD ONLINE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-mana-core">
                <span className="w-1.5 h-1.5 rounded-full bg-mana-core inline-block" />
                PG17 BROWSER ENGINE
              </span>
            )}
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 border-b-2 border-dungeon-border text-xs font-display">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg('');
              setAlreadyExists(false);
              setPassword('');
            }}
            className={`py-2.5 text-center font-bold uppercase transition-colors flex items-center justify-center gap-1.5 ${
              !isSignUp
                ? 'bg-dungeon-abyss text-mana-core border-b-2 border-mana-core'
                : 'text-parchment-rune hover:text-parchment-white bg-dungeon-chamber'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>SIGN IN</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg('');
              setAlreadyExists(false);
              setPassword('');
            }}
            className={`py-2.5 text-center font-bold uppercase transition-colors flex items-center justify-center gap-1.5 ${
              isSignUp
                ? 'bg-dungeon-abyss text-quest-gold border-b-2 border-quest-gold'
                : 'text-parchment-rune hover:text-quest-gold bg-dungeon-chamber'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>CREATE ACCOUNT</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs font-code">
          {errorMsg && (
            <div className="p-2.5 bg-glyph-crimson/20 border border-glyph-crimson text-glyph-crimson text-[11px] font-display flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
                {lockoutTimer && (
                  <span className="block mt-1 text-quest-gold">
                    Cooldown remaining: {Math.floor(lockoutTimer / 60)}m {lockoutTimer % 60}s
                  </span>
                )}
                {alreadyExists && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMsg('');
                      setAlreadyExists(false);
                      setSignInIdentifier(username.trim() || email.trim());
                      setPassword('');
                    }}
                    className="block mt-2 text-mana-core underline hover:text-mana-glow font-bold text-[11px] transition-colors"
                  >
                    → Sign In instead
                  </button>
                )}
              </div>
            </div>
          )}

          {isSignUp ? (
            /* ================= SIGN UP FORM ================= */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Username */}
              <div>
                <label className="block text-[11px] text-parchment-white font-display uppercase mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-quest-gold" />
                    <span>USERNAME</span>
                  </span>

                  {/* Username availability badge */}
                  {username.trim().length >= 3 && (
                    <span className="text-[10px] font-display">
                      {usernameStatus.checking ? (
                        <span className="text-parchment-rune animate-pulse">Checking...</span>
                      ) : usernameStatus.available ? (
                        <span className="text-glyph-emerald font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>AVAILABLE</span>
                        </span>
                      ) : (
                        <span className="text-glyph-crimson font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>TAKEN</span>
                        </span>
                      )}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full bg-dungeon-abyss border p-2.5 text-xs text-parchment-white focus:outline-none transition-colors ${
                    username.trim().length >= 3 && usernameStatus.available === false
                      ? 'border-glyph-crimson'
                      : username.trim().length >= 3 && usernameStatus.available === true
                      ? 'border-glyph-emerald focus:border-glyph-emerald'
                      : 'border-dungeon-highlight focus:border-quest-gold'
                  }`}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] text-parchment-white font-display uppercase mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-mana-core" />
                  <span>EMAIL</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dungeon-abyss border border-dungeon-highlight focus:border-mana-core p-2.5 text-xs text-parchment-white focus:outline-none"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] text-parchment-white font-display uppercase mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-mana-glow" />
                    <span>PASSWORD</span>
                  </span>
                  {password && (
                    <span className={`text-[10px] font-bold ${
                      strength.score === 3 ? 'text-glyph-emerald' : strength.score === 2 ? 'text-quest-gold' : 'text-glyph-crimson'
                    }`}>
                      {strength.label}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password (min. 6 characters)..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dungeon-abyss border border-dungeon-highlight focus:border-mana-core p-2.5 pr-10 text-xs text-parchment-white focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-parchment-rune hover:text-parchment-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Visual strength bar */}
                {password && (
                  <div className="w-full h-1 bg-dungeon-crypt mt-1.5 flex gap-1">
                    <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                  </div>
                )}
              </div>

              {/* Career Class */}
              <div>
                <label className="block text-[11px] text-parchment-white font-display uppercase mb-1">
                  CAREER CLASS
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as CareerRole)}
                  className="w-full bg-dungeon-abyss border border-dungeon-highlight focus:border-quest-gold p-2.5 text-xs text-parchment-white focus:outline-none"
                >
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Analytics Engineer">Analytics Engineer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                </select>
              </div>

              {/* Submit: Create Account */}
              <button
                type="submit"
                disabled={isLoading || usernameStatus.available === false}
                className="w-full mt-3 bg-quest-gold hover:bg-quest-amber text-dungeon-abyss font-display font-bold text-xs py-3 pixel-btn uppercase tracking-wider disabled:opacity-50 transition-colors shadow-pixel flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-dungeon-abyss" />
                    <span>CREATING ACCOUNT...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          ) : (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleSignIn} className="space-y-3.5">
              {/* Username or Email */}
              <div>
                <label className="block text-[11px] text-parchment-white font-display uppercase mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-mana-core" />
                  <span>USERNAME OR EMAIL</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your username or email..."
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  className="w-full bg-dungeon-abyss border border-dungeon-highlight focus:border-mana-core p-2.5 text-xs text-parchment-white focus:outline-none"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] text-parchment-white font-display uppercase mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-mana-glow" />
                  <span>PASSWORD</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dungeon-abyss border border-dungeon-highlight focus:border-mana-core p-2.5 pr-10 text-xs text-parchment-white focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-parchment-rune hover:text-parchment-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit: Sign In */}
              <button
                type="submit"
                disabled={isLoading || lockoutTimer !== null}
                className="w-full mt-3 bg-mana-core hover:bg-mana-glow text-dungeon-abyss font-display font-bold text-xs py-3 pixel-btn uppercase tracking-wider disabled:opacity-50 transition-colors shadow-pixel flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-dungeon-abyss" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : lockoutTimer !== null ? (
                  <span>LOCKED (COOLDOWN)</span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* Quick Offline / Guest Mode Access */}
          <div className="pt-2 border-t border-dungeon-border text-center">
            <button
              type="button"
              onClick={handleOfflineLogin}
              className="text-[11px] text-parchment-rune hover:text-quest-gold transition-colors font-display inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-quest-gold" />
              <span>Or Play Directly as Guest (Local Offline Mode) →</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
