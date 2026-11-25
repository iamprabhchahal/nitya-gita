import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CelestialBackdrop } from '@/components/CelestialBackdrop';
import { GlassActionCluster, GlassPillButton } from '@/components/GlassPillButton';
import { LiquidGlassCard } from '@/components/LiquidGlassCard';
import { getCuratedTheme } from '@/data/curatedVerses';
import {
  getChapter,
  getNextVerse,
  getPrevVerse,
  getVerse,
} from '@/data/gitaRepository';
import { hapticSelection } from '@/services/haptics';
import { useNityaStore } from '@/store/useNityaStore';
import { useAppTheme } from '@/theme/colors';

export default function VerseDetailScreen() {
  const params = useLocalSearchParams<{ chapter: string; verse: string }>();
  const chNum = Number(params.chapter) || 2;
  const vNum = Number(params.verse) || 47;
  const currentVerse = getVerse(chNum, vNum) ?? getVerse(2, 47)!;

  return <VerseDetailContent key={currentVerse.id} currentVerse={currentVerse} />;
}

function VerseDetailContent({
  currentVerse,
}: {
  currentVerse: NonNullable<ReturnType<typeof getVerse>>;
}) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  const chapter = getChapter(currentVerse.chapter);
  const themeTag = getCuratedTheme(currentVerse.id);

  const {
    widgetSettings,
    reflections,
    isBookmarked,
    toggleBookmark,
    pinVerseToWidget,
    clearPinnedVerse,
    saveReflection,
    deleteReflection,
    markVerseRead,
  } = useNityaStore();

  const savedNote = reflections[currentVerse.id]?.text ?? '';
  const [noteDraft, setNoteDraft] = useState(savedNote);
  const [noteSavedToast, setNoteSavedToast] = useState(false);
  const [showCommentary, setShowCommentary] = useState(true);

  useEffect(() => {
    markVerseRead(currentVerse.id);
  }, [currentVerse.id, markVerseRead]);

  const bookmarked = isBookmarked(currentVerse.id);
  const isPinned = widgetSettings.pinnedVerseId === currentVerse.id;
  const prevVerse = getPrevVerse(currentVerse.id);
  const nextVerse = getNextVerse(currentVerse.id);

  const handleSaveNote = () => {
    saveReflection(currentVerse.id, noteDraft);
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 1800);
  };

  return (
    <CelestialBackdrop>
      <Stack.Screen
        options={{
          title: `BG ${currentVerse.id}`,
          headerTintColor: theme.ink,
        }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + 60,
              paddingBottom: insets.bottom + 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Verse Card */}
          <LiquidGlassCard style={styles.verseCard}>
            <View style={styles.metaRow}>
              <View style={[styles.refPill, { backgroundColor: theme.accentSoft }]}>
                <Text style={[styles.refText, { color: theme.accent }]}>
                  BHAGAVAD GITA {currentVerse.id}
                  {themeTag ? ` · ${themeTag}` : ''}
                </Text>
              </View>
            </View>

            {chapter ? (
              <Text style={[styles.chapterTitle, { color: theme.inkMuted }]}>
                Chapter {chapter.chapterNumber}: {chapter.translation} ({chapter.meaningEn})
              </Text>
            ) : null}

            <Text style={[styles.sanskrit, { color: theme.ink }]}>
              {currentVerse.slok}
            </Text>

            <Text style={[styles.transliteration, { color: theme.inkMuted }]}>
              {currentVerse.transliteration}
            </Text>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <Text style={[styles.langHeader, { color: theme.accent }]}>
              ENGLISH · SWAMI SIVANANDA
            </Text>
            <Text style={[styles.translation, { color: theme.ink }]}>
              {currentVerse.english}
            </Text>

            <Text style={[styles.langHeader, { color: theme.accent, marginTop: 8 }]}>
              हिन्दी · स्वामी तेजोमयानन्द
            </Text>
            <Text style={[styles.translation, { color: theme.inkSecondary }]}>
              {currentVerse.hindi}
            </Text>
          </LiquidGlassCard>

          {/* Actions */}
          <GlassActionCluster>
            <GlassPillButton
              label={isPinned ? 'Pinned to Lock Screen' : 'Pin to Lock Screen'}
              sfSymbol={isPinned ? 'pin.fill' : 'pin'}
              fallbackGlyph="📌"
              active={isPinned}
              onPress={() => {
                if (isPinned) {
                  clearPinnedVerse();
                } else {
                  pinVerseToWidget(currentVerse.id);
                }
              }}
            />
            <GlassPillButton
              label={bookmarked ? 'Saved' : 'Save'}
              sfSymbol={bookmarked ? 'bookmark.fill' : 'bookmark'}
              fallbackGlyph="🔖"
              active={bookmarked}
              onPress={() => toggleBookmark(currentVerse.id)}
            />
          </GlassActionCluster>

          {/* Commentary */}
          {currentVerse.commentary ? (
            <LiquidGlassCard style={styles.sectionCard} subtle>
              <Pressable
                onPress={() => {
                  void hapticSelection();
                  setShowCommentary((v) => !v);
                }}
                style={styles.collapseHeader}
              >
                <Text style={[styles.sectionTitle, { color: theme.ink }]}>
                  Swami Sivananda Commentary
                </Text>
                <SymbolView
                  name={showCommentary ? 'chevron.up' : 'chevron.down'}
                  size={14}
                  tintColor={theme.inkMuted}
                  fallback={
                    <Text style={{ color: theme.inkMuted }}>
                      {showCommentary ? '▲' : '▼'}
                    </Text>
                  }
                />
              </Pressable>
              {showCommentary ? (
                <Text style={[styles.commentary, { color: theme.inkSecondary }]}>
                  {currentVerse.commentary}
                </Text>
              ) : null}
            </LiquidGlassCard>
          ) : null}

          {/* Personal Reflection */}
          <LiquidGlassCard style={styles.sectionCard}>
            <View style={styles.reflectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.ink }]}>
                Personal Reflection
              </Text>
              {noteSavedToast ? (
                <Text style={[styles.savedToast, { color: theme.success }]}>
                  Saved locally ✓
                </Text>
              ) : null}
            </View>
            <TextInput
              value={noteDraft}
              onChangeText={setNoteDraft}
              placeholder="Write what this shloka means to you today..."
              placeholderTextColor={theme.inkMuted}
              multiline
              style={[
                styles.noteInput,
                {
                  color: theme.ink,
                  borderColor: theme.border,
                  backgroundColor: theme.glassTintSubtle,
                },
              ]}
            />
            <View style={styles.noteActions}>
              <GlassPillButton
                label="Save Reflection"
                sfSymbol="checkmark.circle.fill"
                fallbackGlyph="✓"
                compact
                active={noteDraft.trim().length > 0}
                onPress={handleSaveNote}
              />
              {savedNote ? (
                <GlassPillButton
                  label="Delete"
                  sfSymbol="trash"
                  fallbackGlyph="🗑"
                  compact
                  onPress={() => {
                    setNoteDraft('');
                    deleteReflection(currentVerse.id);
                  }}
                />
              ) : null}
            </View>
          </LiquidGlassCard>

          {/* Prev / Next Shloka Navigation */}
          <View style={styles.navRow}>
            <GlassPillButton
              label={`Prev (${prevVerse.id})`}
              sfSymbol="chevron.left"
              fallbackGlyph="‹"
              onPress={() =>
                router.replace(`/verse/${prevVerse.chapter}/${prevVerse.verse}`)
              }
            />
            <GlassPillButton
              label={`Next (${nextVerse.id})`}
              sfSymbol="chevron.right"
              fallbackGlyph="›"
              onPress={() =>
                router.replace(`/verse/${nextVerse.chapter}/${nextVerse.verse}`)
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </CelestialBackdrop>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  verseCard: {
    padding: 22,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  refText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chapterTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  sanskrit: {
    fontSize: 21,
    lineHeight: 33,
    fontWeight: '600',
    marginTop: 4,
  },
  transliteration: {
    fontSize: 13.5,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
  langHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  translation: {
    fontSize: 16.5,
    lineHeight: 24,
    fontWeight: '500',
  },
  sectionCard: {
    padding: 18,
    gap: 12,
  },
  collapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  commentary: {
    fontSize: 14,
    lineHeight: 21,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedToast: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  noteInput: {
    minHeight: 90,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    fontSize: 14.5,
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
