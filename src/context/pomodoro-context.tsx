
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from './auth-context';
import { generateBeepSound } from '@/ai/flows/generate-beep-sound';

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
  const { user } = useAuth();
  
  // Effect to initialize timer state from localStorage
  useEffect(() => {
    try {
        const savedStateJSON = localStorage.getItem('pomodoroState');
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            const now = Date.now();
            let newTimeLeft = savedState.timeLeft;

            if (savedState.isActive && savedState.pauseTime) {
                const elapsedSeconds = Math.floor((now - savedState.pauseTime) / 1000);
                newTimeLeft -= elapsedSeconds;
            }

            if (newTimeLeft > 0) {
                setMode(savedState.mode);
                setTimeLeft(newTimeLeft);
                setIsActive(savedState.isActive);
                setPomodoros(savedState.pomodoros);
            } else {
                // If the timer would have finished, just load the finished state for that mode
                setMode(savedState.mode);
                setTimeLeft(0);
                setIsActive(true); // Keep it active to trigger the end-of-session logic
                setPomodoros(savedState.pomodoros);
            }
        }
    } catch (error) {
        console.error("Could not load Pomodoro state from localStorage", error);
        localStorage.removeItem('pomodoroState'); // Clear corrupted state
    }
  }, []);

  // Effect to save timer state to localStorage
  useEffect(() => {
    try {
        const stateToSave = {
            mode,
            timeLeft,
            isActive,
            pomodoros,
            pauseTime: isActive ? Date.now() : null,
        };
        localStorage.setItem('pomodoroState', JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Could not save Pomodoro state to localStorage", error);
    }
  }, [mode, timeLeft, isActive, pomodoros]);

  // Effect to setup audio element
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
        audioRef.current = new Audio();
    }

    const getBeep = async () => {
        try {
            const beep = await generateBeepSound();
            if(audioRef.current){
                audioRef.current.src = beep.media;
                audioRef.current.load();
            }
        } catch(e) {
            console.error("Could not generate beep sound", e);
        }
    }
    getBeep();

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
      if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
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
        if (isActive && timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - ${mode === 'pomodoro' ? 'Focus' : 'Break'}`;
        } else if (timeLeft <= 0) {
            document.title = `Time's up! - ${originalTitleRef.current}`;
        }
        else {
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
