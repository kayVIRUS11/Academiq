
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from './auth-context';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const times = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const sounds = {
    chime: '/chime.mp3',
    'digital-beep': '/digital-beep.mp3'
};

type PomodoroContextType = {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  pomodoros: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (newMode: TimerMode) => void;
  times: typeof times;
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(times[mode]);
  const [isActive, setIsActive] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const originalTitleRef = useRef(typeof document !== 'undefined' ? document.title : '');
  const [lastRunningState, setLastRunningState] = useState<{
    timeLeft: number;
    mode: TimerMode;
    isActive: boolean;
    timestamp: number;
  } | null>(null);

  // Setup audio element
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.load();
    }
  }, []);

  // Update audio source when user preference changes
  useEffect(() => {
    if (user && audioRef.current) {
        const soundId = user.user_metadata.pomodoro_alarm_sound || 'chime';
        const soundPath = sounds[soundId as keyof typeof sounds] || sounds.chime;
        if (audioRef.current.src !== window.location.origin + soundPath) {
            audioRef.current.src = soundPath;
            audioRef.current.load();
        }
    }
  }, [user]);


  const stopAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const switchMode = useCallback((newMode: TimerMode) => {
    stopAlarm();
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(times[newMode]);
  }, [stopAlarm]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft <= 0) {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      }

      if (mode === 'pomodoro') {
        const newPomodoros = pomodoros + 1;
        setPomodoros(newPomodoros);
        switchMode(newPomodoros % 4 === 0 ? 'longBreak' : 'shortBreak');
      } else {
        switchMode('pomodoro');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, pomodoros, switchMode]);
  
  // Update document title
  useEffect(() => {
    if (typeof document !== 'undefined') {
        if (isActive) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - ${mode === 'pomodoro' ? 'Focus' : 'Break'}`;
        } else {
            document.title = originalTitleRef.current;
        }
    }
  }, [timeLeft, isActive, mode]);
  
  // Save state to localStorage
  useEffect(() => {
    if(typeof window !== 'undefined') {
      const stateToSave = {
        timeLeft,
        mode,
        isActive,
        timestamp: Date.now(),
        pomodoros
      };
      localStorage.setItem('pomodoroState', JSON.stringify(stateToSave));
    }
  }, [timeLeft, mode, isActive, pomodoros]);

  // Load state from localStorage on mount
  useEffect(() => {
    if(typeof window !== 'undefined') {
      const savedStateJSON = localStorage.getItem('pomodoroState');
      if (savedStateJSON) {
        try {
          const savedState = JSON.parse(savedStateJSON);
          if (savedState.isActive) {
            const timeElapsed = Math.floor((Date.now() - savedState.timestamp) / 1000);
            const newTimeLeft = Math.max(0, savedState.timeLeft - timeElapsed);
            setTimeLeft(newTimeLeft);
          } else {
            setTimeLeft(savedState.timeLeft);
          }
          setMode(savedState.mode);
          setIsActive(savedState.isActive);
          setPomodoros(savedState.pomodoros || 0);

        } catch (e) {
          console.error("Failed to parse pomodoro state from localStorage", e);
          localStorage.removeItem('pomodoroState');
        }
      }
    }
  }, []);

  const toggleTimer = () => {
    stopAlarm();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    stopAlarm();
    setIsActive(false);
    setTimeLeft(times[mode]);
  };

  const value = {
    mode,
    timeLeft,
    isActive,
    pomodoros,
    toggleTimer,
    resetTimer,
    switchMode: (newMode: TimerMode) => switchMode(newMode),
    times,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
