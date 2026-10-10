import React, { useState, useEffect } from 'react';
import { PlayerProfile, AppView, TableSchema } from './types/game';
import { StorageService } from './services/storageService';
import { ApiService } from './services/apiService';
import { sqlEngine } from './engine/sqlEngine';
import { AuthPage } from './components/AuthPage';
import { HomePage } from './components/HomePage';
import { SchemaPage } from './components/SchemaPage';
import { PlaygroundPage } from './components/PlaygroundPage';
import { RoadmapPage } from './components/RoadmapPage';
import { InterviewPage } from './components/InterviewPage';
import { ProfileModal } from './components/ProfileModal';

export const App: React.FC = () => {
  // 1. Current Active Profile (Authoritative state from PostgreSQL DB)
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  // 2. Navigation View State
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  // 3. Quest Target State when navigating from Home to Playground
  const [targetChapterId, setTargetChapterId] = useState<number>(1);
  const [targetLessonId, setTargetLessonId] = useState<string>('ch1-ex1');

  // 4. In-Browser SQL Database State
  const [schemas, setSchemas] = useState<TableSchema[]>([]);
  const [isDbReady, setIsDbReady] = useState<boolean>(false);

  // 5. Profile Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Database initialization & Session loading
  useEffect(() => {
    // Init in-browser SQL engine tables and schemas
    sqlEngine.initDatabase().then(tableSchemas => {
      setSchemas(tableSchemas);
      setIsDbReady(true);
    });

    // Check if active user session exists in cloud DB or browser storage
    const activeUserId = StorageService.getActiveUserId();
    if (activeUserId) {
      ApiService.getUserProfile(activeUserId).then(user => {
        if (user) {
          setProfile(user);
          setCurrentView('home');
        } else {
          const localProfile = StorageService.getActiveProfile();
          if (localProfile) {
            setProfile(localProfile);
            setCurrentView('home');
          } else {
            StorageService.clearSession();
            setCurrentView('auth');
          }
        }
        setIsLoadingUser(false);
      }).catch(() => {
        const localProfile = StorageService.getActiveProfile();
        if (localProfile) {
          setProfile(localProfile);
          setCurrentView('home');
        }
        setIsLoadingUser(false);
      });
    } else {
      setIsLoadingUser(false);
    }
  }, []);

  // Auth Success -> redirect to Home
  const handleLoginSuccess = (userProfile: PlayerProfile) => {
    StorageService.setActiveUserId(userProfile.id || userProfile.userId);
    setProfile(userProfile);
    setCurrentView('home');
  };

  // Launch quest from Home page
  const handleStartQuest = (chapId: number, lessonId?: string) => {
    if (profile) {
      localStorage.setItem(`sql_quest_started_${profile.id || profile.userId}`, 'true');
    }
    setTargetChapterId(chapId);
    if (lessonId) {
      setTargetLessonId(lessonId);
    }
    setCurrentView('playground');
  };

  // Profile update handler
  const handleProfileUpdated = (updated: PlayerProfile) => {
    setProfile(updated);
    StorageService.saveActiveProfile(updated);
  };

  // Reset progress strictly in PostgreSQL database!
  const handleResetProgress = async () => {
    if (!profile) return;
    const confirmed = window.confirm(
      'Are you sure you want to reset all PostgreSQL progress and gems to 0? Your campaign will start fresh from Chapter 1 Exercise 1.'
    );
    if (!confirmed) return;

    const res = await ApiService.resetUserProgress(profile.id || profile.userId);
    if (res.success && res.user) {
      localStorage.removeItem(`sql_quest_started_${profile.id || profile.userId}`);
      setProfile(res.user);
      setIsProfileModalOpen(false);
      alert('⚔️ PostgreSQL Progress & Gems have been reset to 0! Only Chapter 1 Exercise 1 is unlocked.');
    } else {
      // Clear session if user not found in DB
      StorageService.clearSession();
      setProfile(null);
      setCurrentView('auth');
      setIsProfileModalOpen(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    StorageService.clearSession();
    setProfile(null);
    setCurrentView('auth');
    setIsProfileModalOpen(false);
  };

  // Loading indicator while checking PostgreSQL DB session
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-dungeon-abyss text-parchment-white flex items-center justify-center font-display">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-mana-core border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-mana-glow tracking-widest uppercase">Please wait...</p>
        </div>
      </div>
    );
  }

  // If no logged in profile, show Auth page
  if (!profile || currentView === 'auth') {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`${currentView === 'playground' ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'} bg-dungeon-abyss text-parchment-white selection:bg-mana-core selection:text-dungeon-abyss`}>
      {/* VIEW 1: HOME PAGE */}
      {currentView === 'home' && (
        <HomePage
          profile={profile}
          onChangeView={(v) => setCurrentView(v)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onStartQuest={handleStartQuest}
        />
      )}

      {/* VIEW 2: DATABASE SCHEMA EXPLORER */}
      {currentView === 'schema' && (
        <SchemaPage
          schemas={schemas}
          onBackToHome={() => setCurrentView('home')}
          onBackToIde={() => setCurrentView('playground')}
          onInsertQueryToIde={(sql) => {
            setCurrentView('playground');
          }}
        />
      )}

      {/* VIEW 3: GAME ZONE / PLAYGROUND (EXACT IMAGE 3) */}
      {currentView === 'playground' && (
        <PlaygroundPage
          profile={profile}
          schemas={schemas}
          initialChapterId={targetChapterId}
          initialLessonId={targetLessonId}
          onChangeView={(v) => setCurrentView(v)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* VIEW 4: CAREER SQL ROADMAP */}
      {currentView === 'roadmap' && (
        <RoadmapPage
          profile={profile}
          onChangeView={(v) => setCurrentView(v)}
          onStartQuest={handleStartQuest}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />
      )}

      {/* VIEW 5: TECHNICAL INTERVIEW & CASE STUDIES (LOCKED UNTIL ALL 4 PHASES CLEARED) */}
      {currentView === 'interview' && (
        (profile.completedCaseStudies || []).length >= 4 ? (
          <InterviewPage
            profile={profile}
            onChangeView={(v) => setCurrentView(v)}
            onStartQuest={handleStartQuest}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        ) : (
          <HomePage
            profile={profile}
            onStartQuest={handleStartQuest}
            onChangeView={(v) => setCurrentView(v)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
          />
        )
      )}

      {/* Profile & Save Scrolls Modal */}
      {profile && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
          onLogout={handleLogout}
          onResetProgress={handleResetProgress}
        />
      )}
    </div>
  );
};

export default App;
