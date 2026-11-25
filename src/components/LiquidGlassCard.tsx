import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
  type GlassStyle,
} from 'expo-glass-effect';
import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/theme/colors';

export function useCanUseLiquidGlass(): boolean {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled()
      .then((enabled) => {
        if (mounted) setReduceTransparency(enabled);
      })
      .catch(() => {});

    const sub = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      (enabled) => {
        setReduceTransparency(enabled);
      }
    );

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  if (Platform.OS !== 'ios' || reduceTransparency) {
    return false;
  }

  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

interface LiquidGlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: GlassStyle;
  interactive?: boolean;
  subtle?: boolean;
  tintColor?: string;
}

export function LiquidGlassCard({
  children,
  style,
  variant = 'regular',
  interactive = false,
  subtle = false,
  tintColor,
}: LiquidGlassCardProps) {
  const theme = useAppTheme();
  const canGlass = useCanUseLiquidGlass();
  const resolvedTint = tintColor ?? (subtle ? theme.glassTintSubtle : theme.glassTint);

  if (canGlass) {
    return (
      <GlassView
        glassEffectStyle={variant}
        tintColor={resolvedTint}
        isInteractive={interactive}
        colorScheme={theme.mode}
        style={[
          styles.base,
          { borderColor: theme.border },
          style,
        ]}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        styles.base,
        styles.fallbackShadow,
        {
          backgroundColor: subtle
            ? theme.fallbackSurface
            : theme.fallbackSurfaceElevated,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  fallbackShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
});
