'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from './auth-context';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const times = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const alarmSounds = [
    { id: 'alarm', name: 'Alarm Clock', path: '/alarm.mp3' },
    { id: 'chime', name: 'Gentle Chime', path: '/chime.mp3' },
    { id: 'digital-beep', name: 'Digital Beep', path: '/digital-beep.mp3' },
    { id: 'birds', name: 'Morning Birds', path: '/birds.mp3' },
];

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
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(times[mode]);
  const [isActive, setIsActive] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const originalTitleRef = useRef(typeof document !== 'undefined' ? document.title : '');
  const { user } = useAuth();
  
  useEffect(() => {
    // Initialize audio on the client-side
    const selectedSoundId = user?.user_metadata?.pomodoro_sound || 'alarm';
    const sound = alarmSounds.find(s => s.id === selectedSoundId) || alarmSounds[0];
    audioRef.current = new Audio(sound.path);
  }, [user]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(times[newMode]);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (audioRef.current) {
        audioRef.current.play();
      }

      if (mode === 'pomodoro') {
        const newPomodoros = pomodoros + 1;
        setPomodoros(newPomodoros);
        if (newPomodoros % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        switchMode('pomodoro');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, pomodoros, switchMode]);
  
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


  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(times[mode]);
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
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
