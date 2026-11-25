import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

import type { WidgetSettings, WidgetSyncStatus } from '@/types/app';
import { buildWidgetTimelineEntries } from './widgetTimeline';

export function isNativeWidgetAvailable(): boolean {
  if (Platform.OS !== 'ios') return false;
  try {
    return requireOptionalNativeModule('ExpoWidgets') != null;
  } catch {
    return false;
  }
}

export async function syncWidgetTimeline(
  settings: WidgetSettings,
  bookmarks: string[],
  now: Date = new Date()
): Promise<WidgetSyncStatus> {
  const entries = buildWidgetTimelineEntries(settings, bookmarks, now);
  const currentVerseId = entries[0]?.props.verseId ?? '2.47';
  const syncedAt = now.toISOString();

  if (!isNativeWidgetAvailable()) {
    return {
      synced: true,
      mode: 'preview',
      entryCount: entries.length,
      syncedAt,
      currentVerseId,
    };
  }

  try {
    // Dynamic require avoids importing ExpoWidgets native module in Expo Go
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const widgetModule = require('../widgets/GitaShlokaWidget');
    const widget = widgetModule.default;
    if (widget && typeof widget.updateTimeline === 'function') {
      widget.updateTimeline(entries);
    }
    return {
      synced: true,
      mode: 'native',
      entryCount: entries.length,
      syncedAt,
      currentVerseId,
    };
  } catch (err) {
    return {
      synced: false,
      mode: 'preview',
      entryCount: entries.length,
      syncedAt,
      currentVerseId,
      error: err instanceof Error ? err.message : 'Unable to update native widget.',
    };
  }
}
