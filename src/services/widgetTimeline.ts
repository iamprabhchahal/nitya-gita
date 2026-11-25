import {
  formatVerseForWidget,
  getAllVerses,
  getCuratedVerses,
  getPoolVerses,
  getVerseById,
  getVerseOfDay,
} from '../data/gitaRepository';
import type { GitaVerse, GitaWidgetProps, WidgetSettings } from '../types/app';

export interface TimelineEntryData {
  date: Date;
  props: GitaWidgetProps;
}

export const DEFAULT_WIDGET_SETTINGS: WidgetSettings = {
  lockScreenScript: 'english',
  homeScreenPrimary: 'sanskrit',
  homeScreenSecondary: 'english',
  rotationMode: 'daily',
  pool: 'curated',
  pinnedVerseId: null,
  sequentialIndex: 0,
};

function startOfLocalDay(date: Date, addDays = 0): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + addDays, 0, 0, 5);
}

/**
 * Resolves the verse that should appear right now on the widget and Today hero.
 */
export function resolveActiveVerse(
  settings: WidgetSettings,
  bookmarks: string[],
  now: Date = new Date()
): GitaVerse {
  if (settings.pinnedVerseId) {
    const pinned = getVerseById(settings.pinnedVerseId);
    if (pinned) return pinned;
  }

  const allVerses = getAllVerses();
  if (settings.rotationMode === 'sequential') {
    const idx = ((settings.sequentialIndex % allVerses.length) + allVerses.length) % allVerses.length;
    return allVerses[idx];
  }

  if (settings.rotationMode === 'favorites') {
    const favVerses = bookmarks
      .map((id) => getVerseById(id))
      .filter((v): v is GitaVerse => Boolean(v));
    if (favVerses.length > 0) {
      const slot = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
      return favVerses[slot % favVerses.length];
    }
  }

  if (settings.rotationMode === 'every4h') {
    const pool = getPoolVerses(settings.pool);
    const slot = Math.floor(now.getTime() / (4 * 60 * 60 * 1000));
    return pool[((slot % pool.length) + pool.length) % pool.length];
  }

  return getVerseOfDay(now, settings.pool);
}

/**
 * Builds an offline WidgetKit timeline so Lock Screen & Home Screen widgets
 * rotate automatically for days without opening the app.
 */
export function buildWidgetTimelineEntries(
  settings: WidgetSettings,
  bookmarks: string[],
  now: Date = new Date()
): TimelineEntryData[] {
  if (settings.pinnedVerseId) {
    const pinned = getVerseById(settings.pinnedVerseId);
    if (pinned) {
      return [
        {
          date: now,
          props: formatVerseForWidget(pinned, settings, true),
        },
      ];
    }
  }

  if (settings.rotationMode === 'every4h') {
    const pool = getPoolVerses(settings.pool);
    const currentSlot = Math.floor(now.getTime() / (4 * 60 * 60 * 1000));
    const entries: TimelineEntryData[] = [];
    for (let i = 0; i < 18; i++) {
      const entryDate = i === 0 ? now : new Date((currentSlot + i) * 4 * 60 * 60 * 1000);
      const verse = pool[(currentSlot + i) % pool.length];
      entries.push({
        date: entryDate,
        props: formatVerseForWidget(verse, settings, false),
      });
    }
    return entries;
  }

  if (settings.rotationMode === 'sequential') {
    const allVerses = getAllVerses();
    const startIdx =
      ((settings.sequentialIndex % allVerses.length) + allVerses.length) % allVerses.length;
    const entries: TimelineEntryData[] = [];
    for (let i = 0; i < 14; i++) {
      const entryDate = i === 0 ? now : startOfLocalDay(now, i);
      const verse = allVerses[(startIdx + i) % allVerses.length];
      entries.push({
        date: entryDate,
        props: formatVerseForWidget(verse, settings, false),
      });
    }
    return entries;
  }

  if (settings.rotationMode === 'favorites') {
    const favVerses = bookmarks
      .map((id) => getVerseById(id))
      .filter((v): v is GitaVerse => Boolean(v));
    const source = favVerses.length > 0 ? favVerses : getCuratedVerses();
    const startSlot = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
    const entries: TimelineEntryData[] = [];
    for (let i = 0; i < 14; i++) {
      const entryDate = i === 0 ? now : startOfLocalDay(now, i);
      const verse = source[(startSlot + i) % source.length];
      entries.push({
        date: entryDate,
        props: formatVerseForWidget(verse, settings, false),
      });
    }
    return entries;
  }

  // Default: daily rotation for the next 14 days
  const entries: TimelineEntryData[] = [];
  for (let i = 0; i < 14; i++) {
    const entryDate = i === 0 ? now : startOfLocalDay(now, i);
    const verse = getVerseOfDay(entryDate, settings.pool);
    entries.push({
      date: entryDate,
      props: formatVerseForWidget(verse, settings, false),
    });
  }
  return entries;
}
