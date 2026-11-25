import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = 'https://vedicscriptures.github.io';
const OUT_PATH = path.resolve(process.cwd(), 'assets', 'data', 'gita.json');
const CONCURRENCY = 12;

async function fetchJson(url, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
}

function cleanWhitespace(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function stripLeadingVerseRef(text, chapter, verse) {
  let out = cleanWhitespace(text);
  const ch = String(chapter);
  const v = String(verse);
  // Strip patterns like "2.47 ", "2.47:", "।।2.47।।", "||2.47||"
  const prefixPatterns = [
    new RegExp(`^[।|]*\\s*${ch}\\s*[.:-]\\s*${v}\\s*[।|.:-]*\\s*`),
    new RegExp(`^Verse\\s+${ch}\\s*[.:-]\\s*${v}\\s*[.:-]*\\s*`, 'i'),
  ];
  for (const re of prefixPatterns) {
    out = out.replace(re, '');
  }
  return out.replace(/\s*\|\|\s*$/, '').trim();
}

function cleanCommentary(text, chapter, verse) {
  let out = stripLeadingVerseRef(text, chapter, verse);
  // Normalize space before "Commentary" when Sivananda omits a newline
  out = out.replace(/\.Commentary\b/g, '.\n\nCommentary:\n');
  out = out.replace(/\bCommentary\s+/g, 'Commentary:\n');
  return cleanWhitespace(out);
}

function truncateClean(text, maxLength) {
  const flat = cleanWhitespace(text).replace(/\n+/g, ' ');
  if (flat.length <= maxLength) return flat;

  // Prefer breaking at sentence boundary if within reasonable length
  const slice = flat.slice(0, maxLength - 1);
  const sentenceEnd = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('; '),
    slice.lastIndexOf('। ')
  );
  if (sentenceEnd >= Math.floor(maxLength * 0.55)) {
    return slice.slice(0, sentenceEnd + 1).trim();
  }

  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace >= Math.floor(maxLength * 0.5) ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[,:;.\s]+$/, '')}…`;
}

function firstLineClean(text, maxLength) {
  const lines = cleanWhitespace(text)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const first = (lines[0] ?? '').replace(/\s*\|\|?.*$/, '').trim();
  return truncateClean(first || cleanWhitespace(text), maxLength);
}

async function runPool(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
  return results;
}

async function main() {
  console.log('Fetching Bhagavad Gita chapters...');
  const rawChapters = await fetchJson(`${BASE_URL}/chapters`);
  if (!Array.isArray(rawChapters) || rawChapters.length !== 18) {
    throw new Error(`Expected 18 chapters, got ${rawChapters?.length}`);
  }

  const chapters = rawChapters
    .map((ch) => ({
      chapterNumber: Number(ch.chapter_number),
      versesCount: Number(ch.verses_count),
      name: cleanWhitespace(ch.name),
      transliteration: cleanWhitespace(ch.transliteration),
      translation: cleanWhitespace(ch.translation),
      meaningEn: cleanWhitespace(ch.meaning?.en ?? ch.translation),
      meaningHi: cleanWhitespace(ch.meaning?.hi ?? ch.name),
      summaryEn: cleanWhitespace(ch.summary?.en ?? ''),
      summaryHi: cleanWhitespace(ch.summary?.hi ?? ''),
    }))
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const verseJobs = [];
  for (const ch of chapters) {
    for (let v = 1; v <= ch.versesCount; v++) {
      verseJobs.push({ chapter: ch.chapterNumber, verse: v });
    }
  }

  console.log(`Fetching ${verseJobs.length} verses with concurrency ${CONCURRENCY}...`);
  let completed = 0;
  const verses = await runPool(verseJobs, CONCURRENCY, async ({ chapter, verse }) => {
    const raw = await fetchJson(`${BASE_URL}/slok/${chapter}/${verse}`);
    completed++;
    if (completed % 100 === 0 || completed === verseJobs.length) {
      console.log(`Fetched ${completed}/${verseJobs.length} verses`);
    }

    const rawEn =
      raw.siva?.et ||
      raw.purohit?.et ||
      raw.gambir?.et ||
      raw.prabhu?.et ||
      raw.adi?.et ||
      '';
    const rawHi = raw.tej?.ht || raw.rams?.ht || raw.chinmay?.hc || '';
    const rawCommentary = raw.siva?.ec || raw.chinmay?.ec || raw.gambir?.ec || '';

    const slok = cleanWhitespace(raw.slok);
    const transliteration = cleanWhitespace(raw.transliteration);
    const english = stripLeadingVerseRef(rawEn, chapter, verse);
    const hindi = stripLeadingVerseRef(rawHi, chapter, verse);
    const commentary = cleanCommentary(rawCommentary, chapter, verse);

    if (!slok || !transliteration || !english || !hindi) {
      throw new Error(`Missing required translation fields for ${chapter}.${verse}`);
    }

    return {
      id: `${chapter}.${verse}`,
      chapter,
      verse,
      slok,
      transliteration,
      english,
      hindi,
      commentary,
      shortEnglish: truncateClean(english, 115),
      inlineEnglish: truncateClean(english, 44),
      shortSanskrit: firstLineClean(slok, 72),
      shortHindi: truncateClean(hindi, 115),
      shortTransliteration: firstLineClean(transliteration, 85),
    };
  });

  const payload = {
    source: 'vedicscriptures/bhagavad-gita',
    generatedAt: new Date().toISOString(),
    chapters,
    verses,
  };

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(payload), 'utf8');
  const stats = await fs.stat(OUT_PATH);
  console.log(
    `Wrote ${chapters.length} chapters and ${verses.length} verses to ${OUT_PATH} (${(
      stats.size /
      (1024 * 1024)
    ).toFixed(2)} MB)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
