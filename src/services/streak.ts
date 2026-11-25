import type { StreakState } from '../types/app';

export const INITIAL_STREAK_STATE: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
  readVerseIds: [],
};

/**
 * Formats a Date as a local YYYY-MM-DD key without UTC timezone drift.
 */
export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPreviousLocalDateKey(date: Date): string {
  const prev = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
  return getLocalDateKey(prev);
}

/**
 * Records a verse read on the given date, updating streak and unique verse history.
 */
export function recordDailyRead(
  prev: StreakState,
  verseId: string,
  now: Date = new Date()
): StreakState {
  const todayKey = getLocalDateKey(now);
  const yesterdayKey = getPreviousLocalDateKey(now);

  const hasVerse = prev.readVerseIds.includes(verseId);
  const nextReadVerseIds = hasVerse ? prev.readVerseIds : [...prev.readVerseIds, verseId];

  if (prev.lastReadDate === todayKey) {
    if (hasVerse) return prev;
    return {
      ...prev,
      readVerseIds: nextReadVerseIds,
    };
  }

  let nextStreak = 1;
  if (prev.lastReadDate === yesterdayKey) {
    nextStreak = prev.currentStreak + 1;
  }

  return {
    currentStreak: nextStreak,
    longestStreak: Math.max(prev.longestStreak, nextStreak),
    lastReadDate: todayKey,
    readVerseIds: nextReadVerseIds,
  };
}
