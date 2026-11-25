import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { GitaVerse } from '@/types/app';

const REMINDER_IDENTIFIER = 'nitya-gita-daily-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER);
  } catch {
    // Ignore if not scheduled
  }
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  verse: GitaVerse
): Promise<{ scheduled: boolean; reason?: string }> {
  if (Platform.OS === 'web') {
    return { scheduled: false, reason: 'Notifications are unavailable on web.' };
  }

  const granted = await ensureNotificationPermission();
  if (!granted) {
    return { scheduled: false, reason: 'Notification permission was denied.' };
  }

  await cancelDailyReminder();

  const trigger: Notifications.SchedulableNotificationTriggerInput =
    Platform.OS === 'ios'
      ? {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          repeats: true,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        };

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_IDENTIFIER,
    content: {
      title: `Daily Shloka · BG ${verse.id}`,
      body: verse.shortEnglish,
      data: {
        url: `nityagita://verse/${verse.chapter}/${verse.verse}`,
      },
    },
    trigger,
  });

  return { scheduled: true };
}
