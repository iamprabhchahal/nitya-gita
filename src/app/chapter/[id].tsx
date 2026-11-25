import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CelestialBackdrop } from '@/components/CelestialBackdrop';
import { LiquidGlassCard } from '@/components/LiquidGlassCard';
import { getCuratedTheme } from '@/data/curatedVerses';
import { getChapter, getVersesByChapter } from '@/data/gitaRepository';
import { hapticSelection } from '@/services/haptics';
import { useNityaStore } from '@/store/useNityaStore';
import { useAppTheme } from '@/theme/colors';
import type { GitaVerse } from '@/types/app';

export default function ChapterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { isBookmarked, streak } = useNityaStore();

  const [expandSummary, setExpandSummary] = useState(false);

  const chapterNumber = Number(id) || 1;
  const chapter = useMemo(() => getChapter(chapterNumber), [chapterNumber]);
  const verses = useMemo(() => getVersesByChapter(chapterNumber), [chapterNumber]);
  const readSet = useMemo(() => new Set(streak.readVerseIds), [streak.readVerseIds]);

  const renderVerse = ({ item }: { item: GitaVerse }) => {
    const saved = isBookmarked(item.id);
    const read = readSet.has(item.id);
    const tag = getCuratedTheme(item.id);

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
            <View style={styles.verseMetaLeft}>
              <Text style={[styles.verseRef, { color: theme.accent }]}>
                {item.id}
              </Text>
              {tag ? (
                <View style={[styles.tagPill, { backgroundColor: theme.accentSoft }]}>
                  <Text style={[styles.tagText, { color: theme.accent }]}>{tag}</Text>
                </View>
              ) : null}
              {read ? (
                <Text style={[styles.readLabel, { color: theme.success }]}>Read</Text>
              ) : null}
            </View>
            {saved ? (
              <SymbolView
                name="bookmark.fill"
                size={14}
                tintColor={theme.accent}
                fallback={<Text style={{ color: theme.accent }}>🔖</Text>}
              />
            ) : null}
          </View>
          <Text style={[styles.sanskrit, { color: theme.ink }]} numberOfLines={2}>
            {item.shortSanskrit}
          </Text>
          <Text style={[styles.english, { color: theme.inkSecondary }]} numberOfLines={2}>
            {item.english}
          </Text>
        </LiquidGlassCard>
      </Pressable>
    );
  };

  return (
    <CelestialBackdrop>
      <Stack.Screen
        options={{
          title: chapter ? `Chapter ${chapter.chapterNumber}` : 'Chapter',
          headerTintColor: theme.ink,
        }}
      />

      <FlatList
        data={verses}
        keyExtractor={(item) => item.id}
        renderItem={renderVerse}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 36,
          },
        ]}
        ListHeaderComponent={
          chapter ? (
            <LiquidGlassCard style={styles.heroCard}>
              <Text style={[styles.chapterNum, { color: theme.accent }]}>
                CHAPTER {chapter.chapterNumber} · {chapter.versesCount} SHLOKAS
              </Text>
              <Text style={[styles.chapterSanskrit, { color: theme.ink }]}>
                {chapter.name}
              </Text>
              <Text style={[styles.chapterTranslation, { color: theme.inkSecondary }]}>
                {chapter.translation} — {chapter.meaningEn}
              </Text>
              {chapter.summaryEn ? (
                <Pressable
                  onPress={() => {
                    void hapticSelection();
                    setExpandSummary((v) => !v);
                  }}
                >
                  <Text
                    style={[styles.summaryText, { color: theme.inkMuted }]}
                    numberOfLines={expandSummary ? undefined : 3}
                  >
                    {chapter.summaryEn}
                  </Text>
                  <Text style={[styles.expandLink, { color: theme.accent }]}>
                    {expandSummary ? 'Show less' : 'Read full chapter summary'}
                  </Text>
                </Pressable>
              ) : null}
            </LiquidGlassCard>
          ) : undefined
        }
      />
    </CelestialBackdrop>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  heroCard: {
    padding: 20,
    gap: 8,
    marginBottom: 8,
  },
  chapterNum: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  chapterSanskrit: {
    fontSize: 24,
    fontWeight: '800',
  },
  chapterTranslation: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 4,
  },
  expandLink: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 4,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
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
  verseMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verseRef: {
    fontSize: 13,
    fontWeight: '800',
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  readLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  sanskrit: {
    fontSize: 15.5,
    fontWeight: '600',
    lineHeight: 22,
  },
  english: {
    fontSize: 14,
    lineHeight: 20,
  },
});
