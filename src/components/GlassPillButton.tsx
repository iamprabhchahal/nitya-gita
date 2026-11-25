import { GlassContainer } from 'expo-glass-effect';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { hapticImpactLight } from '@/services/haptics';
import { useAppTheme } from '@/theme/colors';
import { LiquidGlassCard, useCanUseLiquidGlass } from './LiquidGlassCard';

interface GlassPillButtonProps {
  label?: string;
  sfSymbol: SFSymbol;
  fallbackGlyph?: string;
  active?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export function GlassPillButton({
  label,
  sfSymbol,
  fallbackGlyph = '•',
  active = false,
  onPress,
  style,
  compact = false,
}: GlassPillButtonProps) {
  const theme = useAppTheme();

  const handlePress = () => {
    void hapticImpactLight();
    onPress();
  };

  const iconColor = active ? theme.accent : theme.ink;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label ?? sfSymbol}
    >
      <LiquidGlassCard
        interactive
        variant="regular"
        tintColor={active ? theme.accentSoft : undefined}
        style={[
          styles.pill,
          compact ? styles.pillCompact : styles.pillRegular,
          active && { borderColor: theme.borderStrong },
        ]}
      >
        <View style={styles.inner}>
          <SymbolView
            name={sfSymbol}
            size={compact ? 15 : 17}
            tintColor={iconColor}
            weight={active ? 'semibold' : 'medium'}
            fallback={
              <Text style={[styles.fallbackIcon, { color: iconColor }]}>
                {fallbackGlyph}
              </Text>
            }
          />
          {label ? (
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                compact && styles.labelCompact,
                { color: active ? theme.accent : theme.ink },
              ]}
            >
              {label}
            </Text>
          ) : null}
        </View>
      </LiquidGlassCard>
    </Pressable>
  );
}

export function GlassActionCluster({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const canGlass = useCanUseLiquidGlass();
  if (canGlass) {
    return (
      <GlassContainer spacing={10} style={[styles.cluster, style]}>
        {children}
      </GlassContainer>
    );
  }
  return <View style={[styles.cluster, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  pill: {
    borderRadius: 999,
  },
  pillRegular: {
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  pillCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  labelCompact: {
    fontSize: 13,
  },
  fallbackIcon: {
    fontSize: 15,
    fontWeight: '600',
  },
  cluster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
});
