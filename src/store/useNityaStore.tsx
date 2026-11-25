import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { getAllVerses, getNextVerse, getVerseById } from '@/data/gitaRepository';
import { hapticSelection, hapticSuccess } from '@/services/haptics';
import { cancelDailyReminder, scheduleDailyReminder } from '@/services/notifications';
import { INITIAL_STREAK_STATE, recordDailyRead } from '@/services/streak';
import { syncWidgetTimeline } from '@/services/widgetSync';
import { DEFAULT_WIDGET_SETTINGS, resolveActiveVerse } from '@/services/widgetTimeline';
import type {
  GitaVerse,
  ReflectionNote,
  ReminderSettings,
  StreakState,
  WidgetSettings,
  WidgetSyncStatus,
} from '@/types/app';

const STORAGE_KEY = '@nitya_gita_state_v1';

interface PersistedState {
  bookmarks: string[];
  reflections: Record<string, ReflectionNote>;
  streak: StreakState;
  widgetSettings: WidgetSettings;
  reminderSettings: ReminderSettings;
}

const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: false,
  hour: 7,
  minute: 0,
};

const DEFAULT_PERSISTED_STATE: PersistedState = {
  bookmarks: ['2.47', '4.7', '18.66'],
  reflections: {},
  streak: INITIAL_STREAK_STATE,
  widgetSettings: DEFAULT_WIDGET_SETTINGS,
  reminderSettings: DEFAULT_REMINDER_SETTINGS,
};

interface NityaStoreContextValue {
  hydrated: boolean;
  bookmarks: string[];
  reflections: Record<string, ReflectionNote>;
  streak: StreakState;
  widgetSettings: WidgetSettings;
  reminderSettings: ReminderSettings;
  lastSyncStatus: WidgetSyncStatus | null;
  activeWidgetVerse: GitaVerse;
  isBookmarked: (verseId: string) => boolean;
  toggleBookmark: (verseId: string) => void;
  saveReflection: (verseId: string, text: string) => void;
  deleteReflection: (verseId: string) => void;
  markVerseRead: (verseId: string) => void;
  pinVerseToWidget: (verseId: string) => void;
  clearPinnedVerse: () => void;
  stepSequentialVerse: () => GitaVerse;
  updateWidgetSettings: (patch: Partial<WidgetSettings>) => void;
  syncWidgetNow: () => Promise<WidgetSyncStatus>;
  updateReminderSettings: (
    patch: Partial<ReminderSettings>
  ) => Promise<{ scheduled: boolean; reason?: string }>;
}

const NityaStoreContext = createContext<NityaStoreContextValue | null>(null);

