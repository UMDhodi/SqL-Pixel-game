import React, { useState, useEffect } from 'react';
import { PlayerProfile, AppView, Chapter, Lesson } from '../types/game';
import { CHAPTERS_DATA } from '../data/chapters';
import { ApiService, LeaderboardEntry } from '../services/apiService';
import {
  Swords, Flame, Gem, Shield, Database, BookOpen, Map, Zap, Play,
  Lock, Award, Users, Terminal, CheckCircle2, ChevronRight, Sparkles,
  Trophy, Crown, Medal, Compass, Briefcase
} from 'lucide-react';
import { Toast } from './Toast';

interface HomePageProps {
  profile: PlayerProfile;
  onChangeView: (view: AppView) => void;
  onOpenProfile: () => void;
  onStartQuest: (chapterId: number, exerciseId?: string) => void;
  onProfileUpdated?: (updated: PlayerProfile) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  profile,
  onChangeView,
  onOpenProfile,
  onStartQuest,
  onProfileUpdated,
}) => {
  // Real Leaderboard from PostgreSQL Database
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(true);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastOpen, setIsToastOpen] = useState<boolean>(false);

  // Auto-sync real authoritative user progress directly from PostgreSQL
  useEffect(() => {
    let isMounted = true;
    const lookupId = profile.id || profile.userId || profile.gamerTag || profile.username;
    if (lookupId) {
      ApiService.getUserProfile(lookupId).then(fresh => {
        if (!isMounted || !fresh) return;
        const freshCompleted = fresh.completedLessons || [];
        const currentCompleted = profile.completedLessons || [];
        if (
          fresh.xp !== profile.xp ||
          fresh.level !== profile.level ||
          freshCompleted.length !== currentCompleted.length ||
          fresh.gems !== profile.gems
        ) {
          onProfileUpdated?.(fresh);
        }
      }).catch(() => {});
    }
    return () => { isMounted = false; };
  }, [profile.id, profile.gamerTag]);

  useEffect(() => {
    let isMounted = true;
    ApiService.getLeaderboard().then(entries => {
      if (isMounted) {
        setLeaderboard(entries);
        setIsLoadingLeaderboard(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoadingLeaderboard(false);
    });
    return () => { isMounted = false; };
  }, [profile.xp, profile.level, profile.gems]);

  // Determine current user's real database rank
  const myLeaderboardIndex = leaderboard.findIndex(
    u => u.id === profile.id || u.id === profile.userId || u.username.toLowerCase() === (profile.gamerTag || '').toLowerCase()
  );
  const myRank = myLeaderboardIndex !== -1 ? myLeaderboardIndex + 1 : 1;

  // Track if user is new or has started a quest session
  const userId = profile.id || profile.userId;
  const hasStartedSession = Boolean(
    (profile.completedLessons && profile.completedLessons.length > 0) ||
    (profile.xp && profile.xp > 0) ||
    (profile.solvedQueriesCount && profile.solvedQueriesCount > 0) ||
    (typeof window !== 'undefined' && localStorage.getItem(`sql_quest_started_${userId}`) === 'true')
  );

  // 1. Determine active chapter from real unlocked progress
  const unlockedChaptersList = profile.unlockedChapters || [1];
  const activeChapterId = unlockedChaptersList[unlockedChaptersList.length - 1] || 1;
  const activeChapter = CHAPTERS_DATA.find(c => c.id === activeChapterId) || CHAPTERS_DATA[0];

  // Progression tracking for the Technical Interview & Case Studies Arena
  // Currently locked until user completes all curriculum phases
  const completedPhasesCount = (profile.completedCaseStudies || []).length;
  const totalRequiredPhases = 4;
  const isInterviewUnlocked = completedPhasesCount >= totalRequiredPhases;

  // 2. Determine active lesson in the active chapter (first uncompleted lesson)
  const completedLessons = profile.completedLessons || [];
  const activeLesson = activeChapter.lessons.find(l => !completedLessons.includes(l.id)) || activeChapter.lessons[activeChapter.lessons.length - 1];
  const activeLessonNumber = activeLesson.exerciseNumber;

  // 3. Real Chapter Mastery calculation
  const completedInActiveChapter = activeChapter.lessons.filter(l => completedLessons.includes(l.id)).length;
  const totalInActiveChapter = activeChapter.lessons.length;
  const chapterSyncPercent = Math.round((completedInActiveChapter / totalInActiveChapter) * 100);

  // 4. Overall game stats
  const totalExercisesCount = CHAPTERS_DATA.reduce((acc, c) => acc + c.lessons.length, 0);
  const totalCompletedCount = completedLessons.length;
  const totalWorldsUnlocked = unlockedChaptersList.length;

  return (
    <div className="min-h-screen bg-dungeon-abyss text-parchment-white flex flex-col font-code">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="border-b-2 border-dungeon-border bg-dungeon-chamber px-4 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-pixel">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-dungeon-abyss border-2 border-mana-core flex items-center justify-center text-mana-core">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm tracking-wider text-parchment-white">
                SQL QUEST
              </span>
              <span className="bg-quest-gold text-dungeon-abyss text-[9px] font-display font-bold px-1 py-0.2">
                RPG
              </span>
            </div>
            <span className="text-[10px] text-parchment-rune">ACADEMY HUB</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-2 text-xs font-display">
          <button
            onClick={() => onChangeView('home')}
            className="bg-mana-core text-dungeon-abyss font-bold px-3 py-1.5 border border-parchment-white pixel-btn"
          >
            CAMPAIGN
          </button>
          <button
            onClick={() => onChangeView('schema')}
            className="text-parchment-rune hover:text-quest-gold px-3 py-1.5 border border-transparent hover:border-quest-gold flex items-center gap-1.5 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>DB SCHEMA</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('leaderboard-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-parchment-rune hover:text-quest-gold px-3 py-1.5 border border-transparent hover:border-quest-gold flex items-center gap-1.5 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-quest-gold" />
            <span>LEADERBOARDS</span>
          </button>
        </nav>

        {/* Right Stats HUD */}
        <div className="flex items-center gap-3 text-xs font-display">
          <div className="flex items-center gap-1 bg-dungeon-crypt border border-dungeon-highlight px-2 py-1 text-quest-gold">
            <Flame className="w-3.5 h-3.5 fill-quest-gold text-quest-gold" />
            <span>{profile.streak} DAYS</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-dungeon-crypt border border-dungeon-highlight px-2 py-1 text-mana-core">
            <Gem className="w-3.5 h-3.5 fill-mana-core text-mana-core" />
            <span>{profile.gems ?? 0} GEMS</span>
          </div>

          {/* Player Pill */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 bg-dungeon-crypt border-2 border-mana-core px-2.5 py-1 pixel-btn hover:bg-dungeon-highlight"
          >
            <div className="w-5 h-5 bg-dungeon-abyss text-mana-core border border-mana-core flex items-center justify-center text-[10px] font-bold">
              {profile.gamerTag.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-parchment-white block leading-none">
                {profile.gamerTag}
              </span>
              <span className="text-[9px] text-quest-gold leading-none">
                LVL {profile.level} {profile.role}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 space-y-5">
        {/* HERO SECTION: REAL DYNAMIC ACTIVE EXPEDITION BANNER */}
        <section className="bg-dungeon-chamber border-2 border-dungeon-highlight shadow-pixel-modal overflow-hidden">
          {/* Section Sub-header */}
          <div className="bg-dungeon-crypt px-4 py-2 border-b border-dungeon-border flex items-center justify-between text-xs font-display">
            <div className="flex items-center gap-2 text-quest-gold font-bold">
              <span className="w-2 h-2 bg-quest-gold inline-block" />
              <span>
                CHAMBER 0{activeChapter.id} // ACTIVE EXPEDITION QUEST #0{activeLessonNumber}/0{totalInActiveChapter}
              </span>
            </div>
            <span className="text-parchment-rune text-[11px]">
              RESETS IN: <span className="text-parchment-white font-bold">06:42:15</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6 items-center">
            {/* Left 7 cols: Real Quest Details */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-[11px] font-display text-quest-amber uppercase font-bold tracking-wider block">
                  ⚔️ CURRENT OBJECTIVE: {activeChapter.code}
                </span>
                <h1 className="font-display font-bold text-xl sm:text-2xl text-parchment-white mt-1 uppercase">
                  {activeLesson.title}
                </h1>
                <p className="text-xs text-parchment-rune mt-2 leading-relaxed">
                  {activeLesson.loreIntro}
                </p>
              </div>

              {/* Dynamic Stat Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-display">
                <div className="bg-dungeon-abyss border border-dungeon-border p-2">
                  <span className="text-[10px] text-parchment-rune block">DIFFICULTY</span>
                  <span className="text-quest-gold font-bold">⭐ {activeLesson.difficulty}</span>
                </div>
                <div className="bg-dungeon-abyss border border-dungeon-border p-2">
                  <span className="text-[10px] text-parchment-rune block">XP BOUNTY</span>
                  <span className="text-mana-core font-bold">+{activeLesson.xpReward} XP</span>
                </div>
                <div className="bg-dungeon-abyss border border-dungeon-border p-2">
                  <span className="text-[10px] text-parchment-rune block">PROGRESS</span>
                  <span className="text-glyph-emerald font-bold">{chapterSyncPercent}% SYNC</span>
                </div>
                <div className="bg-dungeon-abyss border border-dungeon-border p-2">
                  <span className="text-[10px] text-parchment-rune block">REWARD ITEM</span>
                  <span className="text-parchment-white font-bold">RUNIC STONE</span>
                </div>
              </div>

              {/* Real Chapter Mastery Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-display mb-1.5">
                  <span className="text-parchment-rune">CHAPTER MASTERY</span>
                  <span className="text-mana-core font-bold">
                    {completedInActiveChapter} OF {totalInActiveChapter} SPELLS MASTERED
                  </span>
                </div>
                <div className="h-2.5 bg-dungeon-abyss border border-dungeon-border flex gap-1 p-0.5">
                  {Array.from({ length: totalInActiveChapter }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-full transition-colors ${
                        i < completedInActiveChapter ? 'bg-mana-core' : 'bg-dungeon-crypt opacity-30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => {
                    localStorage.setItem(`sql_quest_started_${userId}`, 'true');
                    onStartQuest(activeChapter.id, activeLesson.id);
                  }}
                  className="bg-mana-core hover:bg-mana-glow text-dungeon-abyss font-display font-bold text-xs uppercase px-5 py-2.5 pixel-btn flex items-center gap-2 transition-colors shadow-pixel"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{hasStartedSession ? 'Resume quest' : 'Start'}</span>
                </button>
                <button
                  onClick={() => onChangeView('schema')}
                  className="bg-dungeon-crypt hover:bg-dungeon-highlight border-2 border-dungeon-highlight hover:border-mana-core text-parchment-white font-display text-xs px-4 py-2.5 pixel-btn flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-mana-core" />
                  <span>OPEN CODEX</span>
                </button>
                <button
                  onClick={() => onChangeView('roadmap')}
                  className="bg-dungeon-crypt hover:bg-dungeon-highlight border-2 border-dungeon-highlight hover:border-quest-gold text-parchment-white font-display text-xs px-4 py-2.5 pixel-btn flex items-center gap-2 group"
                >
                  <Compass className="w-4 h-4 text-quest-gold group-hover:rotate-45 transition-transform" />
                  <span>ROADMAP</span>
                </button>
                {/* Hidden for now: WORLD MAP button
                <button
                  onClick={() => onStartQuest(1, 'ch1-ex1')}
                  className="bg-dungeon-crypt hover:bg-dungeon-highlight border-2 border-dungeon-highlight text-parchment-rune hover:text-parchment-white font-display text-xs px-4 py-2.5 pixel-btn flex items-center gap-2"
                >
                  <Map className="w-4 h-4" />
                  <span>WORLD MAP</span>
                </button>
                */}
              </div>
            </div>

            {/* Right 5 cols: Real Active Boss Encounter Card */}
            <div className="lg:col-span-5 bg-dungeon-abyss border-2 border-dungeon-border p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-display">
                <span className="text-glyph-crimson font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-glyph-crimson inline-block animate-ping" />
                  RAID TARGET // ENCOUNTER
                </span>
                <span className="bg-glyph-crimson/20 border border-glyph-crimson text-glyph-crimson text-[10px] px-1.5 font-bold">
                  {activeChapter.boss.title.split('//')[0] || 'LV. 04 BOSS'}
                </span>
              </div>

              {/* Boss Pixel Display */}
              <div className="h-40 bg-dungeon-crypt/60 border border-dungeon-highlight flex flex-col items-center justify-center relative">
                <div className="text-5xl animate-bob mb-2">
                  {activeChapter.boss.avatarType === 'slime' ? '🟢' : activeChapter.boss.avatarType === 'dragon' ? '🐲' : '🗿'}
                </div>
                <span className="font-display font-bold text-xs text-quest-gold tracking-widest uppercase">
                  {activeChapter.boss.name}
                </span>
                <span className="text-[10px] text-parchment-rune">
                  {activeChapter.boss.title}
                </span>
              </div>

              {/* HP Meter */}
              <div>
                <div className="flex justify-between text-[10px] font-display mb-1">
                  <span className="text-parchment-rune">BOSS INTEGRITY (HP)</span>
                  <span className="text-glyph-crimson font-bold">
                    {profile.completedCaseStudies.includes(activeChapter.id) ? 0 : activeChapter.boss.maxHp} / {activeChapter.boss.maxHp} HP
                  </span>
                </div>
                <div className="h-2 bg-dungeon-chamber border border-dungeon-border overflow-hidden">
                  <div
                    className="h-full bg-glyph-crimson transition-all duration-300"
                    style={{
                      width: profile.completedCaseStudies.includes(activeChapter.id) ? '0%' : '100%',
                    }}
                  />
                </div>
              </div>

              <div className="bg-dungeon-chamber p-2 border border-dungeon-border text-[11px] font-code">
                <span className="text-[10px] font-display text-parchment-rune block">TARGET WEAKNESS:</span>
                <span className="text-mana-core truncate block">
                  {activeChapter.boss.weaknessSql}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. REALM EXPEDITIONS // QUEST WORLDS (EVERYTHING LOCKED EXCEPT UNLOCKED CHAPTERS!) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-mana-core inline-block" />
              <h2 className="font-display font-bold text-sm tracking-wider uppercase text-parchment-white">
                REALM EXPEDITIONS // QUEST WORLDS
              </h2>
            </div>
            <div className="text-xs font-display text-parchment-rune">
              CLEARED: <span className="text-glyph-emerald font-bold">{totalCompletedCount} / {totalExercisesCount}</span> • WORLDS:{' '}
              <span className="text-quest-gold font-bold">0{totalWorldsUnlocked} UNLOCKED / 04 TOTAL</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* World 01 Card */}
            {(() => {
              const ch1 = CHAPTERS_DATA[0];
              const completedCh1 = ch1.lessons.filter(l => completedLessons.includes(l.id)).length;
              const isCh1Unlocked = unlockedChaptersList.includes(1);

              return (
                <div className="bg-dungeon-chamber border-2 border-mana-core p-4 space-y-3 shadow-pixel flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-display mb-2">
                      <span className="bg-mana-core text-dungeon-abyss font-bold px-1.5 py-0.5">WORLD 01</span>
                      <span className="text-glyph-emerald font-bold">ACTIVE</span>
                    </div>
                    <div className="h-24 bg-dungeon-abyss border border-dungeon-border flex items-center justify-center text-3xl mb-3">
                      🏛️
                    </div>
                    <h3 className="font-display font-bold text-sm text-parchment-white uppercase">
                      {ch1.title}
                    </h3>
                    <p className="text-[11px] text-parchment-rune mt-1 leading-relaxed">
                      {ch1.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-dungeon-border space-y-2">
                    <div className="flex justify-between text-[10px] font-display text-parchment-rune">
                      <span>COMPLETION</span>
                      <span className="text-glyph-emerald font-bold">{completedCh1} / {ch1.lessons.length} CLEARED</span>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem(`sql_quest_started_${userId}`, 'true');
                        onStartQuest(1, 'ch1-ex1');
                      }}
                      className="w-full bg-mana-core hover:bg-mana-glow text-dungeon-abyss font-display font-bold text-xs py-2 pixel-btn uppercase transition-colors"
                    >
                      {hasStartedSession ? 'Resume quest' : 'Start'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* World 02 Card (LOCKED until Chapter 1 cleared!) */}
            {(() => {
              const ch2 = CHAPTERS_DATA[1];
              const isCh2Unlocked = unlockedChaptersList.includes(2);
              const completedCh2 = ch2.lessons.filter(l => completedLessons.includes(l.id)).length;

              return (
                <div className={`bg-dungeon-chamber border-2 p-4 space-y-3 shadow-pixel flex flex-col justify-between ${
                  isCh2Unlocked ? 'border-mana-core' : 'border-dungeon-border opacity-75'
                }`}>
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-display mb-2">
                      <span className="bg-dungeon-crypt text-parchment-rune border border-dungeon-border font-bold px-1.5 py-0.5">
                        WORLD 02
                      </span>
                      {isCh2Unlocked ? (
                        <span className="text-glyph-emerald font-bold">UNLOCKED</span>
                      ) : (
                        <span className="text-quest-gold font-bold">LOCKED [CLEAR CH.01 BOSS]</span>
                      )}
                    </div>
                    <div className="h-24 bg-dungeon-abyss border border-dungeon-border flex items-center justify-center text-3xl mb-3">
                      {isCh2Unlocked ? '🐉' : <Lock className="w-8 h-8 text-quest-gold" />}
                    </div>
                    <h3 className="font-display font-bold text-sm text-parchment-white uppercase">
                      {ch2.title}
                    </h3>
                    <p className="text-[11px] text-parchment-rune mt-1 leading-relaxed">
                      {ch2.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-dungeon-border space-y-2">
                    <div className="flex justify-between text-[10px] font-display text-parchment-rune">
                      <span>{isCh2Unlocked ? 'COMPLETION' : 'REQUIREMENT'}</span>
                      <span className={isCh2Unlocked ? 'text-glyph-emerald font-bold' : 'text-quest-gold font-bold'}>
                        {isCh2Unlocked ? `${completedCh2} / ${ch2.lessons.length} CLEARED` : 'SLAY SLIME HOARD'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (isCh2Unlocked) onStartQuest(2);
                      }}
                      disabled={!isCh2Unlocked}
                      className={`w-full font-display text-xs py-2 pixel-btn ${
                        isCh2Unlocked
                          ? 'bg-mana-core text-dungeon-abyss font-bold hover:bg-mana-glow'
                          : 'bg-dungeon-abyss text-slate-500 border border-dungeon-border cursor-not-allowed'
                      }`}
                    >
                      {isCh2Unlocked ? 'ACCESS CHAMBER' : 'LOCKED [REQ CH.01]'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* World 03 Card (LOCKED until Chapter 2 cleared!) */}
            {(() => {
              const ch3 = CHAPTERS_DATA[2];
              const isCh3Unlocked = unlockedChaptersList.includes(3);

              return (
                <div className={`bg-dungeon-chamber border-2 p-4 space-y-3 shadow-pixel flex flex-col justify-between ${
                  isCh3Unlocked ? 'border-mana-core' : 'border-dungeon-border opacity-60'
                }`}>
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-display mb-2">
                      <span className="bg-dungeon-crypt text-slate-500 font-bold px-1.5 py-0.5">WORLD 03</span>
                      <span className={isCh3Unlocked ? 'text-glyph-emerald font-bold' : 'text-slate-500'}>
                        {isCh3Unlocked ? 'UNLOCKED' : 'LOCKED [REQ CH.02]'}
                      </span>
                    </div>
                    <div className="h-24 bg-dungeon-abyss border border-dungeon-border flex items-center justify-center text-3xl mb-3 opacity-50">
                      {isCh3Unlocked ? '🗿' : <Lock className="w-8 h-8 text-slate-600" />}
                    </div>
                    <h3 className="font-display font-bold text-sm text-slate-300 uppercase">
                      {ch3.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {ch3.subtitle}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-dungeon-border">
                    <button
                      onClick={() => {
                        if (isCh3Unlocked) onStartQuest(3);
                      }}
                      disabled={!isCh3Unlocked}
                      className={`w-full font-display text-xs py-2 border ${
                        isCh3Unlocked
                          ? 'bg-mana-core text-dungeon-abyss font-bold'
                          : 'bg-dungeon-abyss text-slate-600 border-dungeon-border cursor-not-allowed'
                      }`}
                    >
                      {isCh3Unlocked ? 'ENTER REALM' : 'RESTRICTED REALM'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* World 04 Card (LOCKED until Chapter 3 cleared!) */}
            <div className="bg-dungeon-chamber border-2 border-dungeon-border opacity-50 p-4 space-y-3 shadow-pixel flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[10px] font-display mb-2">
                  <span className="bg-dungeon-crypt text-slate-500 font-bold px-1.5 py-0.5">WORLD 04</span>
                  <span className="text-slate-500">MASTER TIER</span>
                </div>
                <div className="h-24 bg-dungeon-abyss border border-dungeon-border flex items-center justify-center text-3xl mb-3 opacity-30">
                  <Lock className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="font-display font-bold text-sm text-slate-400">
                  INDEX SANCTUM & ACID
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Master B-Tree indexes, execution plans, isolation levels, and deadlock evasion.
                </p>
              </div>
              <div className="pt-2 border-t border-dungeon-border">
                <button disabled className="w-full bg-dungeon-abyss text-slate-600 font-display text-xs py-2 border border-dungeon-border cursor-not-allowed">
                  SEALED SANCTUM
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. BOTTOM SPLIT: REAL DAILY BOUNTY & PLAYER PERKS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 7 cols: Daily Bounty & Live Telemetry Feed */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-dungeon-chamber border-2 border-quest-gold p-4 shadow-pixel space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-quest-gold fill-quest-gold" />
                  <span className="font-display font-bold text-xs uppercase text-parchment-white">
                    DAILY DUNGEON BOUNTY
                  </span>
                </div>
                <div className="flex gap-1.5 text-[10px] font-display">
                  <span className="bg-mana-core text-dungeon-abyss font-bold px-1.5 py-0.5">+50 GEMS</span>
                  <span className="bg-quest-gold text-dungeon-abyss font-bold px-1.5 py-0.5">+150 XP</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] bg-glyph-crimson/20 text-glyph-crimson border border-glyph-crimson px-1.5 py-0.2 font-display uppercase font-bold mr-2">
                  TIMED TRIAL
                </span>
                <span className="font-display font-bold text-xs text-parchment-white">
                  THE TAVERN HIGH-SPENDER CENSUS
                </span>
                <p className="text-xs text-parchment-rune mt-1 leading-relaxed">
                  Query the live PostgreSQL <span className="text-mana-core font-bold">tavern_orders</span> table to find all adventurers who spent strictly greater than 100 gold coins.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-dungeon-border">
                <span className="text-[10px] text-parchment-rune font-code">
                  TABLE: tavern_orders • DIALECT: PostgreSQL 17
                </span>
                <button
                  onClick={() => onStartQuest(1, 'ch1-ex1')}
                  className="bg-quest-gold hover:bg-quest-amber text-dungeon-abyss font-display font-bold text-xs px-4 py-2 pixel-btn"
                >
                  LAUNCH BOUNTY ARENA
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 cols: Technical Interview & Case Studies Section (Replaced Player Armory) */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`p-4 space-y-3 shadow-pixel border-2 transition-all ${
              isInterviewUnlocked
                ? 'bg-dungeon-chamber border-glyph-crimson shadow-[0_0_15px_rgba(255,0,85,0.25)]'
                : 'bg-dungeon-chamber/80 border-dungeon-highlight'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between text-xs font-display flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 border flex items-center justify-center ${
                    isInterviewUnlocked
                      ? 'bg-dungeon-abyss border-glyph-crimson text-glyph-crimson'
                      : 'bg-dungeon-abyss border-neutral-700 text-neutral-500'
                  }`}>
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-parchment-white font-bold tracking-wide">
                    TECHNICAL INTERVIEW & CASE STUDIES
                  </span>
                </div>
                <div>
                  {isInterviewUnlocked ? (
                    <span className="bg-glyph-crimson text-parchment-white text-[9px] font-bold px-1.5 py-0.5 shadow-pixel-sm animate-pulse">
                      UNLOCKED // READY
                    </span>
                  ) : (
                    <span className="bg-neutral-800 border border-neutral-700 text-neutral-400 text-[9px] font-bold px-1.5 py-0.5 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-neutral-400" />
                      LOCKED
                    </span>
                  )}
                </div>
              </div>

              {/* Subtitle / Role Context */}
              <div className="text-[11px] text-parchment-rune leading-relaxed">
                <span className="text-quest-gold font-bold">{profile.role || 'Data Analyst'}</span> Real-Life Case Study Questions & FAANG Technical Screenings.
              </div>

              {/* Lock Warning & Progress towards unlock */}
              {!isInterviewUnlocked ? (
                <div className="bg-dungeon-abyss border border-neutral-800 p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-display">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-neutral-500" />
                      UNLOCK PREREQUISITE:
                    </span>
                    <span className="text-quest-gold font-bold">
                      {completedPhasesCount} / {totalRequiredPhases} PHASES COMPLETED
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-neutral-900 border border-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-quest-gold transition-all duration-500"
                      style={{ width: `${Math.max(5, (completedPhasesCount / totalRequiredPhases) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-normal">
                    Complete all curriculum phases in the Career Roadmap to unlock the Interview Arena. Zero hints are permitted in interview trials!
                  </p>
                </div>
              ) : (
                <div className="bg-glyph-crimson/10 border border-glyph-crimson/40 p-2.5 text-[11px] text-parchment-white">
                  <span className="text-glyph-crimson font-bold block mb-1">⚔️ ARENA READY:</span>
                  All preparatory phases cleared! You can now face real case study interview challenges from Amazon, Stripe, and Meta.
                </div>
              )}

              {/* Action Button: Links to new InterviewPage */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isInterviewUnlocked) {
                      setToastMessage("Please complete your course first");
                      setIsToastOpen(true);
                      return;
                    }
                    onChangeView('interview');
                  }}
                  className={`w-full font-display text-xs py-2.5 pixel-btn flex items-center justify-center gap-2 transition-all shadow-pixel ${
                    isInterviewUnlocked
                      ? 'bg-quest-gold/20 hover:bg-quest-gold border-2 border-quest-gold text-quest-gold hover:text-dungeon-abyss font-bold uppercase cursor-pointer shadow-[0_0_15px_rgba(255,184,0,0.35)]'
                      : 'bg-dungeon-abyss/80 hover:bg-neutral-900 border-2 border-neutral-800 text-neutral-500 cursor-not-allowed opacity-75 active:scale-[0.98]'
                  }`}
                  title={!isInterviewUnlocked ? "Please complete your course first" : "Enter Interview Arena"}
                >
                  {isInterviewUnlocked ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-quest-gold group-hover:text-dungeon-abyss" />
                      <span className="text-quest-gold font-bold">ENTER INTERVIEW PREP & CASE STUDIES (UNLOCKED)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-neutral-500 font-bold">OPEN INTERVIEW PREP & CASE STUDIES (LOCKED)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6. HALL OF VALOR: GLOBAL LEADERBOARDS BOARD */}
        <section id="leaderboard-section" className="bg-dungeon-chamber border-2 border-dungeon-highlight shadow-pixel-modal overflow-hidden">
          {/* Header */}
          <div className="bg-dungeon-crypt px-4 py-3 border-b-2 border-dungeon-border flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-dungeon-abyss border border-quest-gold flex items-center justify-center text-quest-gold">
                <Trophy className="w-4 h-4 fill-quest-gold" />
              </div>
              <div>
                <span className="font-display font-bold text-sm text-parchment-white uppercase block leading-none">
                  HALL OF VALOR // GUILD ARENA LEADERBOARDS
                </span>
                <span className="text-[10px] text-parchment-rune font-display">
                  TOP SQL WARRIORS ACROSS POSTGRESQL DUNGEONS
                </span>
              </div>
            </div>

            {/* Live Status Badge */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-glyph-emerald animate-pulse" />
              <span className="text-[10px] font-display text-glyph-emerald font-bold">GLOBAL RANKINGS LIVE</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Current Player Ranking Card */}
            <div className="bg-dungeon-abyss border-2 border-mana-core p-3 sm:p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mana-core/20 border-2 border-mana-core flex items-center justify-center font-display font-black text-sm text-mana-core">
                  #{myRank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-parchment-white">
                      {profile.gamerTag}
                    </span>
                    <span className="bg-mana-core text-dungeon-abyss font-display font-bold text-[9px] px-1.5 py-0.2">
                      YOU
                    </span>
                    <span className="bg-quest-gold text-dungeon-abyss font-display font-bold text-[9px] px-1.5 py-0.2">
                      {profile.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-parchment-rune font-code">
                    Level {profile.level} Adventurer • {profile.completedLessons?.length || 0} Quests Completed
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right font-display">
                <div>
                  <span className="text-sm font-bold text-quest-gold block">
                    {(profile.xp || 0).toLocaleString()} XP
                  </span>
                  <span className="text-[9px] text-parchment-rune">ACTIVE SCORE</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-bold text-mana-core block">
                    {profile.gems ?? 0}
                  </span>
                  <span className="text-[9px] text-parchment-rune">GEMS EARNED</span>
                </div>
              </div>
            </div>

            {/* Leaderboard Table (Real PostgreSQL Data) */}
            <div className="bg-dungeon-abyss border border-dungeon-border overflow-x-auto">
              <table className="w-full text-left font-code text-xs">
                <thead>
                  <tr className="bg-dungeon-crypt border-b border-dungeon-border text-[10px] font-display text-parchment-rune uppercase">
                    <th className="py-2.5 px-3">RANK</th>
                    <th className="py-2.5 px-3">ADVENTURER</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">CAREER CLASS</th>
                    <th className="py-2.5 px-3">LEVEL</th>
                    <th className="py-2.5 px-3 hidden md:table-cell">QUESTS DONE</th>
                    <th className="py-2.5 px-3 text-right">TOTAL XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dungeon-border/50 text-parchment-white">
                  {isLoadingLeaderboard ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-parchment-rune font-display">
                        <div className="w-6 h-6 border-2 border-mana-core border-t-transparent animate-spin mx-auto mb-2" />
                        <span>FETCHING LIVE REALM LEADERBOARDS FROM POSTGRESQL...</span>
                      </td>
                    </tr>
                  ) : leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-parchment-rune font-display">
                        <span>No adventurers recorded in PostgreSQL yet. You are the first champion!</span>
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((player) => {
                      const isMe =
                        player.id === profile.id ||
                        player.id === profile.userId ||
                        player.username.toLowerCase() === (profile.gamerTag || '').toLowerCase() ||
                        player.gamerTag.toLowerCase() === (profile.gamerTag || '').toLowerCase();

                      return (
                        <tr
                          key={player.id}
                          className={`hover:bg-dungeon-chamber/60 transition-colors ${
                            isMe ? 'bg-mana-core/10 border-l-2 border-mana-core' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-display font-bold">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 font-bold text-xs ${
                                player.rank === 1
                                  ? 'bg-quest-gold text-dungeon-abyss'
                                  : player.rank === 2
                                  ? 'bg-slate-300 text-dungeon-abyss'
                                  : player.rank === 3
                                  ? 'bg-amber-700 text-parchment-white'
                                  : 'bg-dungeon-chamber border border-dungeon-highlight text-parchment-rune'
                              }`}
                            >
                              {player.rank}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              {player.rank === 1 && <Crown className="w-3.5 h-3.5 text-quest-gold fill-quest-gold" />}
                              {player.rank === 2 && <Medal className="w-3.5 h-3.5 text-slate-300" />}
                              {player.rank === 3 && <Medal className="w-3.5 h-3.5 text-amber-600" />}
                              <span className={`font-bold ${isMe ? 'text-mana-core' : 'text-parchment-white'}`}>
                                {player.gamerTag || player.username}
                              </span>
                              {isMe && (
                                <span className="bg-mana-core text-dungeon-abyss font-display font-bold text-[9px] px-1 py-0.2">
                                  YOU
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-parchment-rune hidden sm:table-cell">{player.role}</td>
                          <td className="py-2.5 px-3 font-display font-bold text-mana-core">LV. {player.level}</td>
                          <td className="py-2.5 px-3 text-glyph-emerald hidden md:table-cell">
                            {player.completedQuestsCount} Solved
                          </td>
                          <td className="py-2.5 px-3 text-right font-display font-bold text-quest-gold">
                            {player.xp.toLocaleString()} XP
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* 6. BOTTOM FOOTER TELEMETRY */}
      <footer className="border-t border-dungeon-border bg-dungeon-chamber px-4 py-2 text-[10px] text-parchment-rune flex items-center justify-between flex-wrap gap-2 font-display">
        <div>
          SERVER: POSTGRESQL 17 [PRISMA POOLED ONLINE] • LATENCY: ~45MS
        </div>
        <div className="flex items-center gap-4">
          <span>CTRL + ENTER: CAST QUERY</span>
          <span>ALT + T: SCHEMA TREE</span>
          <span>© 2026 SQL QUEST ACADEMY</span>
        </div>
      </footer>

      {/* Retro Pixel RPG Toast Notification */}
      <Toast
        message={toastMessage}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />
    </div>
  );
};
