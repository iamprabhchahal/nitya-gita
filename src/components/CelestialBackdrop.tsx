import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme/colors';

interface CelestialBackdropProps {
  children: React.ReactNode;
}

export function CelestialBackdrop({ children }: CelestialBackdropProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orbTopRight,
          { backgroundColor: theme.orbPrimary },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orbMiddleLeft,
          { backgroundColor: theme.orbSecondary },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.orbBottomRight,
          { backgroundColor: theme.orbTertiary },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  orbTopRight: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  orbMiddleLeft: {
    position: 'absolute',
    top: '34%',
    left: -110,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  orbBottomRight: {
    position: 'absolute',
    bottom: -90,
    right: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
});