export function NityaStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(DEFAULT_PERSISTED_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<WidgetSyncStatus | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const persist = useCallback((next: PersistedState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const performSync = useCallback(
    async (settings: WidgetSettings, bookmarks: string[]) => {
      const status = await syncWidgetTimeline(settings, bookmarks);
      setLastSyncStatus(status);
      return status;
    },
    []
  );

  // Hydrate persisted state on launch
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<PersistedState>;
            const merged: PersistedState = {
              bookmarks: Array.isArray(parsed.bookmarks)
                ? parsed.bookmarks
                : DEFAULT_PERSISTED_STATE.bookmarks,
              reflections: parsed.reflections ?? {},
              streak: parsed.streak ?? INITIAL_STREAK_STATE,
              widgetSettings: {
                ...DEFAULT_WIDGET_SETTINGS,
                ...(parsed.widgetSettings ?? {}),
              },
              reminderSettings: {
                ...DEFAULT_REMINDER_SETTINGS,
                ...(parsed.reminderSettings ?? {}),
              },
            };
            setState(merged);
            void performSync(merged.widgetSettings, merged.bookmarks);
          } catch {
            void performSync(DEFAULT_WIDGET_SETTINGS, DEFAULT_PERSISTED_STATE.bookmarks);
          }
        } else {
          void performSync(DEFAULT_WIDGET_SETTINGS, DEFAULT_PERSISTED_STATE.bookmarks);
        }
        setHydrated(true);
      })
      .catch(() => {
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, [performSync]);

  // Handle tapping offline daily reminder notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === 'string' && url.startsWith('nityagita://verse/')) {
        const parts = url.replace('nityagita://verse/', '').split('/');
        if (parts.length === 2) {
          router.push(`/verse/${parts[0]}/${parts[1]}`);
        }
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const toggleBookmark = useCallback(
    (verseId: string) => {
      void hapticSelection();
      setState((prev) => {
        const exists = prev.bookmarks.includes(verseId);
        const bookmarks = exists
          ? prev.bookmarks.filter((id) => id !== verseId)
          : [verseId, ...prev.bookmarks];
        const next = { ...prev, bookmarks };
        persist(next);
        if (prev.widgetSettings.rotationMode === 'favorites') {
          void performSync(prev.widgetSettings, bookmarks);
        }
        return next;
      });
    },
    [performSync, persist]
  );

  const isBookmarked = useCallback(
    (verseId: string) => state.bookmarks.includes(verseId),
    [state.bookmarks]
  );

  const saveReflection = useCallback(
    (verseId: string, text: string) => {
      const trimmed = text.trim();
      void hapticSuccess();
      setState((prev) => {
        const nextReflections = { ...prev.reflections };
        if (!trimmed) {
          delete nextReflections[verseId];
        } else {
          nextReflections[verseId] = {
            verseId,
            text: trimmed,
            updatedAt: new Date().toISOString(),
          };
        }
        const next = { ...prev, reflections: nextReflections };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const deleteReflection = useCallback(
    (verseId: string) => {
      void hapticSelection();
      setState((prev) => {
        const nextReflections = { ...prev.reflections };
        delete nextReflections[verseId];
        const next = { ...prev, reflections: nextReflections };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const markVerseRead = useCallback(
    (verseId: string) => {
      setState((prev) => {
        const nextStreak = recordDailyRead(prev.streak, verseId);
        if (nextStreak === prev.streak) return prev;
        const next = { ...prev, streak: nextStreak };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateWidgetSettings = useCallback(
    (patch: Partial<WidgetSettings>) => {
      void hapticSelection();
      setState((prev) => {
        const widgetSettings = { ...prev.widgetSettings, ...patch };
        const next = { ...prev, widgetSettings };
        persist(next);
        void performSync(widgetSettings, prev.bookmarks);
        return next;
      });
    },
    [performSync, persist]
  );

  const pinVerseToWidget = useCallback(
    (verseId: string) => {
      void hapticSuccess();
      setState((prev) => {
        const widgetSettings: WidgetSettings = {
          ...prev.widgetSettings,
          pinnedVerseId: verseId,
        };
        const next = { ...prev, widgetSettings };
        persist(next);
        void performSync(widgetSettings, prev.bookmarks);
        return next;
      });
    },
    [performSync, persist]
  );

  const clearPinnedVerse = useCallback(() => {
    void hapticSelection();
    setState((prev) => {
      const widgetSettings: WidgetSettings = {
        ...prev.widgetSettings,
        pinnedVerseId: null,
      };
      const next = { ...prev, widgetSettings };
      persist(next);
      void performSync(widgetSettings, prev.bookmarks);
      return next;
    });
  }, [performSync, persist]);

  const stepSequentialVerse = useCallback((): GitaVerse => {
    const current = resolveActiveVerse(stateRef.current.widgetSettings, stateRef.current.bookmarks);
    const nextVerse = getNextVerse(current.id);
    const all = getAllVerses();
    const nextIdx = Math.max(
      0,
      all.findIndex((v) => v.id === nextVerse.id)
    );
    void hapticSelection();
    setState((prev) => {
      const widgetSettings: WidgetSettings = {
        ...prev.widgetSettings,
        pinnedVerseId: nextVerse.id,
        sequentialIndex: nextIdx,
      };
      const next = { ...prev, widgetSettings };
      persist(next);
      void performSync(widgetSettings, prev.bookmarks);
      return next;
    });
    return nextVerse;
  }, [performSync, persist]);

  const syncWidgetNow = useCallback(async () => {
    void hapticSuccess();
    return performSync(stateRef.current.widgetSettings, stateRef.current.bookmarks);
  }, [performSync]);

  const updateReminderSettings = useCallback(
    async (patch: Partial<ReminderSettings>) => {
      const current = stateRef.current;
      const nextReminder: ReminderSettings = {
        ...current.reminderSettings,
        ...patch,
      };

      if (!nextReminder.enabled) {
        await cancelDailyReminder();
        setState((prev) => {
          const next = { ...prev, reminderSettings: nextReminder };
          persist(next);
          return next;
        });
        return { scheduled: false };
      }

      const activeVerse =
        resolveActiveVerse(current.widgetSettings, current.bookmarks) ??
        getVerseById('2.47')!;
      const result = await scheduleDailyReminder(
        nextReminder.hour,
        nextReminder.minute,
        activeVerse
      );

      if (result.scheduled) {
        void hapticSuccess();
        setState((prev) => {
          const next = { ...prev, reminderSettings: nextReminder };
          persist(next);
          return next;
        });
      }
      return result;
    },
    [persist]
  );

  const activeWidgetVerse = useMemo(
    () => resolveActiveVerse(state.widgetSettings, state.bookmarks),
    [state.widgetSettings, state.bookmarks]
  );

  const value = useMemo<NityaStoreContextValue>(
    () => ({
      hydrated,
      bookmarks: state.bookmarks,
      reflections: state.reflections,
      streak: state.streak,
      widgetSettings: state.widgetSettings,
      reminderSettings: state.reminderSettings,
      lastSyncStatus,
      activeWidgetVerse,
      isBookmarked,
      toggleBookmark,
      saveReflection,
      deleteReflection,
      markVerseRead,
      pinVerseToWidget,
      clearPinnedVerse,
      stepSequentialVerse,
      updateWidgetSettings,
      syncWidgetNow,
      updateReminderSettings,
    }),
    [
      hydrated,
      state,
      lastSyncStatus,
      activeWidgetVerse,
      isBookmarked,
      toggleBookmark,
      saveReflection,
      deleteReflection,
      markVerseRead,
      pinVerseToWidget,
      clearPinnedVerse,
      stepSequentialVerse,
      updateWidgetSettings,
      syncWidgetNow,
      updateReminderSettings,
    ]
  );

  return (
    <NityaStoreContext.Provider value={value}>{children}</NityaStoreContext.Provider>
  );
}

export function useNityaStore(): NityaStoreContextValue {
  const ctx = useContext(NityaStoreContext);
  if (!ctx) {
    throw new Error('useNityaStore must be used inside NityaStoreProvider');
  }
  return ctx;
}
