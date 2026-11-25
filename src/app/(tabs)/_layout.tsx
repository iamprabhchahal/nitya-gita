import { NativeTabs } from 'expo-router/native-tabs';
import React from 'react';

import { useAppTheme } from '@/theme/colors';

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <NativeTabs
      tintColor={theme.accent}
      backgroundColor={theme.tabBackground}
      indicatorColor={theme.tabIndicator}
      labelStyle={{
        default: { color: theme.inkMuted },
        selected: { color: theme.accent },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'sun.max', selected: 'sun.max.fill' }}
          md="wb_sunny"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chapters">
        <NativeTabs.Trigger.Label>Chapters</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'book.closed', selected: 'book.closed.fill' }}
          md="menu_book"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="saved">
        <NativeTabs.Trigger.Label>Saved</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'bookmark', selected: 'bookmark.fill' }}
          md="bookmark"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="widget">
        <NativeTabs.Trigger.Label>Widget</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'rectangle.on.rectangle.angled',
            selected: 'rectangle.on.rectangle.angled',
          }}
          md="widgets"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
