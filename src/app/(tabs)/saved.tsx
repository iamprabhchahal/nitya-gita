import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CelestialBackdrop } from '@/components/CelestialBackdrop';
import { LiquidGlassCard } from '@/components/LiquidGlassCard';
import { getTotalVersesCount, getVerseById } from '@/data/gitaRepository';
import { hapticSelection } from '@/services/haptics';
import { useNityaStore } from '@/store/useNityaStore';
import { useAppTheme } from '@/theme/colors';
import type { GitaVerse, ReflectionNote } from '@/types/app';

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { bookmarks, reflections, streak, toggleBookmark } = useNityaStore();

  const [tab, setTab] = useState<'bookmarks' | 'reflections'>('bookmarks');

  const totalVerses = useMemo(() => getTotalVersesCount(), []);
  const readCount = streak.readVerseIds.length;
  const progressPct = Math.min(100, Math.round((readCount / totalVerses) * 100));

  const bookmarkedVerses = useMemo(
    () =>
      bookmarks
        .map((id) => getVerseById(id))
        .filter((v): v is GitaVerse => Boolean(v)),
    [bookmarks]
  );

  const reflectionList = useMemo(
    () =>
      Object.values(reflections).sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt)
      ),
    [reflections]
  );

  return (
    <CelestialBackdrop>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 14,
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={[styles.screenTitle, { color: theme.ink }]}>Saved</Text>
          <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
            Bookmarks, Reflections & Daily Sadhana
          </Text>
        </View>

        {/* Streak & Reading Progress Card */}
        <LiquidGlassCard style={styles.streakCard}>
          <View style={styles.streakStatsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.accent }]}>
                {streak.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.inkMuted }]}>
                Day Streak
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.ink }]}>
                {streak.longestStreak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.inkMuted }]}>
                Best Streak
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.ink }]}>
                {readCount}/{totalVerses}
              </Text>
              <Text style={[styles.statLabel, { color: theme.inkMuted }]}>
                Shlokas Read
              </Text>
            </View>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: theme.accentSoft }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.accent, width: `${Math.max(progressPct, 2)}%` },
              ]}
            />
          </View>
        </LiquidGlassCard>

        {/* Segmented Glass Switcher */}
        <LiquidGlassCard style={styles.segmentCard} subtle>
          <Pressable
            onPress={() => {
              void hapticSelection();
              setTab('bookmarks');
            }}
            style={[
              styles.segmentBtn,
              tab === 'bookmarks' && { backgroundColor: theme.accentSoft },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: tab === 'bookmarks' ? theme.accent : theme.inkMuted },
              ]}
            >
              Bookmarks ({bookmarkedVerses.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              void hapticSelection();
              setTab('reflections');
            }}
            style={[
              styles.segmentBtn,
              tab === 'reflections' && { backgroundColor: theme.accentSoft },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: tab === 'reflections' ? theme.accent : theme.inkMuted },
              ]}
            >
              Reflections ({reflectionList.length})
            </Text>
          </Pressable>
        </LiquidGlassCard>

        {tab === 'bookmarks' ? (
          bookmarkedVerses.length === 0 ? (
            <LiquidGlassCard style={styles.emptyCard} subtle>
              <Text style={[styles.emptyTitle, { color: theme.ink }]}>
                No saved shlokas yet
              </Text>
              <Text style={[styles.emptyBody, { color: theme.inkMuted }]}>
                Tap Save on any verse in Today or Chapters to build your personal collection.
              </Text>
            </LiquidGlassCard>
          ) : (
            <View style={styles.list}>
              {bookmarkedVerses.map((verse) => (
                <Pressable
                  key={verse.id}
                  onPress={() => {
                    void hapticSelection();
                    router.push(`/verse/${verse.chapter}/${verse.verse}`);
                  }}
                >
                  <LiquidGlassCard style={styles.itemCard} interactive>
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemRef, { color: theme.accent }]}>
                        BG {verse.id}
                      </Text>
                      <Pressable
                        onPress={() => toggleBookmark(verse.id)}
                        hitSlop={8}
                      >
                        <SymbolView
                          name="bookmark.fill"
                          size={16}
                          tintColor={theme.accent}
                          fallback={<Text style={{ color: theme.accent }}>🔖</Text>}
                        />
                      </Pressable>
                    </View>
                    <Text style={[styles.itemSanskrit, { color: theme.ink }]} numberOfLines={2}>
                      {verse.shortSanskrit}
                    </Text>
                    <Text
                      style={[styles.itemEnglish, { color: theme.inkSecondary }]}
                      numberOfLines={2}
                    >
                      {verse.english}
                    </Text>
                  </LiquidGlassCard>
                </Pressable>
              ))}
            </View>
          )
        ) : reflectionList.length === 0 ? (
          <LiquidGlassCard style={styles.emptyCard} subtle>
            <Text style={[styles.emptyTitle, { color: theme.ink }]}>
              No reflections written yet
            </Text>
            <Text style={[styles.emptyBody, { color: theme.inkMuted }]}>
              Open any shloka and jot down a brief personal reflection — it stays 100% private on your iPhone.
            </Text>
          </LiquidGlassCard>
        ) : (
          <View style={styles.list}>
            {reflectionList.map((note: ReflectionNote) => {
              const verse = getVerseById(note.verseId);
              return (
                <Pressable
                  key={note.verseId}
                  onPress={() => {
                    if (verse) {
                      void hapticSelection();
                      router.push(`/verse/${verse.chapter}/${verse.verse}`);
                    }
                  }}
                >
                  <LiquidGlassCard style={styles.itemCard} interactive>
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemRef, { color: theme.accent }]}>
                        BG {note.verseId}
                      </Text>
                      <Text style={[styles.noteDate, { color: theme.inkMuted }]}>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[styles.noteText, { color: theme.ink }]}>
                      {note.text}
                    </Text>
                    {verse ? (
                      <Text
                        style={[styles.itemEnglish, { color: theme.inkMuted }]}
                        numberOfLines={1}
                      >
                        “{verse.shortEnglish}”
                      </Text>
                    ) : null}
                  </LiquidGlassCard>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </CelestialBackdrop>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  headerBlock: {
    gap: 2,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  streakCard: {
    padding: 18,
    gap: 14,
  },
  streakStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  segmentCard: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: 16,
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  itemCard: {
    padding: 16,
    gap: 6,
    borderRadius: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemRef: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  itemSanskrit: {
    fontSize: 15.5,
    fontWeight: '600',
    lineHeight: 22,
  },
  itemEnglish: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  noteDate: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  noteText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
  },
});
