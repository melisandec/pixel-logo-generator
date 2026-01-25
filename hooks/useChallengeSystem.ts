import { useState, useCallback } from "react";

interface ChallengeProgress {
  [key: string]: boolean;
}

interface ChallengeDay {
  date: string;
  completed: boolean;
  prompts: string[];
}

/**
 * Manages daily challenge system state:
 * - Current challenge prompts
 * - Completion progress
 * - Streak tracking
 * - Time until reset
 */
export function useChallengeSystem() {
  const [todayChallenges, setTodayChallenges] = useState<string[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress>(
    {},
  );
  const [challengeDays, setChallengeDays] = useState<ChallengeDay[]>([]);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  const [currentStreak, setCurrentStreak] = useState(0);
  const [challengeHistory, setChallengeHistory] = useState<
    Array<{ date: string; completedAt: number }>
  >([]);
  const [todayWinners, setTodayWinners] = useState<any[]>([]);
  const [pastWeekWinners, setPastWeekWinners] = useState<any[]>([]);

  const toggleChallenge = useCallback(
    (promptKey: string, completed: boolean) => {
      setChallengeProgress((prev) => ({
        ...prev,
        [promptKey]: completed,
      }));
    },
    [],
  );

  const completedCount = useCallback((): number => {
    return Object.values(challengeProgress).filter(Boolean).length;
  }, [challengeProgress]);

  const isChallengeDayComplete = useCallback((): boolean => {
    return completedCount() === 6;
  }, [completedCount]);

  const updateStreak = useCallback((newStreak: number) => {
    setCurrentStreak(newStreak);
  }, []);

  const addChallengeDay = useCallback((day: ChallengeDay) => {
    setChallengeDays((prev) => {
      const filtered = prev.filter((d) => d.date !== day.date);
      return [...filtered, day];
    });
  }, []);

  const resetDailyProgress = useCallback(() => {
    setChallengeProgress({});
  }, []);

  return {
    todayChallenges,
    setTodayChallenges,
    challengeProgress,
    setChallengeProgress,
    toggleChallenge,
    completedCount,
    isChallengeDayComplete,
    challengeDays,
    setChallengeDays,
    addChallengeDay,
    timeUntilReset,
    setTimeUntilReset,
    currentStreak,
    setCurrentStreak,
    updateStreak,
    challengeHistory,
    setChallengeHistory,
    todayWinners,
    setTodayWinners,
    pastWeekWinners,
    setPastWeekWinners,
    resetDailyProgress,
  };
}
