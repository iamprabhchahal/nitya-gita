import gitaData from '../../assets/data/gita.json';
import type {
  GitaChapter,
  GitaDataset,
  GitaVerse,
  GitaWidgetProps,
  VersePool,
  WidgetScript,
  WidgetSettings,
} from '../types/app';
import { CURATED_VERSES } from './curatedVerses';

const dataset = gitaData as GitaDataset;

const CHAPTERS: GitaChapter[] = dataset.chapters;
const VERSES: GitaVerse[] = dataset.verses;

const chapterMap = new Map<number, GitaChapter>(
  CHAPTERS.map((chapter) => [chapter.chapterNumber, chapter])
);

const verseMap = new Map<string, GitaVerse>(VERSES.map((verse) => [verse.id, verse]));
const verseIndexMap = new Map<string, number>(VERSES.map((verse, idx) => [verse.id, idx]));

const versesByChapterMap = new Map<number, GitaVerse[]>();
for (const verse of VERSES) {
  const bucket = versesByChapterMap.get(verse.chapter);
  if (bucket) {
    bucket.push(verse);
  } else {
    versesByChapterMap.set(verse.chapter, [verse]);
  }
}

const CURATED_LIST: GitaVerse[] = CURATED_VERSES.map((item) => verseMap.get(item.id)).filter(
  (v): v is GitaVerse => Boolean(v)
);

export function getChapters(): GitaChapter[] {
  return CHAPTERS;
}

export function getChapter(chapterNumber: number): GitaChapter | undefined {
  return chapterMap.get(chapterNumber);
}

export function getVersesByChapter(chapterNumber: number): GitaVerse[] {
  return versesByChapterMap.get(chapterNumber) ?? [];
}

export function getVerse(chapter: number, verse: number): GitaVerse | undefined {
  return verseMap.get(`${chapter}.${verse}`);
}

export function getVerseById(id: string): GitaVerse | undefined {
  return verseMap.get(id);
}

export function getAllVerses(): GitaVerse[] {
  return VERSES;
}

export function getTotalVersesCount(): number {
  return VERSES.length;
}

export function getCuratedVerses(): GitaVerse[] {
  return CURATED_LIST;
}

export function getPoolVerses(pool: VersePool): GitaVerse[] {
  return pool === 'curated' && CURATED_LIST.length > 0 ? CURATED_LIST : VERSES;
}

export function getVerseIndex(id: string): number {
  return verseIndexMap.get(id) ?? 0;
}

export function getNextVerse(id: string): GitaVerse {
  const idx = verseIndexMap.get(id) ?? 0;
  return VERSES[(idx + 1) % VERSES.length];
}

export function getPrevVerse(id: string): GitaVerse {
  const idx = verseIndexMap.get(id) ?? 0;
  return VERSES[(idx - 1 + VERSES.length) % VERSES.length];
}

/**
 * Computes a deterministic day index from local calendar date so every day
 * advances smoothly across the chosen verse pool without network calls.
 */
export function getDayNumber(date: Date = new Date()): number {
  const utcDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(utcDay / 86_400_000);
}

export function getVerseOfDay(date: Date = new Date(), pool: VersePool = 'curated'): GitaVerse {
  const list = getPoolVerses(pool);
  const idx = ((getDayNumber(date) % list.length) + list.length) % list.length;
  return list[idx];
}

export function searchVerses(query: string, limit = 50): GitaVerse[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Direct reference lookup: "2.47", "2:47", "BG 2.47", "ch 2 v 47"
  const refMatch = trimmed.match(/^(?:bg\s*)?(\d{1,2})\s*[.:/\s-]\s*(\d{1,3})$/i);
  if (refMatch) {
    const ch = Number(refMatch[1]);
    const v = Number(refMatch[2]);
    const exact = getVerse(ch, v);
    if (exact) return [exact];
  }

  // Chapter-only numeric lookup like "2"
  if (/^\d{1,2}$/.test(trimmed)) {
    const ch = Number(trimmed);
    const chVerses = getVersesByChapter(ch);
    if (chVerses.length > 0) return chVerses.slice(0, limit);
  }

  const q = trimmed.toLowerCase();
  const matches: GitaVerse[] = [];
  for (const verse of VERSES) {
    if (
      verse.id.includes(q) ||
      verse.english.toLowerCase().includes(q) ||
      verse.transliteration.toLowerCase().includes(q) ||
      verse.hindi.toLowerCase().includes(q) ||
      verse.slok.toLowerCase().includes(q)
    ) {
      matches.push(verse);
      if (matches.length >= limit) break;
    }
  }
  return matches;
}

export function pickScriptText(
  verse: GitaVerse,
  script: WidgetScript,
  compact: boolean
): string {
  switch (script) {
    case 'sanskrit':
      return compact ? verse.shortSanskrit : verse.slok;
    case 'hindi':
      return compact ? verse.shortHindi : verse.hindi;
    case 'transliteration':
      return compact ? verse.shortTransliteration : verse.transliteration;
    case 'english':
    default:
      return compact ? verse.shortEnglish : verse.english;
  }
}

export function formatVerseForWidget(
  verse: GitaVerse,
  settings: Pick<WidgetSettings, 'lockScreenScript' | 'homeScreenPrimary' | 'homeScreenSecondary'>,
  isPinned: boolean
): GitaWidgetProps {
  const chapter = getChapter(verse.chapter);
  const inlineSource =
    settings.lockScreenScript === 'english'
      ? verse.inlineEnglish
      : pickScriptText(verse, settings.lockScreenScript, true).slice(0, 44);

  return {
    verseId: verse.id,
    chapter: verse.chapter,
    verse: verse.verse,
    reference: `BG ${verse.id}`,
    chapterName: chapter?.translation ?? `Chapter ${verse.chapter}`,
    lockLine: pickScriptText(verse, settings.lockScreenScript, true),
    inlineText: inlineSource,
    homePrimary: pickScriptText(verse, settings.homeScreenPrimary, true),
    homeSecondary: pickScriptText(verse, settings.homeScreenSecondary, true),
    deepLinkUrl: `nityagita://verse/${verse.chapter}/${verse.verse}`,
    isPinned,
  };
}
