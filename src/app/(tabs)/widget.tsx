import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CelestialBackdrop } from '@/components/CelestialBackdrop';
import { GlassPillButton } from '@/components/GlassPillButton';
import { LiquidGlassCard } from '@/components/LiquidGlassCard';
import { WidgetLivePreview } from '@/components/WidgetLivePreview';
import { formatVerseForWidget, getTotalVersesCount } from '@/data/gitaRepository';
import { hapticSelection } from '@/services/haptics';
import { isNativeWidgetAvailable } from '@/services/widgetSync';
import { useNityaStore } from '@/store/useNityaStore';
import { useAppTheme } from '@/theme/colors';
import type { RotationMode, VersePool, WidgetScript } from '@/types/app';

const SCRIPT_OPTIONS: { value: WidgetScript; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'sanskrit', label: 'Sanskrit' },
  { value: 'hindi', label: 'हिन्दी' },
  { value: 'transliteration', label: 'IAST' },
];

const ROTATION_OPTIONS: { value: RotationMode; label: string; desc: string }[] = [
  { value: 'daily', label: 'Daily', desc: 'New shloka every midnight' },
  { value: 'every4h', label: 'Every 4 Hours', desc: 'Rotates throughout the day' },
  { value: 'sequential', label: 'Sequential', desc: 'Ch 1.1 → 18.78 in order' },
  { value: 'favorites', label: 'Saved Only', desc: 'Cycles your bookmarked verses' },
];

const REMINDER_TIMES: { hour: number; minute: number; label: string }[] = [
  { hour: 6, minute: 30, label: '6:30 AM' },
  { hour: 7, minute: 30, label: '7:30 AM' },
  { hour: 12, minute: 30, label: '12:30 PM' },
  { hour: 21, minute: 0, label: '9:00 PM' },
];

