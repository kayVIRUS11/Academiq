'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee, BrainCircuit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

const times = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function PomodoroCard() {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(times[mode]);
  const [isActive, setIsActive] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);

  const getTitle = () => {
    switch (mode) {
      case 'pomodoro':
        return 'Time to Focus!';
      case 'shortBreak':
        return 'Take a Short Break';
      case 'longBreak':
        return 'Take a Long Break';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'pomodoro':
        return <BrainCircuit className="h-5 w-5" />;
      case 'shortBreak':
      case 'longBreak':
        return <Coffee className="h-5 w-5" />;
    }
  };

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

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(times[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = (1 - timeLeft / times[mode]) * 100;

  return (
    <Card className="col-span-1 flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pomodoro Timer</span>
          {getIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center flex-1">
        <div className="text-center">
            <p className="text-muted-foreground">{getTitle()}</p>
            <div className="text-6xl font-bold font-mono my-4">{formatTime(timeLeft)}</div>
        </div>
        <div className="w-full my-4">
          <Progress value={progress} />
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={toggleTimer} size="lg" className="w-28">
            {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="icon">
            <RotateCcw />
          </Button>
        </div>
        <div className="flex gap-2 mt-6">
            <Button size="sm" variant={mode === 'pomodoro' ? 'secondary' : 'ghost'} onClick={() => switchMode('pomodoro')}>Focus</Button>
            <Button size="sm" variant={mode === 'shortBreak' ? 'secondary' : 'ghost'} onClick={() => switchMode('shortBreak')}>Short Break</Button>
            <Button size="sm" variant={mode === 'longBreak' ? 'secondary' : 'ghost'} onClick={() => switchMode('longBreak')}>Long Break</Button>
        </div>
      </CardContent>
    </Card>
  );
}
