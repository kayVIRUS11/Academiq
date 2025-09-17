
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const times = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
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
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(times[mode]);
  const [isActive, setIsActive] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const originalTitleRef = useRef(typeof document !== 'undefined' ? document.title : '');

  // Effect to setup audio element
  useEffect(() => {
    // This check ensures we are in the browser
    if (typeof window !== 'undefined') {
        if (!audioRef.current) {
            audioRef.current = new Audio('/chime.mp3'); // Default sound
            audioRef.current.load();
        }
    }
  }, []);

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
