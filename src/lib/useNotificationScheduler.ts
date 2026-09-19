'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface StudyzNotificationItem {
  id: string;
  taskId?: string | null;
  type: 'TASK_REMINDER' | 'TASK_COMPLETED' | 'TASK_MISSED' | 'ACHIEVEMENT' | 'SYSTEM';
  title: string;
  message: string;
  link?: string | null;
  scheduledAt?: string | null;
  sentAt?: string | null;
  isRead: boolean;
  status: 'PENDING' | 'SENT' | 'CANCELLED' | 'MISSED';
  channel: string;
  createdAt: string;
  task?: {
    id: string;
    title: string;
    subject?: {
      name: string;
      color: string;
    } | null;
  } | null;
}

export interface NotificationSettings {
  taskRemindersEnabled: boolean;
  browserNotificationsEnabled: boolean;
  timezone: string;
}

/**
 * Plays the classic iPhone Tri-Tone bell ring notification sound (G5 -> C6 -> E6).
 */
export function playNotificationSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    // iPhone Tri-Tone bell frequencies (G5, C6, E6)
    const tones = [
      { freq: 783.99, delay: 0.0, duration: 0.4 },   // G5 (first bell tone)
      { freq: 1046.50, delay: 0.13, duration: 0.4 },  // C6 (second bell tone)
      { freq: 1318.51, delay: 0.26, duration: 0.65 }, // E6 (final ringing bell tone)
    ];

    tones.forEach(({ freq, delay, duration }) => {
      const startTime = now + delay;

      // Fundamental bell sine tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Bell metallic overtone for realistic bell resonance
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2.4, startTime);

      // Attack & exponential decay envelope for authentic bell chime sound
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      overtoneGain.gain.setValueAtTime(0.001, startTime);
      overtoneGain.gain.linearRampToValueAtTime(0.07, startTime + 0.005);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.4);

      osc.connect(gain);
      overtone.connect(overtoneGain);
      gain.connect(ctx.destination);
      overtoneGain.connect(ctx.destination);

      osc.start(startTime);
      overtone.start(startTime);
      osc.stop(startTime + duration + 0.05);
      overtone.stop(startTime + duration + 0.05);
    });
  } catch (err) {
    console.debug('iPhone notification chime unable to play:', err);
  }
}

export function useNotificationScheduler() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notifications, setNotifications] = useState<StudyzNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    taskRemindersEnabled: true,
    browserNotificationsEnabled: true,
    timezone: 'Asia/Kolkata',
  });
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const isPollingRef = useRef(false);

  // Initialize Service Worker and Permission
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setSwRegistration(reg);
        })
        .catch((err) => {
          console.debug('ServiceWorker registration fallback:', err);
        });
    }

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('studyz_notifications');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'NOTIFICATION_TRIGGERED') {
          // Another tab already showed this notification, just refresh local state without re-showing popup
          fetchNotifications();
        } else if (event.data?.type === 'NOTIFICATIONS_UPDATED') {
          fetchNotifications();
        }
      };
    }

    return () => {
      broadcastChannelRef.current?.close();
    };
  }, []);

  // Fetch notifications and settings from server
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
        setPendingCount(data.pendingCount || 0);
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.debug('Failed to fetch notifications:', err);
    }
  }, []);

  // Show native notification (Service Worker or Notification API)
  const showNativeNotification = useCallback(
    (title: string, message: string, link: string = '/tasks', taskId?: string | null) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      playNotificationSound();

      const tag = taskId ? `studyz-task-${taskId}` : `studyz-notif-${Date.now()}`;

      if (swRegistration && swRegistration.showNotification) {
        (swRegistration.showNotification as (title: string, options?: NotificationOptions & { vibrate?: number[] }) => Promise<void>)(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag,
          data: { url: link || '/tasks', taskId },
          vibrate: [200, 100, 200],
        });
      } else {
        try {
          const n = new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            tag,
          });
          n.onclick = () => {
            window.focus();
            window.location.href = link || '/tasks';
          };
        } catch (e) {
          console.debug('Direct Notification fallback error:', e);
        }
      }
    },
    [swRegistration]
  );

  // Process pending notifications
  const processAndPoll = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const res = await fetch('/api/notifications/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.triggered && data.triggered.length > 0) {
          // For each newly triggered notification, show native notification with deduplication
          for (const notif of data.triggered) {
            const lastShownKey = `studyz_shown_${notif.id}`;
            const alreadyShown = sessionStorage.getItem(lastShownKey);

            if (!alreadyShown) {
              sessionStorage.setItem(lastShownKey, String(Date.now()));
              showNativeNotification(notif.title, notif.message, notif.link || '/tasks', notif.taskId);

              // Broadcast to other tabs
              broadcastChannelRef.current?.postMessage({
                type: 'NOTIFICATION_TRIGGERED',
                id: notif.id,
              });
            }
          }
          fetchNotifications();
        }
      }
    } catch (err) {
      console.debug('Error in notification polling:', err);
    } finally {
      isPollingRef.current = false;
    }
  }, [showNativeNotification, fetchNotifications]);

  // Request browser permission
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Show initial welcome/confirmation notification
        showNativeNotification(
          'Notifications Enabled! 🔔',
          'STUDYZ will now notify you when your scheduled study tasks begin.',
          '/dashboard'
        );
      }

      return result;
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return 'denied';
    }
  }, [showNativeNotification]);

  // Mark single notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      try {
        await fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark_read', id }),
        });
        broadcastChannelRef.current?.postMessage({ type: 'NOTIFICATIONS_UPDATED' });
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },
    []
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      broadcastChannelRef.current?.postMessage({ type: 'NOTIFICATIONS_UPDATED' });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => {
      const wasUnread = notifications.find((n) => n.id === id && !n.isRead);
      return wasUnread ? Math.max(0, c - 1) : c;
    });

    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      broadcastChannelRef.current?.postMessage({ type: 'NOTIFICATIONS_UPDATED' });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [notifications]);

  // Send immediate test notification
  const sendTestNotification = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notifications/test', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showNativeNotification(
          data.notification?.title || 'Time to study 📚',
          data.notification?.message || 'Physics • Newton\'s Laws of Motion Practice is scheduled now.',
          '/tasks'
        );
        fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to send test notification:', err);
    } finally {
      setIsLoading(false);
    }
  }, [showNativeNotification, fetchNotifications]);

  // Update user notification settings
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));

      try {
        const res = await fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_settings',
            ...newSettings,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err) {
        console.error('Failed to update notification settings:', err);
      }
    },
    []
  );

  // Setup periodic heartbeat polling & on focus
  useEffect(() => {
    fetchNotifications();
    processAndPoll();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        processAndPoll();
      }
    }, 15000); // Poll every 15s

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        processAndPoll();
        fetchNotifications();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [fetchNotifications, processAndPoll]);

  return {
    permission,
    notifications,
    unreadCount,
    pendingCount,
    settings,
    isLoading,
    requestPermission,
    fetchNotifications,
    processAndPoll,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendTestNotification,
    updateSettings,
    showNativeNotification,
  };
}
