export type WidgetScript = 'english' | 'sanskrit' | 'hindi' | 'transliteration';

export type RotationMode = 'daily' | 'every4h' | 'sequential' | 'favorites';

export type VersePool = 'all' | 'curated';

export type GitaThemeTag =
  | 'Action'
  | 'Equanimity'
  | 'Devotion'
  | 'Self-Mastery'
  | 'Wisdom';

export interface GitaChapter {
  chapterNumber: number;
  versesCount: number;
  name: string;
  transliteration: string;
  translation: string;
  meaningEn: string;
  meaningHi: string;
  summaryEn: string;
  summaryHi: string;
}

export interface GitaVerse {
  id: string;
  chapter: number;
  verse: number;
  slok: string;
  transliteration: string;
  english: string;
  hindi: string;
  commentary: string;
  shortEnglish: string;
  inlineEnglish: string;
  shortSanskrit: string;
  shortHindi: string;
  shortTransliteration: string;
}

export interface GitaDataset {
  source: string;
  generatedAt: string;
  chapters: GitaChapter[];
  verses: GitaVerse[];
}

export interface WidgetSettings {
  lockScreenScript: WidgetScript;
  homeScreenPrimary: WidgetScript;
  homeScreenSecondary: WidgetScript;
  rotationMode: RotationMode;
  pool: VersePool;
  pinnedVerseId: string | null;
  sequentialIndex: number;
}

export interface ReflectionNote {
  verseId: string;
  text: string;
  updatedAt: string;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  readVerseIds: string[];
}

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface WidgetSyncStatus {
  synced: boolean;
  mode: 'native' | 'preview';
  entryCount: number;
  syncedAt: string;
  currentVerseId: string;
  error?: string;
}

export interface GitaWidgetProps {
  verseId: string;
  chapter: number;
  verse: number;
  reference: string;
  chapterName: string;
  lockLine: string;
  inlineText: string;
  homePrimary: string;
  homeSecondary: string;
  deepLinkUrl: string;
  isPinned: boolean;
}
