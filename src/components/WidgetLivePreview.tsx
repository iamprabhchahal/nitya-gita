import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/theme/colors';
import type { GitaWidgetProps } from '@/types/app';
import { LiquidGlassCard } from './LiquidGlassCard';

interface WidgetLivePreviewProps {
  widgetProps: GitaWidgetProps;
}

export function WidgetLivePreview({ widgetProps }: WidgetLivePreviewProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      {/* iOS 26 Lock Screen Mockup */}
      <LiquidGlassCard style={styles.lockFrame} subtle>
        <LinearGradient
          colors={
            theme.mode === 'dark'
              ? ['#090E22', '#171C3B', '#231B36']
              : ['#332419', '#5A3B23', '#87542A']
          }
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.lockWallpaper}
        >
          <View style={styles.lockTopBadge}>
            <Text style={styles.lockInlineText} numberOfLines={1}>
              ॐ {widgetProps.reference} · {widgetProps.inlineText}
            </Text>
          </View>

          <Text style={styles.lockClock}>9:41</Text>

          <View style={styles.lockRectangularCard}>
            <Text style={styles.lockRectRef} numberOfLines={1}>
              {widgetProps.isPinned
                ? `${widgetProps.reference} · PINNED`
                : widgetProps.reference}
            </Text>
            <Text style={styles.lockRectBody} numberOfLines={3}>
              {widgetProps.lockLine}
            </Text>
          </View>
        </LinearGradient>
      </LiquidGlassCard>

      {/* Home Screen Small + Medium Previews */}
      <View style={styles.homeRow}>
        <LiquidGlassCard style={styles.homeSmallCard}>
          <LinearGradient
            colors={theme.widgetGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.homeCardInner}
          >
            <Text style={[styles.widgetRef, { color: theme.accent }]}>
              {widgetProps.reference}
            </Text>
            <Text
              style={[styles.homeSmallPrimary, { color: theme.ink }]}
              numberOfLines={4}
            >
              {widgetProps.homePrimary}
            </Text>
            <Text
              style={[styles.widgetFooter, { color: theme.inkMuted }]}
              numberOfLines={1}
            >
              {widgetProps.chapterName}
            </Text>
          </LinearGradient>
        </LiquidGlassCard>

        <LiquidGlassCard style={styles.homeMediumCard}>
          <LinearGradient
            colors={theme.widgetGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.homeCardInner}
          >
            <View style={styles.mediumHeader}>
              <Text style={[styles.widgetRef, { color: theme.accent }]}>
                BG {widgetProps.verseId}
              </Text>
              <Text
                style={[styles.widgetFooter, { color: theme.inkMuted }]}
                numberOfLines={1}
              >
                {widgetProps.chapterName}
              </Text>
            </View>
            <Text
              style={[styles.homeMediumPrimary, { color: theme.ink }]}
              numberOfLines={2}
            >
              {widgetProps.homePrimary}
            </Text>
            <Text
              style={[styles.homeMediumSecondary, { color: theme.inkSecondary }]}
              numberOfLines={2}
            >
              {widgetProps.homeSecondary}
            </Text>
          </LinearGradient>
        </LiquidGlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
  },
  lockFrame: {
    borderRadius: 28,
  },
  lockWallpaper: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  lockTopBadge: {
    maxWidth: '94%',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    marginBottom: 4,
  },
  lockInlineText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 12,
    fontWeight: '600',
  },
  lockClock: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 54,
    fontWeight: '300',
    letterSpacing: -1.5,
    marginBottom: 10,
  },
  lockRectangularCard: {
    width: '100%',
    maxWidth: 260,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    gap: 3,
  },
  lockRectRef: {
    color: 'rgba(255, 232, 198, 0.92)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  lockRectBody: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
  },
  homeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  homeSmallCard: {
    flex: 1,
    minHeight: 148,
    borderRadius: 22,
  },
  homeMediumCard: {
    flex: 1.55,
    minHeight: 148,
    borderRadius: 22,
  },
  homeCardInner: {
    flex: 1,
    padding: 13,
    justifyContent: 'space-between',
    gap: 6,
  },
  mediumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  widgetRef: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  homeSmallPrimary: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '600',
  },
  homeMediumPrimary: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  homeMediumSecondary: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  widgetFooter: {
    fontSize: 10.5,
    fontWeight: '600',
  },
});
