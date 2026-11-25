import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const root = process.cwd();
const gitaPath = path.join(root, 'assets', 'data', 'gita.json');
const gita = JSON.parse(fs.readFileSync(gitaPath, 'utf8'));

const {
  getAllVerses,
  getChapters,
  getNextVerse,
  getPrevVerse,
  getVerse,
  searchVerses,
} = require(path.join(root, '.test-build', 'src', 'data', 'gitaRepository.js'));

const { CURATED_VERSES } = require(
  path.join(root, '.test-build', 'src', 'data', 'curatedVerses.js')
);

const {
  DEFAULT_WIDGET_SETTINGS,
  buildWidgetTimelineEntries,
  resolveActiveVerse,
} = require(path.join(root, '.test-build', 'src', 'services', 'widgetTimeline.js'));

const { INITIAL_STREAK_STATE, recordDailyRead } = require(
  path.join(root, '.test-build', 'src', 'services', 'streak.js')
);

test('offline gita.json contains all 18 chapters and 701 verses with Lock Screen fields', () => {
  assert.equal(gita.chapters.length, 18);
  assert.equal(gita.verses.length, 701);
  assert.equal(getChapters().length, 18);
  assert.equal(getAllVerses().length, 701);

  for (const v of gita.verses) {
    assert.ok(v.slok.length > 0, `Empty slok for ${v.id}`);
    assert.ok(v.transliteration.length > 0, `Empty transliteration for ${v.id}`);
    assert.ok(v.english.length > 0, `Empty english for ${v.id}`);
    assert.ok(v.hindi.length > 0, `Empty hindi for ${v.id}`);
    assert.ok(v.shortEnglish.length <= 120, `shortEnglish too long for ${v.id}`);
    assert.ok(v.inlineEnglish.length <= 50, `inlineEnglish too long for ${v.id}`);
  }
});

test('all curated verse IDs resolve to valid verses in gita.json', () => {
  assert.ok(CURATED_VERSES.length >= 60);
  const verseIds = new Set(gita.verses.map((v) => v.id));
  for (const item of CURATED_VERSES) {
    assert.ok(verseIds.has(item.id), `Missing curated verse ${item.id}`);
  }
});

test('gitaRepository supports reference lookup, multilingual search, and wrap navigation', () => {
  const v247 = getVerse(2, 47);
  assert.ok(v247);
  assert.equal(v247.id, '2.47');

  assert.equal(searchVerses('2.47')[0]?.id, '2.47');
  assert.equal(searchVerses('BG 2:47')[0]?.id, '2.47');
  assert.ok(searchVerses('action').length > 0);
  assert.ok(searchVerses('कर्म').length > 0);
  assert.ok(searchVerses('karmaṇy').length > 0);

  const first = getAllVerses()[0];
  const last = getAllVerses()[getAllVerses().length - 1];
  assert.equal(getNextVerse(last.id).id, first.id);
  assert.equal(getPrevVerse(first.id).id, last.id);
});

test('widgetTimeline builds valid offline timelines for every rotation mode', () => {
  const now = new Date(2026, 10, 25, 9, 30, 0);

  // Pinned mode
  const pinnedEntries = buildWidgetTimelineEntries(
    { ...DEFAULT_WIDGET_SETTINGS, pinnedVerseId: '2.47' },
    [],
    now
  );
  assert.equal(pinnedEntries.length, 1);
  assert.equal(pinnedEntries[0].props.verseId, '2.47');
  assert.equal(pinnedEntries[0].props.isPinned, true);
  assert.equal(pinnedEntries[0].props.deepLinkUrl, 'nityagita://verse/2/47');

  // Daily mode (14 days)
  const dailyEntries = buildWidgetTimelineEntries(DEFAULT_WIDGET_SETTINGS, [], now);
  assert.equal(dailyEntries.length, 14);
  assert.equal(dailyEntries[0].date.getTime(), now.getTime());
  assert.ok(dailyEntries[1].date > dailyEntries[0].date);

  // Every 4h mode (18 slots)
  const fourHourEntries = buildWidgetTimelineEntries(
    { ...DEFAULT_WIDGET_SETTINGS, rotationMode: 'every4h' },
    [],
    now
  );
  assert.equal(fourHourEntries.length, 18);
  assert.equal(
    fourHourEntries[2].date.getTime() - fourHourEntries[1].date.getTime(),
    4 * 60 * 60 * 1000
  );

  // Sequential wrap-around across 701 verses
  const seqEntries = buildWidgetTimelineEntries(
    { ...DEFAULT_WIDGET_SETTINGS, rotationMode: 'sequential', sequentialIndex: 700 },
    [],
    now
  );
  assert.equal(seqEntries[0].props.verseId, '18.78');
  assert.equal(seqEntries[1].props.verseId, '1.1');

  // Favorites with fallback when empty, and cycling when populated
  const emptyFavActive = resolveActiveVerse(
    { ...DEFAULT_WIDGET_SETTINGS, rotationMode: 'favorites' },
    [],
    now
  );
  assert.ok(emptyFavActive);

  const favEntries = buildWidgetTimelineEntries(
    { ...DEFAULT_WIDGET_SETTINGS, rotationMode: 'favorites' },
    ['2.47', '18.66'],
    now
  );
  assert.equal(favEntries.length, 14);
  assert.ok(['2.47', '18.66'].includes(favEntries[0].props.verseId));
});

test('streak updates cleanly on consecutive days, same day, and missed days', () => {
  const day1 = new Date(2026, 10, 20, 8, 0, 0);
  const day1Later = new Date(2026, 10, 20, 20, 0, 0);
  const day2 = new Date(2026, 10, 21, 7, 30, 0);
  const day4 = new Date(2026, 10, 23, 9, 0, 0);

  const s1 = recordDailyRead(INITIAL_STREAK_STATE, '2.47', day1);
  assert.equal(s1.currentStreak, 1);
  assert.equal(s1.longestStreak, 1);
  assert.deepEqual(s1.readVerseIds, ['2.47']);

  const s1Same = recordDailyRead(s1, '4.7', day1Later);
  assert.equal(s1Same.currentStreak, 1);
  assert.deepEqual(s1Same.readVerseIds, ['2.47', '4.7']);

  const s2 = recordDailyRead(s1Same, '18.66', day2);
  assert.equal(s2.currentStreak, 2);
  assert.equal(s2.longestStreak, 2);

  const s4 = recordDailyRead(s2, '1.1', day4);
  assert.equal(s4.currentStreak, 1);
  assert.equal(s4.longestStreak, 2);
});
