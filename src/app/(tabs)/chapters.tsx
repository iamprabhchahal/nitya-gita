import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CelestialBackdrop } from '@/components/CelestialBackdrop';
import { LiquidGlassCard } from '@/components/LiquidGlassCard';
import { getCuratedTheme } from '@/data/curatedVerses';
import {
  getChapters,
  getCuratedVerses,
  getTotalVersesCount,
  getVersesByChapter,
  searchVerses,
} from '@/data/gitaRepository';
import { hapticSelection } from '@/services/haptics';
import { useNityaStore } from '@/store/useNityaStore';
import { useAppTheme } from '@/theme/colors';
import type { GitaChapter, GitaVerse } from '@/types/app';

export default function ChaptersScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { streak, isBookmarked } = useNityaStore();

  const [query, setQuery] = useState('');
  const [curatedOnly, setCuratedOnly] = useState(false);

  const chapters = useMemo(() => getChapters(), []);
  const curatedVerses = useMemo(() => getCuratedVerses(), []);
  const totalVerses = useMemo(() => getTotalVersesCount(), []);
  const readSet = useMemo(() => new Set(streak.readVerseIds), [streak.readVerseIds]);

  const trimmed = query.trim();
  const searchResults = useMemo(() => {
    if (trimmed.length > 0) {
      const results = searchVerses(trimmed, 80);
      return curatedOnly ? results.filter((v) => getCuratedTheme(v.id) !== null) : results;
    }
    return curatedOnly ? curatedVerses : [];
  }, [trimmed, curatedOnly, curatedVerses]);

  const showVerseList = trimmed.length > 0 || curatedOnly;

  const renderChapter = ({ item }: { item: GitaChapter }) => {
    const chVerses = getVersesByChapter(item.chapterNumber);
    const readInChapter = chVerses.filter((v) => readSet.has(v.id)).length;

    return (
      <Pressable
        onPress={() => {
          void hapticSelection();
          router.push(`/chapter/${item.chapterNumber}`);
        }}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <LiquidGlassCard style={styles.chapterCard} interactive>
          <View style={[styles.chapterNumBox, { backgroundColor: theme.accentSoft }]}>
            <Text style={[styles.chapterNumText, { color: theme.accent }]}>
              {item.chapterNumber}
            </Text>
          </View>
          <View style={styles.chapterBody}>
            <Text style={[styles.chapterSanskrit, { color: theme.ink }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.chapterTitle, { color: theme.inkSecondary }]} numberOfLines={1}>
              {item.translation} · {item.meaningEn}
            </Text>
            <Text style={[styles.chapterMeta, { color: theme.inkMuted }]}>
              {item.versesCount} verses
              {readInChapter > 0 ? ` · ${readInChapter} read` : ''}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: theme.inkMuted }]}>›</Text>
        </LiquidGlassCard>
      </Pressable>
    );
  };

  const renderVerse = ({ item }: { item: GitaVerse }) => {
    const tag = getCuratedTheme(item.id);
    const saved = isBookmarked(item.id);

    return (
      <Pressable
        onPress={() => {
          void hapticSelection();
          router.push(`/verse/${item.chapter}/${item.verse}`);
        }}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <LiquidGlassCard style={styles.verseCard} interactive>
          <View style={styles.verseHeader}>
            <Text style={[styles.verseRef, { color: theme.accent }]}>
              BG {item.id}
              {tag ? ` · ${tag}` : ''}
            </Text>
            {saved ? (
              <SymbolView
                name="bookmark.fill"
                size={14}
                tintColor={theme.accent}
                fallback={<Text style={{ color: theme.accent }}>🔖</Text>}
              />
            ) : null}
          </View>
          <Text style={[styles.verseSanskrit, { color: theme.ink }]} numberOfLines={2}>
            {item.shortSanskrit}
          </Text>
          <Text style={[styles.verseEnglish, { color: theme.inkSecondary }]} numberOfLines={2}>
            {item.english}
          </Text>
        </LiquidGlassCard>
      </Pressable>
    );
  };

  return (
    <CelestialBackdrop>
      <View style={[styles.container, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerBlock}>
          <Text style={[styles.screenTitle, { color: theme.ink }]}>Chapters</Text>
          <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
            18 Chapters · {totalVerses} Shlokas Offline
          </Text>
        </View>

        {/* Search + Curated Toggle */}
        <View style={styles.searchSection}>
          <LiquidGlassCard style={styles.searchBar} subtle>
            <SymbolView
              name="magnifyingglass"
              size={16}
              tintColor={theme.inkMuted}
              fallback={<Text style={{ color: theme.inkMuted }}>🔍</Text>}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search 2.47, dharma, कर्म, Hindi, English..."
              placeholderTextColor={theme.inkMuted}
              style={[styles.searchInput, { color: theme.ink }]}
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCorrect={false}
            />
          </LiquidGlassCard>

          <Pressable
            onPress={() => {
              void hapticSelection();
              setCuratedOnly((prev) => !prev);
            }}
          >
            <LiquidGlassCard
              interactive
              tintColor={curatedOnly ? theme.accentSoft : undefined}
              style={[
                styles.filterChip,
                curatedOnly && { borderColor: theme.borderStrong },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: curatedOnly ? theme.accent : theme.inkSecondary },
                ]}
              >
                {curatedOnly
                  ? `Showing Iconic Highlights (${curatedVerses.length}) ✕`
                  : `Filter: Iconic Highlights (${curatedVerses.length})`}
              </Text>
            </LiquidGlassCard>
          </Pressable>
        </View>

        {showVerseList ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderVerse}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 110 },
            ]}
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
              <LiquidGlassCard style={styles.emptyCard} subtle>
                <Text style={[styles.emptyText, { color: theme.inkMuted }]}>
                  No shlokas matched “{trimmed}”. Try a reference like 2.47 or a keyword.
                </Text>
              </LiquidGlassCard>
            }
          />
        ) : (
          <FlatList
            data={chapters}
            keyExtractor={(item) => String(item.chapterNumber)}
            renderItem={renderChapter}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 110 },
            ]}
          />
        )}
      </View>
    </CelestialBackdrop>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlock: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
  },
  filterText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
    borderRadius: 20,
  },
  chapterNumBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterNumText: {
    fontSize: 17,
    fontWeight: '800',
  },
  chapterBody: {
    flex: 1,
    gap: 2,
  },
  chapterSanskrit: {
    fontSize: 16,
    fontWeight: '700',
  },
  chapterTitle: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  chapterMeta: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '400',
  },
  verseCard: {
    padding: 16,
    gap: 6,
    borderRadius: 20,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseRef: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  verseSanskrit: {
    fontSize: 15.5,
    fontWeight: '600',
    lineHeight: 22,
  },
  verseEnglish: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
