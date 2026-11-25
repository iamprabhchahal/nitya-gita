import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CelestialBackdrop } from '@/components/CelestialBackdrop';
import { GlassActionCluster, GlassPillButton } from '@/components/GlassPillButton';
import { LiquidGlassCard } from '@/components/LiquidGlassCard';
import { getCuratedTheme } from '@/data/curatedVerses';
import { formatVerseForWidget, getChapter } from '@/data/gitaRepository';
import { hapticSelection } from '@/services/haptics';
import { useNityaStore } from '@/store/useNityaStore';
import { useAppTheme } from '@/theme/colors';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Subha Prabhat · Morning';
  if (hour < 17) return 'Midday Contemplation';
  return 'Sandhya · Evening';
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const {
    activeWidgetVerse,
    widgetSettings,
    streak,
    isBookmarked,
    toggleBookmark,
    pinVerseToWidget,
    clearPinnedVerse,
    stepSequentialVerse,
    markVerseRead,
  } = useNityaStore();

  const [showHindi, setShowHindi] = useState(false);
  const [showCommentary, setShowCommentary] = useState(false);

  useEffect(() => {
    markVerseRead(activeWidgetVerse.id);
  }, [activeWidgetVerse.id, markVerseRead]);

  const chapter = getChapter(activeWidgetVerse.chapter);
  const themeTag = getCuratedTheme(activeWidgetVerse.id);
  const bookmarked = isBookmarked(activeWidgetVerse.id);
  const isPinned = widgetSettings.pinnedVerseId === activeWidgetVerse.id;
  const widgetPreview = formatVerseForWidget(activeWidgetVerse, widgetSettings, isPinned);

  return (
    <CelestialBackdrop>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Greeting & Streak */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.title, { color: theme.ink }]}>Nitya Gita</Text>
          </View>

          <Pressable
            onPress={() => {
              void hapticSelection();
              router.push('/(tabs)/saved');
            }}
          >
            <LiquidGlassCard style={styles.streakPill} interactive>
              <SymbolView
                name="flame.fill"
                size={15}
                tintColor={theme.accent}
                fallback={<Text style={{ color: theme.accent }}>🔥</Text>}
              />
              <Text style={[styles.streakText, { color: theme.ink }]}>
                {streak.currentStreak}d
              </Text>
            </LiquidGlassCard>
          </Pressable>
        </View>

        {/* Hero Shloka Card */}
        <LiquidGlassCard style={styles.heroCard}>
          <View style={styles.cardTopRow}>
            <View style={[styles.refBadge, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.refText, { color: theme.accent }]}>
                BG {activeWidgetVerse.id}
                {themeTag ? ` · ${themeTag}` : ''}
              </Text>
            </View>
            {isPinned ? (
              <Pressable
                onPress={clearPinnedVerse}
                style={[styles.pinnedBadge, { borderColor: theme.borderStrong }]}
              >
                <Text style={[styles.pinnedText, { color: theme.accent }]}>
                  Pinned · Tap to unpin
                </Text>
              </Pressable>
            ) : null}
          </View>

          {chapter ? (
            <Text style={[styles.chapterMeta, { color: theme.inkMuted }]}>
              Chapter {chapter.chapterNumber}: {chapter.translation} ({chapter.meaningEn})
            </Text>
          ) : null}

          <Text style={[styles.sanskritText, { color: theme.ink }]}>
            {activeWidgetVerse.slok}
          </Text>

          <Text style={[styles.translitText, { color: theme.inkMuted }]}>
            {activeWidgetVerse.transliteration}
          </Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.langToggleRow}>
            <Pressable
              onPress={() => {
                void hapticSelection();
                setShowHindi(false);
              }}
              style={[
                styles.langChip,
                !showHindi && { backgroundColor: theme.accentSoft },
              ]}
            >
              <Text
                style={[
                  styles.langChipText,
                  { color: !showHindi ? theme.accent : theme.inkMuted },
                ]}
              >
                English
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                void hapticSelection();
                setShowHindi(true);
              }}
              style={[
                styles.langChip,
                showHindi && { backgroundColor: theme.accentSoft },
              ]}
            >
              <Text
                style={[
                  styles.langChipText,
                  { color: showHindi ? theme.accent : theme.inkMuted },
                ]}
              >
                हिन्दी
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.translationText, { color: theme.ink }]}>
            {showHindi ? activeWidgetVerse.hindi : activeWidgetVerse.english}
          </Text>

          {activeWidgetVerse.commentary ? (
            <View style={styles.commentarySection}>
              <Pressable
                onPress={() => {
                  void hapticSelection();
                  setShowCommentary((v) => !v);
                }}
                style={styles.commentaryToggle}
              >
                <Text style={[styles.commentaryToggleText, { color: theme.accent }]}>
                  {showCommentary
                    ? 'Hide Swami Sivananda Commentary'
                    : 'Read Swami Sivananda Commentary'}
                </Text>
                <SymbolView
                  name={showCommentary ? 'chevron.up' : 'chevron.down'}
                  size={13}
                  tintColor={theme.accent}
                  fallback={
                    <Text style={{ color: theme.accent }}>
                      {showCommentary ? '▲' : '▼'}
                    </Text>
                  }
                />
              </Pressable>
              {showCommentary ? (
                <Text style={[styles.commentaryBody, { color: theme.inkSecondary }]}>
                  {activeWidgetVerse.commentary}
                </Text>
              ) : null}
            </View>
          ) : null}
        </LiquidGlassCard>

        {/* Tactile Liquid Glass Action Bar */}
        <GlassActionCluster style={styles.actions}>
          <GlassPillButton
            label={isPinned ? 'Pinned' : 'Pin to Lock Screen'}
            sfSymbol={isPinned ? 'pin.fill' : 'pin'}
            fallbackGlyph="📌"
            active={isPinned}
            onPress={() => {
              if (isPinned) {
                clearPinnedVerse();
              } else {
                pinVerseToWidget(activeWidgetVerse.id);
              }
            }}
          />
          <GlassPillButton
            label={bookmarked ? 'Saved' : 'Save'}
            sfSymbol={bookmarked ? 'bookmark.fill' : 'bookmark'}
            fallbackGlyph="🔖"
            active={bookmarked}
            onPress={() => toggleBookmark(activeWidgetVerse.id)}
          />
          <GlassPillButton
            label="Reflect"
            sfSymbol="square.and.pencil"
            fallbackGlyph="✏️"
            onPress={() =>
              router.push(
                `/verse/${activeWidgetVerse.chapter}/${activeWidgetVerse.verse}`
              )
            }
          />
          <GlassPillButton
            label="Next Shloka"
            sfSymbol="arrow.right.circle"
            fallbackGlyph="→"
            onPress={() => {
              const next = stepSequentialVerse();
              markVerseRead(next.id);
            }}
          />
        </GlassActionCluster>

        {/* Live Lock Screen Preview Strip */}
        <Pressable
          onPress={() => {
            void hapticSelection();
            router.push('/(tabs)/widget');
          }}
        >
          <LiquidGlassCard style={styles.lockStrip} subtle interactive>
            <View style={styles.lockStripHeader}>
              <Text style={[styles.lockStripLabel, { color: theme.accent }]}>
                ON YOUR LOCK SCREEN
              </Text>
              <Text style={[styles.lockStripLink, { color: theme.inkMuted }]}>
                Customize ›
              </Text>
            </View>
            <Text style={[styles.lockStripRef, { color: theme.inkMuted }]}>
              {widgetPreview.reference} · {widgetSettings.lockScreenScript.toUpperCase()}
            </Text>
            <Text style={[styles.lockStripQuote, { color: theme.ink }]} numberOfLines={2}>
              {widgetPreview.lockLine}
            </Text>
          </LiquidGlassCard>
        </Pressable>
      </ScrollView>
    </CelestialBackdrop>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.7,
    marginTop: 2,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
  },
  heroCard: {
    padding: 22,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  refBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  refText: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  pinnedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pinnedText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  chapterMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  sanskritText: {
    fontSize: 21,
    lineHeight: 33,
    fontWeight: '600',
    marginTop: 4,
  },
  translitText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  langToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  langChipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  translationText: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '500',
  },
  commentarySection: {
    marginTop: 6,
    gap: 8,
  },
  commentaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  commentaryToggleText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  commentaryBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    marginTop: 2,
  },
  lockStrip: {
    padding: 16,
    gap: 4,
  },
  lockStripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockStripLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  lockStripLink: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  lockStripRef: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  lockStripQuote: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