export default function WidgetStudioScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const {
    activeWidgetVerse,
    widgetSettings,
    reminderSettings,
    lastSyncStatus,
    updateWidgetSettings,
    clearPinnedVerse,
    syncWidgetNow,
    updateReminderSettings,
  } = useNityaStore();

  const [showGuide, setShowGuide] = useState(false);

  const isPinned = widgetSettings.pinnedVerseId !== null;
  const widgetProps = formatVerseForWidget(activeWidgetVerse, widgetSettings, isPinned);
  const nativeAvailable = isNativeWidgetAvailable();
  const totalVerses = getTotalVersesCount();

  const handleToggleReminder = async (enabled: boolean) => {
    const res = await updateReminderSettings({ enabled });
    if (enabled && !res.scheduled && res.reason) {
      Alert.alert('Daily Reminder', res.reason);
    }
  };

  const renderScriptChips = (
    selected: WidgetScript,
    onSelect: (value: WidgetScript) => void
  ) => (
    <View style={styles.chipRow}>
      {SCRIPT_OPTIONS.map((opt) => {
        const active = selected === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.accentSoft : 'transparent',
                borderColor: active ? theme.borderStrong : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: active ? theme.accent : theme.inkSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
          <Text style={[styles.screenTitle, { color: theme.ink }]}>Widget Studio</Text>
          <Text style={[styles.subtitle, { color: theme.inkMuted }]}>
            Live Lock Screen & Home Screen Preview
          </Text>
        </View>

        <WidgetLivePreview widgetProps={widgetProps} />

        {/* Pinned Verse Banner */}
        {isPinned ? (
          <LiquidGlassCard
            style={styles.pinnedBanner}
            tintColor={theme.accentSoft}
          >
            <View style={styles.pinnedBannerText}>
              <Text style={[styles.sectionLabel, { color: theme.accent }]}>
                PINNED TO LOCK SCREEN
              </Text>
              <Text style={[styles.pinnedValue, { color: theme.ink }]}>
                BG {activeWidgetVerse.id} — auto-rotation is paused while pinned
              </Text>
            </View>
            <GlassPillButton
              label="Unpin"
              sfSymbol="pin.slash"
              fallbackGlyph="✕"
              compact
              onPress={clearPinnedVerse}
            />
          </LiquidGlassCard>
        ) : null}

        {/* Script & Language Settings */}
        <LiquidGlassCard style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>
            Widget Script & Language
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.inkMuted }]}>
              Lock Screen (Rectangular & Inline)
            </Text>
            {renderScriptChips(widgetSettings.lockScreenScript, (lockScreenScript) =>
              updateWidgetSettings({ lockScreenScript })
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.inkMuted }]}>
              Home Screen Primary Line
            </Text>
            {renderScriptChips(widgetSettings.homeScreenPrimary, (homeScreenPrimary) =>
              updateWidgetSettings({ homeScreenPrimary })
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.inkMuted }]}>
              Home Screen Secondary Line (Medium)
            </Text>
            {renderScriptChips(widgetSettings.homeScreenSecondary, (homeScreenSecondary) =>
              updateWidgetSettings({ homeScreenSecondary })
            )}
          </View>
        </LiquidGlassCard>

        {/* Rotation Cadence & Pool */}
        <LiquidGlassCard style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>
            Offline Rotation Schedule
          </Text>
          <View style={styles.rotationGrid}>
            {ROTATION_OPTIONS.map((opt) => {
              const active = widgetSettings.rotationMode === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => updateWidgetSettings({ rotationMode: opt.value })}
                  style={[
                    styles.rotationCard,
                    {
                      backgroundColor: active ? theme.accentSoft : 'transparent',
                      borderColor: active ? theme.borderStrong : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.rotationLabel,
                      { color: active ? theme.accent : theme.ink },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={[styles.rotationDesc, { color: theme.inkMuted }]}>
                    {opt.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.inkMuted }]}>
              Verse Pool
            </Text>
            <View style={styles.chipRow}>
              {(
                [
                  { value: 'curated', label: 'Iconic Highlights' },
                  { value: 'all', label: `All ${totalVerses} Verses` },
                ] as { value: VersePool; label: string }[]
              ).map((opt) => {
                const active = widgetSettings.pool === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => updateWidgetSettings({ pool: opt.value })}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? theme.accentSoft : 'transparent',
                        borderColor: active ? theme.borderStrong : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? theme.accent : theme.inkSecondary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.syncRow}>
            <GlassPillButton
              label="Sync Widget Now"
              sfSymbol="arrow.triangle.2.circlepath"
              fallbackGlyph="↻"
              active
              onPress={() => {
                void syncWidgetNow();
              }}
            />
            <View style={styles.syncStatusBox}>
              <Text style={[styles.syncStatusTitle, { color: theme.ink }]}>
                {nativeAvailable ? 'WidgetKit Active' : 'Expo Go Preview Mode'}
              </Text>
              <Text style={[styles.syncStatusMeta, { color: theme.inkMuted }]}>
                {lastSyncStatus
                  ? `${lastSyncStatus.entryCount} timeline entries · ${new Date(
                      lastSyncStatus.syncedAt
                    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Ready to sync'}
              </Text>
            </View>
          </View>
        </LiquidGlassCard>

        {/* Offline Daily Reminder */}
        <LiquidGlassCard style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={[styles.sectionTitle, { color: theme.ink }]}>
                Daily Offline Reminder
              </Text>
              <Text style={[styles.fieldLabel, { color: theme.inkMuted }]}>
                Gentle local notification with today’s shloka
              </Text>
            </View>
            <Switch
              value={reminderSettings.enabled}
              onValueChange={handleToggleReminder}
              trackColor={{ true: theme.accent }}
            />
          </View>

          {reminderSettings.enabled ? (
            <View style={styles.chipRow}>
              {REMINDER_TIMES.map((slot) => {
                const active =
                  reminderSettings.hour === slot.hour &&
                  reminderSettings.minute === slot.minute;
                return (
                  <Pressable
                    key={slot.label}
                    onPress={() => {
                      void updateReminderSettings({
                        enabled: true,
                        hour: slot.hour,
                        minute: slot.minute,
                      });
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? theme.accentSoft : 'transparent',
                        borderColor: active ? theme.borderStrong : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: active ? theme.accent : theme.inkSecondary },
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </LiquidGlassCard>

        {/* Setup Guide */}
        <LiquidGlassCard style={styles.sectionCard} subtle>
          <Pressable
            onPress={() => {
              void hapticSelection();
              setShowGuide((v) => !v);
            }}
            style={styles.guideHeader}
          >
            <Text style={[styles.sectionTitle, { color: theme.ink }]}>
              Add Nitya Gita to iPhone Lock Screen
            </Text>
            <SymbolView
              name={showGuide ? 'chevron.up' : 'chevron.down'}
              size={14}
              tintColor={theme.inkMuted}
              fallback={<Text style={{ color: theme.inkMuted }}>{showGuide ? '▲' : '▼'}</Text>}
            />
          </Pressable>
          {showGuide ? (
            <View style={styles.guideSteps}>
              <Text style={[styles.guideStep, { color: theme.inkSecondary }]}>
                1. Build & install the native iOS app via EAS Build (`npx eas-cli@latest build --platform ios --profile preview`).
              </Text>
              <Text style={[styles.guideStep, { color: theme.inkSecondary }]}>
                2. Touch and hold your iPhone Lock Screen, then tap Customize → Lock Screen.
              </Text>
              <Text style={[styles.guideStep, { color: theme.inkSecondary }]}>
                3. Tap the widget tray below the clock (or the date row above it) and choose Nitya Gita.
              </Text>
              <Text style={[styles.guideStep, { color: theme.inkSecondary }]}>
                4. Tap any widget anytime to jump straight to that shloka and commentary.
              </Text>
            </View>
          ) : null}
        </LiquidGlassCard>
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
  pinnedBanner: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pinnedBannerText: {
    flex: 1,
    gap: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  pinnedValue: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  sectionCard: {
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rotationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rotationCard: {
    width: '48%',
    padding: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 3,
  },
  rotationLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  rotationDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  syncStatusBox: {
    flex: 1,
    gap: 2,
  },
  syncStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  syncStatusMeta: {
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchCopy: {
    flex: 1,
    gap: 2,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guideSteps: {
    gap: 8,
  },
  guideStep: {
    fontSize: 13.5,
    lineHeight: 20,
  },
});
