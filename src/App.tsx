import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Menu, 
  Heart, 
  Settings, 
  Plus, 
  History, 
  Smile, 
  Clock, 
  Check, 
  BookOpen, 
  ChevronRight,
  User,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  Star,
  CheckCircle2,
  Trash2,
  Zap,
  Info,
  Pencil,
  Bold,
  Italic,
  Underline,
  Code,
  Quote,
  List,
  Maximize2,
  Minimize2,
  Eye,
  Edit3,
  Eraser,
  FileText,
  Copy,
  Strikethrough,
  Palette,
  Bell,
  UserPlus,
  Image,
  Archive,
  MoreVertical,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Pin,
  Type,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Sub-components
import Sidebar from './components/Sidebar';
import BlockEditor from './components/BlockEditor';
import HabitCalendar from './components/HabitCalendar';
import AnalyticsCharts from './components/AnalyticsCharts';
import DatabaseView from './components/DatabaseView';
import PageIcon from './components/PageIcon';
import ActivityRecapView from './components/ActivityRecapView';
import TelegramBotView from './components/TelegramBotView';
import LiveDateTimeBanner from './components/LiveDateTimeBanner';
import AiAssistant from './components/AiAssistant';
import NotificationCenter from './components/NotificationCenter';
import Logo from './components/Logo';
import { TiptapEditor } from './components/TiptapEditor';
import SettingsModal from './components/SettingsModal';
import i18n from './i18n';

// Hardcoded state fallback
import { 
  INITIAL_PAGES, 
  INITIAL_HABITS, 
  INITIAL_TRACKING_DAYS, 
  INITIAL_DATABASE_ROWS 
} from './mockData';

import { Page, Block, Habit, TrackingDay, DatabaseRow, PageType, ActivityEntry, AppSettings, NotificationItem, NotificationSettings } from './types';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser, saveUserDataToCloud, fetchUserDataFromCloud, updateUserProfileName } from './lib/firebase';

export default function App() {
  const journalTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // --- FIREBASE AUTHENTICATION & CLOUD SYNC STATE ---
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDataLoadedFromCloud, setIsDataLoadedFromCloud] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // --- STATE INIT FROM LOCAL STORAGE ---
  const [pages, setPages] = useState<Page[]>(() => {
    const saved = localStorage.getItem('nt_pages');
    return saved ? JSON.parse(saved) : INITIAL_PAGES;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('nt_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [trackingDays, setTrackingDays] = useState<TrackingDay[]>(() => {
    const saved = localStorage.getItem('nt_tracking_days');
    return saved ? JSON.parse(saved) : INITIAL_TRACKING_DAYS;
  });

  const [databaseRows, setDatabaseRows] = useState<DatabaseRow[]>(() => {
    const saved = localStorage.getItem('nt_database_rows');
    return saved ? JSON.parse(saved) : INITIAL_DATABASE_ROWS;
  });

  const [activityRecaps, setActivityRecaps] = useState<Record<string, ActivityEntry[]>>(() => {
    const saved = localStorage.getItem('nt_activity_recaps');
    
    const initialData: Record<string, ActivityEntry[]> = {
      '2026-06-18': [
        { id: 'ss-18', startTime: '22:30', endTime: '07:00', description: 'Sleep Session', category: 'Sleep', notes: 'Cukup segar, langsung minum air putih.', isDefault: true, defaultType: 'sleep_session', didNotSleep: false }
      ],
      '2026-06-19': [
        { id: 'ss-19', startTime: '23:15', endTime: '06:45', description: 'Sleep Session', category: 'Sleep', notes: 'Udara pagi sangat dingin.', isDefault: true, defaultType: 'sleep_session', didNotSleep: false }
      ],
      '2026-06-20': [
        { id: 'ss-20', startTime: '22:45', endTime: '06:00', description: 'Sleep Session', category: 'Sleep', notes: 'Lelah setelah aktivitas seharian. Bangun pagi sekali untuk lari pagi.', isDefault: true, defaultType: 'sleep_session', didNotSleep: false }
      ],
      '2026-06-21': [
        { id: 'ss-21', startTime: '23:30', endTime: '07:15', description: 'Sleep Session', category: 'Sleep', notes: 'Tidur nyenyak.', isDefault: true, defaultType: 'sleep_session', didNotSleep: false }
      ],
      '2026-06-22': [
        { id: 'ss-22', startTime: '23:00', endTime: '06:30', description: 'Sleep Session', category: 'Sleep', notes: 'Membaca buku sebelum tidur.', isDefault: true, defaultType: 'sleep_session', didNotSleep: false },
        { id: 'act-22-1', startTime: '07:00', endTime: '07:30', description: 'Sarapan Pagi', category: 'Eating', notes: 'Makan nasi goreng hangat.', isDefault: false },
        { id: 'act-22-2', startTime: '08:00', endTime: '11:00', description: 'Belajar Kotlin', category: 'Study', notes: 'Belajar coroutines dan basic flow.', isDefault: false },
        { id: 'act-22-3', startTime: '12:00', endTime: '12:45', description: 'Makan Siang', category: 'Eating', notes: 'Makan bersama tim.', isDefault: false },
        { id: 'act-22-4', startTime: '13:00', endTime: '15:00', description: 'Kerja Projek Web', category: 'Work', notes: 'Menyelesaikan layout responsive sidebar.', isDefault: false },
        { id: 'act-22-5', startTime: '16:00', endTime: '17:30', description: 'Santai Main Game', category: 'Gaming', notes: 'Mabar bareng game klan.', isDefault: false }
      ]
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated: Record<string, ActivityEntry[]> = {};
        Object.entries(parsed).forEach(([dateStr, entries]) => {
          if (!Array.isArray(entries)) return;
          const hasOldSleep = entries.some(e => e.defaultType === 'wakeup' || e.defaultType === 'sleep');
          const hasSleepSession = entries.some(e => e.defaultType === 'sleep_session');
          
          if (hasOldSleep && !hasSleepSession) {
            const wu = entries.find(e => e.defaultType === 'wakeup');
            const sl = entries.find(e => e.defaultType === 'sleep');
            
            const startVal = sl ? sl.startTime : '';
            const endVal = wu ? wu.startTime : '';
            const notesVal = [wu?.notes, sl?.notes].filter(Boolean).join('. ');
            
            const sessionEntry: ActivityEntry = {
              id: `ss-${dateStr}`,
              startTime: startVal,
              endTime: endVal,
              description: 'Sleep Session',
              category: 'Sleep',
              notes: notesVal || undefined,
              isDefault: true,
              defaultType: 'sleep_session',
              didNotSleep: false
            };
            
            const rest = entries.filter(e => e.defaultType !== 'wakeup' && e.defaultType !== 'sleep');
            migrated[dateStr] = [sessionEntry, ...rest];
          } else {
            migrated[dateStr] = entries;
          }
        });
        return migrated;
      } catch (e) {
        return initialData;
      }
    }
    return initialData;
  });

  const [currentPageId, setCurrentPageId] = useState<string>(() => {
    return localStorage.getItem('nt_current_page_id') || 'pg-recap';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [deleteConfirmHabitId, setDeleteConfirmHabitId] = useState<string | null>(null);
  const [deleteConfirmHabitName, setDeleteConfirmHabitName] = useState<string>('');
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [journalViewMode, setJournalViewMode] = useState<'write' | 'preview'>('write');
  const [showFocusWriter, setShowFocusWriter] = useState(false);
  const [focusWriterTheme, setFocusWriterTheme] = useState<'warm' | 'dark' | 'grid'>('warm');
  const [copiedAlert, setCopiedAlert] = useState(false);
  const [isKeepEditorOpen, setIsKeepEditorOpen] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // --- NOTIFICATION ENGINE STATES ---
  interface ToastItem {
    id: string;
    title: string;
    message: string;
    type: 'todo' | 'habit' | 'activity' | 'custom';
  }

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('nt_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('nt_notification_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      enableDailyActivityReminder: true,
      dailyActivityReminderTime: '21:00',
      enableTodoReminder: true,
      todoReminderTime: '09:00',
      enableHabitReminder: true,
      habitReminderTime: '18:00',
    };
  });

  const [triggeredAlertsToday, setTriggeredAlertsToday] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('nt_triggered_alerts_today');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const todayStr = new Date().toISOString().split('T')[0];
        const filtered: Record<string, boolean> = {};
        Object.keys(parsed).forEach(key => {
          if (key.startsWith(todayStr)) {
            filtered[key] = parsed[key];
          }
        });
        return filtered;
      } catch (e) {
        // ignore
      }
    }
    return {};
  });

  const playNotificationChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24); // G5
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio chime prevented or unsupported by browser sandbox:", e);
    }
  };

  const triggerSystemNotification = (title: string, message: string) => {
    try {
      if (!('Notification' in window)) return;
      
      if (Notification.permission === 'granted') {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
              body: message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: 'workspace-notif',
              vibrate: [200, 100, 200],
              renotify: true
            } as any);
          }).catch(() => {
            new Notification(title, { body: message, icon: '/favicon.ico' });
          });
        } else {
          new Notification(title, { body: message, icon: '/favicon.ico' });
        }
      }
    } catch (err) {
      console.warn("System notification failed or blocked:", err);
    }
  };

  const triggerToastNotification = (
    title: string,
    message: string,
    type: 'todo' | 'habit' | 'activity' | 'custom'
  ) => {
    playNotificationChime();
    triggerSystemNotification(title, message);

    const toastId = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id: toastId, title, message, type }]);

    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 6000);
  };

  // Request system notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Native notification permission:', permission);
      });
    }
  }, []);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('nt_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          language: parsed.language === 'id' ? 'id' : 'en',
          profileName: parsed.profileName || ''
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      language: 'en',
      profileName: ''
    };
  });

  // Ensure no stale dark mode is left on root
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('nt_settings', JSON.stringify(settings));
    // Update i18n language
    i18n.changeLanguage(settings.language);
  }, [settings]);

  // --- FIREBASE AUTH LISTENER & INITIAL CLOUD SYNC ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setShowLoginModal(false); // Dismiss overlay instantly
        setAuthLoading(true);
        try {
          const res = await fetchUserDataFromCloud(currentUser.uid);
          if (res && res.isOffline) {
            console.warn("Running in offline mode. Continuing with local data backup.");
          } else if (res && res.exists && res.data) {
            const cloudData = res.data;
            if (cloudData.pages) setPages(cloudData.pages);
            if (cloudData.habits) setHabits(cloudData.habits);
            if (cloudData.trackingDays) setTrackingDays(cloudData.trackingDays);
            if (cloudData.databaseRows) setDatabaseRows(cloudData.databaseRows);
            if (cloudData.activityRecaps) setActivityRecaps(cloudData.activityRecaps);
            if (cloudData.settings) setSettings(cloudData.settings);
            if (cloudData.notifications) setNotifications(cloudData.notifications);
            if (cloudData.notificationSettings) setNotificationSettings(cloudData.notificationSettings);
          } else if (res && !res.exists && !res.isOffline) {
            // First time cloud user - start with fresh, completely empty default structures
            const cleanPages: Page[] = [
              { id: 'pg-1', title: 'Daily Habits Logger', icon: '📔', cover: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', type: 'tracker', isFavorite: true, createdAt: new Date().toISOString().split('T')[0] },
              { id: 'pg-2', title: 'Workspace Tracking Calendar', icon: '📅', cover: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', type: 'calendar', isFavorite: true, createdAt: new Date().toISOString().split('T')[0] },
              { id: 'pg-3', title: 'Productivity Analytics', icon: '📊', cover: 'linear-gradient(135deg, #fd1d1d 0%, #fcb045 100%)', type: 'analytics', isFavorite: true, createdAt: new Date().toISOString().split('T')[0] },
              { id: 'pg-4', title: 'Todo', icon: '🗂️', cover: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)', type: 'database', isFavorite: false, createdAt: new Date().toISOString().split('T')[0] },
              { id: 'pg-5', title: 'Catatan & Ide Kreatif', icon: '📝', cover: 'linear-gradient(135deg, #f1a7a1 0%, #f7dbbd 100%)', type: 'notes', isFavorite: false, createdAt: new Date().toISOString().split('T')[0], blocks: [] },
              { id: 'pg-6', title: 'Dashboard Kustom (Blank Canvas)', icon: '✨', cover: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', type: 'blank', isFavorite: false, createdAt: new Date().toISOString().split('T')[0], blocks: [] },
              { id: 'pg-recap', title: 'Daily Activity Recap', icon: '⏳', cover: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', type: 'recap', isFavorite: true, createdAt: new Date().toISOString().split('T')[0] }
            ];

            await saveUserDataToCloud(currentUser.uid, {
              pages: cleanPages,
              habits: INITIAL_HABITS,
              trackingDays: [],
              databaseRows: [],
              activityRecaps: {},
              settings: settings
            });

            setPages(cleanPages);
            setHabits(INITIAL_HABITS);
            setTrackingDays([]);
            setDatabaseRows([]);
            setActivityRecaps({});
          }
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          const isOffline = errMsg.toLowerCase().includes('offline') || 
                            errMsg.toLowerCase().includes('network') || 
                            errMsg.toLowerCase().includes('failed-precondition') ||
                            errMsg.toLowerCase().includes('unavailable');
          if (isOffline) {
            console.warn("Failed to set up user session data due to offline state. Continuing with local data.");
          } else {
            console.error("Error setting up user session data:", error);
          }
        } finally {
          setIsDataLoadedFromCloud(true);
          setAuthLoading(false);
          setShowLoginModal(false);
        }
      } else {
        setUser(null);
        setIsDataLoadedFromCloud(false);
        setAuthLoading(false);
        setShowLoginModal(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- AUTOMATIC CLOUD FIREBASE SYNC (DEBOUNCED) ---
  useEffect(() => {
    if (user && isDataLoadedFromCloud) {
      const delayDebounce = setTimeout(() => {
        saveUserDataToCloud(user.uid, {
          pages,
          habits,
          trackingDays,
          databaseRows,
          activityRecaps,
          settings,
          notifications,
          notificationSettings
        });
      }, 1200);
      return () => clearTimeout(delayDebounce);
    }
  }, [pages, habits, trackingDays, databaseRows, activityRecaps, settings, notifications, notificationSettings, user, isDataLoadedFromCloud]);

  // --- LOCAL STORAGE BACKUP EFFECTS ---
  useEffect(() => {
    localStorage.setItem('nt_pages', JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem('nt_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('nt_tracking_days', JSON.stringify(trackingDays));
  }, [trackingDays]);

  useEffect(() => {
    localStorage.setItem('nt_database_rows', JSON.stringify(databaseRows));
  }, [databaseRows]);

  useEffect(() => {
    localStorage.setItem('nt_current_page_id', currentPageId);
  }, [currentPageId]);

  useEffect(() => {
    localStorage.setItem('nt_activity_recaps', JSON.stringify(activityRecaps));
  }, [activityRecaps]);

  useEffect(() => {
    localStorage.setItem('nt_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('nt_notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem('nt_triggered_alerts_today', JSON.stringify(triggeredAlertsToday));
  }, [triggeredAlertsToday]);

  // Active page lookup helper
  const currentPage = pages.find(p => p.id === currentPageId) || pages[0] || INITIAL_PAGES[0];

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Today representation info
  const todayDateString = getTodayDateString();
  const todayTrackingData = trackingDays.find(d => d.date === todayDateString) || {
    date: todayDateString,
    habitsCompleted: [],
    mood: 'good',
    productiveHours: 5,
    notes: '',
    journalTitle: settings.language === 'id' ? 'Catatan Fokus Hari Ini' : "Today's Focus Log"
  } as TrackingDay;

  // --- AUTOMATED NOTIFICATION SCHEDULE ENGINE ---
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

      // 1. Daily Activity Logger Reminder Check
      if (notificationSettings.enableDailyActivityReminder) {
        const alertKey = `${todayStr}_activity`;
        if (timeStr === notificationSettings.dailyActivityReminderTime && !triggeredAlertsToday[alertKey]) {
          const todayActivities = activityRecaps[todayStr] || [];
          const customActivitiesCount = todayActivities.filter(a => !a.isDefault).length;
          
          if (customActivitiesCount === 0) {
            triggerToastNotification(
              settings.language === 'id' ? 'Catat Aktivitas Hari Ini!' : 'Log Today\'s Activities!',
              settings.language === 'id' 
                ? 'Hai, Anda belum mencatat aktivitas apa pun hari ini. Klik "Recap View" untuk mencatat!'
                : 'Hey, you haven\'t logged any activities or sleep session today. Click Recap View to update!',
              'activity'
            );
            setTriggeredAlertsToday(prev => ({ ...prev, [alertKey]: true }));
          }
        }
      }

      // 2. Todo/Task Deadline Reminder Check
      if (notificationSettings.enableTodoReminder) {
        const alertKey = `${todayStr}_todo`;
        if (timeStr === notificationSettings.todoReminderTime && !triggeredAlertsToday[alertKey]) {
          const dueTasks = databaseRows.filter(row => 
            row.dueDate === todayStr && 
            row.status !== 'Completed'
          );

          if (dueTasks.length > 0) {
            const taskTitles = dueTasks.map(t => t.title).join(', ');
            triggerToastNotification(
              settings.language === 'id' ? 'Tugas Jatuh Tempo Hari Ini!' : 'Tasks Due Today!',
              settings.language === 'id'
                ? `Tugas berikut harus diselesaikan hari ini: ${taskTitles}.`
                : `The following tasks are due today: ${taskTitles}.`,
              'todo'
            );
            setTriggeredAlertsToday(prev => ({ ...prev, [alertKey]: true }));
          }
        }
      }

      // 3. Habits Checklist Reminder Check
      if (notificationSettings.enableHabitReminder) {
        const alertKey = `${todayStr}_habit`;
        if (timeStr === notificationSettings.habitReminderTime && !triggeredAlertsToday[alertKey]) {
          const completedCount = todayTrackingData.habitsCompleted.length;
          const totalCount = habits.length;

          if (completedCount < totalCount) {
            const incompleteCount = totalCount - completedCount;
            triggerToastNotification(
              settings.language === 'id' ? 'Lengkapi Kebiasaan Harian!' : 'Complete Your Habits!',
              settings.language === 'id'
                ? `Masih ada ${incompleteCount} kebiasaan belum selesai. Ayo pertahankan core harian Anda!`
                : `You still have ${incompleteCount} incomplete habits today. Keep your daily streak going!`,
              'habit'
            );
            setTriggeredAlertsToday(prev => ({ ...prev, [alertKey]: true }));
          }
        }
      }
    };

    // Check immediately and then every 30 seconds
    checkSchedule();
    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, [notificationSettings, triggeredAlertsToday, databaseRows, activityRecaps, todayTrackingData, habits, settings.language]);

  const handleTriggerSimulation = (type: 'todo' | 'habit' | 'activity') => {
    if (type === 'activity') {
      triggerToastNotification(
        settings.language === 'id' ? 'Simulasi: Pengingat Aktivitas' : 'Simulation: Activity Reminder',
        settings.language === 'id'
          ? 'Hai! Ini adalah simulasi pengingat harian agar Anda tidak lupa mencatat waktu tidur dan log kegiatan hari ini.'
          : 'Hi! This is a simulation reminder to log your daily activities and sleep times today to preserve records.',
        'activity'
      );
    } else if (type === 'todo') {
      triggerToastNotification(
        settings.language === 'id' ? 'Simulasi: Pengingat Tugas' : 'Simulation: Task Reminder',
        settings.language === 'id'
          ? 'Tugas penting dideteksi mendekati batas waktu hari ini. Jangan lupa selesaikan!'
          : 'Crucial tasks are detected approaching their due dates today. Remember to mark as Completed!',
        'todo'
      );
    } else if (type === 'habit') {
      triggerToastNotification(
        settings.language === 'id' ? 'Simulasi: Pengingat Kebiasaan' : 'Simulation: Habit Streak Alert',
        settings.language === 'id'
          ? 'Selesaikan semua kebiasaan harian Anda sebelum hari berakhir untuk mempertahankan core streak!'
          : 'Complete all your daily habits before the day ends to preserve your streak!',
        'habit'
      );
    }
  };

  // --- COMPONENT HANDLERS ---

  // Handle updates to specific tracking days
  const handleUpdateTrackingDay = (updatedDay: TrackingDay) => {
    const exists = trackingDays.some(d => d.date === updatedDay.date);
    if (exists) {
      setTrackingDays(trackingDays.map(d => d.date === updatedDay.date ? updatedDay : d));
    } else {
      setTrackingDays([...trackingDays, updatedDay]);
    }
  };

  // Insert formatting at the current cursor / selection point inside today-journal-textarea
  const insertTextAtCursor = (before: string, after: string = '') => {
    const textarea = journalTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentNotes = todayTrackingData.notes || '';
    const selectedText = currentNotes.substring(start, end);
    
    const replacement = before + selectedText + after;
    const newNotes = currentNotes.substring(0, start) + replacement + currentNotes.substring(end);
    
    handleUpdateTrackingDay({
      ...todayTrackingData,
      notes: newNotes
    });
    
    // Auto refocus and restore optimal cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Convert markdown-like symbols to pretty HTML strings dynamically
  const parseMarkdownPreview = (text: string) => {
    if (!text) return '<p class="text-neutral-400 italic">Belum ada tulisan catatan harian. Klik tab "Tulis" atau klik "Fokus Menulis" untuk mulai mencatat...</p>';
    
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Replace basic formatting expressions
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/__([^_]+)__/g, '<u>$1</u>');
    html = html.replace(/~~([^~]+)~~/g, '<span class="line-through text-neutral-400">$1</span>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-[#F1F1F1] text-pink-600 px-1 py-0.5 rounded font-mono text-xs">$1</code>');
    
    // Highlights
    html = html.replace(/&lt;mark&gt;([\s\S]*?)&lt;\/mark&gt;/gi, '<span class="bg-yellow-100 border-b border-yellow-200 px-1 rounded">$1</span>');
    html = html.replace(/&lt;u&gt;([\s\S]*?)&lt;\/u&gt;/gi, '<span class="underline">$1</span>');

    // Paragraph structure
    const lines = html.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        return `<li class="ml-4 list-disc text-[#37352F] text-xs py-0.5">${line.substring(2)}</li>`;
      }
      if (trimmed.startsWith('&gt; ')) {
        return `<blockquote class="border-l-4 border-sky-400 pl-3 italic text-neutral-600 my-2 bg-sky-50/50 p-2 rounded-r-lg">${line.substring(5)}</blockquote>`;
      }
      if (trimmed === '---') {
        return `<hr class="border-t border-dashed border-[#EBEBEB] my-4" />`;
      }
      if (trimmed.startsWith('# ')) {
        return `<h1 class="text-lg font-bold text-[#37352F] mt-3 mb-1 font-display">${line.substring(2)}</h1>`;
      }
      return trimmed === '' ? '<div class="h-2"></div>' : `<p class="text-xs text-[#37352F] leading-relaxed py-0.5">${line}</p>`;
    });

    return processedLines.join('');
  };

  // --- APP SETTINGS ACTIONS & DATA PORTABILITY ---
  const handleUpdateProfileName = async (name: string) => {
    try {
      await updateUserProfileName(name);
      if (user) {
        setUser({ ...user, displayName: name });
      }
    } catch (err) {
      console.error("Error updating profile display name:", err);
    }
  };

  const handleImportData = (data: {
    pages: Page[];
    habits: Habit[];
    trackingDays: TrackingDay[];
    databaseRows: DatabaseRow[];
    activityRecaps: Record<string, ActivityEntry[]>;
    settings?: AppSettings;
  }) => {
    if (data.pages) setPages(data.pages);
    if (data.habits) setHabits(data.habits);
    if (data.trackingDays) setTrackingDays(data.trackingDays);
    if (data.databaseRows) setDatabaseRows(data.databaseRows);
    if (data.activityRecaps) setActivityRecaps(data.activityRecaps);
    if (data.settings) setSettings(data.settings);

    if (data.pages) localStorage.setItem('nt_pages', JSON.stringify(data.pages));
    if (data.habits) localStorage.setItem('nt_habits', JSON.stringify(data.habits));
    if (data.trackingDays) localStorage.setItem('nt_tracking_days', JSON.stringify(data.trackingDays));
    if (data.databaseRows) localStorage.setItem('nt_database_rows', JSON.stringify(data.databaseRows));
    if (data.activityRecaps) localStorage.setItem('nt_activity_recaps', JSON.stringify(data.activityRecaps));
    if (data.settings) localStorage.setItem('nt_settings', JSON.stringify(data.settings));
  };

  const handleResetAllData = async () => {
    localStorage.removeItem('nt_pages');
    localStorage.removeItem('nt_habits');
    localStorage.removeItem('nt_tracking_days');
    localStorage.removeItem('nt_database_rows');
    localStorage.removeItem('nt_activity_recaps');
    localStorage.removeItem('nt_settings');

    const cleanPages: Page[] = [
      { id: 'pg-1', title: 'Daily Habits Logger', icon: '📔', cover: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', type: 'tracker', isFavorite: true, createdAt: new Date().toISOString().split('T')[0] },
      { id: 'pg-2', title: 'Workspace Tracking Calendar', icon: '📅', cover: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', type: 'calendar', isFavorite: true, createdAt: new Date().toISOString().split('T')[0] },
      { id: 'pg-3', title: 'Productivity Analytics', icon: '📊', cover: 'linear-gradient(135deg, #fd1d1d 0%, #fcb045 100%)', type: 'analytics', isFavorite: true, createdAt: new Date().toISOString().split('T')[0] },
      { id: 'pg-4', title: 'Todo', icon: '🗂️', cover: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)', type: 'database', isFavorite: false, createdAt: new Date().toISOString().split('T')[0] },
      { id: 'pg-5', title: 'Catatan & Ide Kreatif', icon: '📝', cover: 'linear-gradient(135deg, #f1a7a1 0%, #f7dbbd 100%)', type: 'notes', isFavorite: false, createdAt: new Date().toISOString().split('T')[0], blocks: [] },
      { id: 'pg-6', title: 'Dashboard Kustom (Blank Canvas)', icon: '✨', cover: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', type: 'blank', isFavorite: false, createdAt: new Date().toISOString().split('T')[0], blocks: [] },
      { id: 'pg-recap', title: 'Daily Activity Recap', icon: '⏳', cover: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', type: 'recap', isFavorite: true, createdAt: new Date().toISOString().split('T')[0] }
    ];

    setPages(cleanPages);
    setHabits(INITIAL_HABITS);
    setTrackingDays([]);
    setDatabaseRows([]);
    setActivityRecaps({});
    setSettings({
      language: 'en',
      profileName: ''
    });

    if (user) {
      await saveUserDataToCloud(user.uid, {
        pages: cleanPages,
        habits: INITIAL_HABITS,
        trackingDays: [],
        databaseRows: [],
        activityRecaps: {},
        settings: {
          language: 'en',
          profileName: ''
        }
      });
    }
  };

  // Copy notes to clipboard with user visual indicator
  const handleTriggerCopyToClipboard = () => {
    if (todayTrackingData.notes) {
      navigator.clipboard.writeText(todayTrackingData.notes);
      setCopiedAlert(true);
      setTimeout(() => setCopiedAlert(false), 2000);
    }
  };

  // Switch today's habits
  const handleToggleTodayHabit = (habitId: string) => {
    const completed = todayTrackingData.habitsCompleted;
    const isChecked = completed.includes(habitId);
    const nextCompleted = isChecked 
      ? completed.filter(id => id !== habitId) 
      : [...completed, habitId];

    handleUpdateTrackingDay({
      ...todayTrackingData,
      habitsCompleted: nextCompleted
    });
  };

  // Modify today mood
  const handleSetTodayMood = (newMood: TrackingDay['mood']) => {
    handleUpdateTrackingDay({
      ...todayTrackingData,
      mood: newMood
    });
  };

  // Modify today productive duration
  const handleSetTodayHours = (hours: number) => {
    handleUpdateTrackingDay({
      ...todayTrackingData,
      productiveHours: hours
    });
  };

  // Modify page metadata inline (Title & icon)
  const handleUpdatePageMeta = (title: string, icon: string) => {
    setPages(pages.map(p => p.id === currentPage.id ? { ...p, title, icon } : p));
  };

  const handleToggleFavoritePage = (id: string) => {
    setPages(pages.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  // Create new page inside sidebar
  const handleCreateNewPage = (type: PageType) => {
    const newPageId = `pg-${Date.now()}`;
    const titles: Record<PageType, string> = {
      tracker: 'New Daily Habits Tracker',
      calendar: 'New Tracking Calendar',
      analytics: 'New Analytics Statistics',
      database: 'New Project Database',
      notes: 'New Blank Notes',
      blank: 'Custom Canvas Dashboard',
      recap: 'New Daily Activity Recap',
      telegram: 'Telegram AI Agent / Bot'
    };

    const icons: Record<PageType, string> = {
      tracker: '📔',
      calendar: '📅',
      analytics: '📊',
      database: '🗂️',
      notes: '📝',
      blank: '✨',
      recap: '⏳',
      telegram: '✈️'
    };

    const gradientCovers = [
      'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      'linear-gradient(135deg, #fddb92 0%, #d1f2ff 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
    ];

    const randomCover = gradientCovers[Math.floor(Math.random() * gradientCovers.length)];

    const newPage: Page = {
      id: newPageId,
      title: titles[type],
      icon: icons[type],
      cover: randomCover,
      type: type,
      isFavorite: false,
      createdAt: new Date().toISOString().split('T')[0],
      blocks: type === 'notes' ? [
        { id: 'b-1', type: 'h1', content: '💡 Catatan Baru' },
        { id: 'b-2', type: 'paragraph', content: 'Mulai menulis catatan di sini...' }
      ] : type === 'blank' ? [
        { id: 'b-1', type: 'h1', content: '✨ Halaman Kosong (Blank Page)' },
        { id: 'b-2', type: 'paragraph', content: 'Halaman kosong Notion-style Anda. Klik tombol "+" di sebelah kiri baris mana saja untuk menambahkan Tabel Dinamis, Grafik Visual, atau Jembatan Rangkuman antar halaman secara langsung!' }
      ] : undefined,
    };

    setPages([...pages, newPage]);
    setCurrentPageId(newPageId);
  };

  // Delete page logic
  const handleDeletePage = (id: string) => {
    const remains = pages.filter(p => p.id !== id);
    if (remains.length === 0) {
      alert('Cannot delete all pages. There must be at least one page registered.');
      return;
    }
    setPages(remains);
    if (currentPageId === id) {
      setCurrentPageId(remains[0].id);
    }
  };

  // Block change updates inside custom note page elements
  const handleUpdatePageBlocks = (pageId: string, updatedBlocks: Block[]) => {
    setPages(pages.map(p => p.id === pageId ? { ...p, blocks: updatedBlocks } : p));
  };

  const handleUpdateActivitiesForDate = (date: string, activities: ActivityEntry[]) => {
    setActivityRecaps(prev => ({
      ...prev,
      [date]: activities
    }));
  };

  // Create customized habit template settings
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('💪');

  const handleAddNewHabitTemplate = () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `hb-${Date.now()}`,
      name: newHabitName,
      icon: newHabitIcon,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      frequency: 'Daily'
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
    alert(`Habit "${newHabitName}" successfully added to the tracker templates!`);
  };

  const handleDeleteHabitTemplate = (id: string, e?: React.MouseEvent) => {
    if (habits.length <= 1) {
      alert('Must leave at least one active habit for tracking.');
      return;
    }
    const targetHabit = habits.find(h => h.id === id);
    if (!targetHabit) return;

    if (e && e.shiftKey) {
      setHabits(habits.filter(h => h.id !== id));
    } else {
      setDeleteConfirmHabitId(id);
      setDeleteConfirmHabitName(targetHabit.name);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      alert("Failed to sign out: " + error);
    }
  };

  const handleLogin = async () => {
    try {
      const loggedInUser = await loginWithGoogle();
      if (loggedInUser) {
        setUser(loggedInUser);
        setShowLoginModal(false);
      }
    } catch (error) {
      alert("Failed to login with Google: " + error);
    }
  };

  const t = (idText: string, enText: string) => {
    return settings.language === 'id' ? idText : enText;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-notion-text">
      
      {/* Notion Sidebar Panel */}
      <Sidebar
        pages={pages}
        currentPageId={currentPage.id}
        onSelectPage={setCurrentPageId}
        onAddPage={handleCreateNewPage}
        onDeletePage={handleDeletePage}
        onToggleFavorite={handleToggleFavoritePage}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        user={user}
        onLogout={handleLogout}
        settings={settings}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Notion Canvas viewport */}
      <main 
        onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}
        className="flex-1 flex flex-col h-full overflow-y-auto relative bg-white"
      >
        
        {/* Dynamic Cover Banner */}
        <div 
          className="w-full h-28 sm:h-44 relative bg-cover bg-center shrink-0" 
          style={{ backgroundImage: currentPage.cover, background: currentPage.cover }}
        >

          {/* Floating Change Cover Color Button with Pencil Icon */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
            <button
              onClick={() => setShowCoverPicker(!showCoverPicker)}
              className="flex items-center gap-1.5 bg-white/95 text-[#37352F] hover:bg-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-md shadow-[0_2px_8px_rgba(15,15,15,0.05)] border border-[#EBEBEB] cursor-pointer transition-colors select-none"
              title="Ganti Warna Cover"
            >
              <Pencil className="w-3.5 h-3.5 text-[#5F5E5B]" />
              <span className="hidden sm:inline">Ganti Warna</span>
            </button>

            {/* Gradient Selector Popover */}
            <AnimatePresence>
              {showCoverPicker && (
                <>
                  {/* Backdrop to close cleanly */}
                  <div 
                    className="fixed inset-0 z-30 bg-transparent cursor-default" 
                    onClick={() => setShowCoverPicker(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-9 bg-white border border-[#EBEBEB] rounded-lg shadow-[0_4px_20px_rgba(15,15,15,0.12)] p-4 w-64 z-40 space-y-3 text-xs font-sans text-[#37352F]"
                  >
                    <div className="font-bold text-[10px] text-[#787774] uppercase tracking-wider select-none pb-2 border-b border-[#F1F1F0]">
                      Pilih Gradasi Warna Cover
                    </div>
                    <div className="grid grid-cols-4 gap-2.5 pt-1">
                      {[
                        { name: 'Sakura Pink', value: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
                        { name: 'Serene Ocean', value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
                        { name: 'Amber Sunset', value: 'linear-gradient(135deg, #fddb92 0%, #d1f2ff 100%)' },
                        { name: 'Lavender Sky', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
                        { name: 'Mint Fresh', value: 'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)' },
                        { name: 'Cosmic Slate', value: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)' },
                        { name: 'Warm Peach', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
                        { name: 'Deep Nebula', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                        { name: 'Northern Lights', value: 'linear-gradient(135deg, #0575e6 0%, #00f260 100%)' },
                        { name: 'Midnight Blue', value: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' },
                        { name: 'Sunny Citrus', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
                        { name: 'Emerald Tea', value: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)' },
                        { name: 'Royal Velvet', value: 'linear-gradient(135deg, #130cb7 0%, #52e5e7 100%)' },
                        { name: 'Coral Bliss', value: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
                        { name: 'Plum Orchid', value: 'linear-gradient(135deg, #cc208e 0%, #6713d2 100%)' },
                        { name: 'Frosty Morning', value: 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)' },
                      ].map((cov) => (
                        <button
                          key={cov.name}
                          onClick={() => {
                            setPages(pages.map(p => p.id === currentPage.id ? { ...p, cover: cov.value } : p));
                            setShowCoverPicker(false);
                          }}
                          className={`w-11 h-11 rounded-md cursor-pointer border hover:scale-105 active:scale-95 transition-all outline-hidden relative group/item ${
                            currentPage.cover === cov.value ? 'ring-2 ring-[#0D7A5E]' : 'border-[#EBEBEB]'
                          }`}
                          style={{ background: cov.value }}
                          title={cov.name}
                        />
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Page Container */}
        <div className="px-4 sm:px-16 max-w-5xl w-full mx-auto flex-1 pb-16 relative">
          
          {/* Icon Badge Overlay with Vector Google Symbol Instead of Emoji */}
          <div className="absolute -top-10 sm:-top-12 left-4 sm:left-16 group select-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white border border-[#EBEBEB] shadow-md flex items-center justify-center shrink-0">
              <PageIcon type={currentPage.type} className="w-8 h-8 sm:w-10 sm:h-10 text-[#37352F]" />
            </div>
          </div>

          {/* Title Area and Metas */}
          <div className="pt-16 sm:pt-12 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              {/* In-place Editable Page Title */}
              <input
                id="active-page-title-input"
                type="text"
                value={currentPage.title}
                onChange={(e) => handleUpdatePageMeta(e.target.value, currentPage.icon)}
                className="text-2xl sm:text-3xl font-bold tracking-tight text-[#37352F] bg-transparent border-none outline-hidden p-0 w-full hover:bg-[#F1F1F1]/50 p-1 rounded transition-colors"
                placeholder="Judul Halaman Baru..."
              />
              
              {/* Meta actions (Favorites, configuration, notifications etc.) */}
              <div className="flex items-center gap-1.5 shrink-0 bg-[#F1F1F1] p-1 rounded-md border border-[#EBEBEB] w-fit">
                <NotificationCenter
                  notifications={notifications}
                  unreadCount={notifications.filter(n => !n.isRead).length}
                  settings={notificationSettings}
                  onUpdateSettings={setNotificationSettings}
                  onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
                  onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                  onClearAll={() => setNotifications([])}
                  onTriggerSimulation={handleTriggerSimulation}
                  language={settings.language}
                />

                <button
                  id="btn-header-favorite"
                  onClick={() => handleToggleFavoritePage(currentPage.id)}
                  className={`p-1.5 rounded transition-all ${
                    currentPage.isFavorite 
                      ? 'bg-white text-amber-500 shadow-sm border border-[#EBEBEB]' 
                      : 'text-[#37352F]/60 hover:bg-white hover:text-[#37352F]'
                  }`}
                  title={currentPage.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            </div>

            {/* Breadcrumbs / Page information block */}
            <div className="flex items-center gap-1.5 text-xs text-[#787774] font-sans">
              <span>{settings?.profileName ? `Ruang ${settings.profileName.split(' ')[0]}` : user?.displayName ? `Ruang ${user.displayName.split(' ')[0]}` : 'Ruang Tsaqif'}</span>
              <span className="opacity-30">/</span>
              <span className="font-medium bg-[#F1F1F1] text-[#37352F] px-2 py-0.5 rounded-sm border border-[#EBEBEB] uppercase text-[10px] tracking-wider">
                {currentPage.type} View
              </span>
            </div>
          </div>

          <hr className="border-t border-[#EBEBEB] my-4" />

          {/* --- DYNAMIC RENDER OF SPECIFIC TYPE VIEWS --- */}
          <div id="active-canvas-view">
            {currentPage.type === 'tracker' && (
              /* DOKUMEN: DAILY HABIT CHECKER PAGE VIEW (Indonesian styled tracker) */
              <div className="space-y-6">
                <LiveDateTimeBanner 
                  settings={settings} 
                  habits={habits} 
                  todayTrackingData={todayTrackingData} 
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Habits Checked checklist for today */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xs font-bold text-[#37352F] opacity-40 uppercase tracking-widest">
                        {settings.language === 'id' ? 'Rutinitas' : 'Routine List'}
                      </h2>
                      <button
                        id="btn-manage-habits"
                        onClick={() => setShowConfigModal(true)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#1A73E8] bg-blue-50/50 hover:bg-blue-50 hover:text-[#1557B0] border border-blue-100 rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{settings.language === 'id' ? 'Atur Rutinitas' : 'Manage Routine List'}</span>
                      </button>
                    </div>
                    
                    <div className="border border-[#EBEBEB] rounded-lg divide-y divide-[#EBEBEB] bg-white overflow-hidden">
                      {habits.map(h => {
                        const isDone = todayTrackingData.habitsCompleted.includes(h.id);

                        return (
                          <div
                            id={`card-today-habit-${h.id}`}
                            key={h.id}
                            onClick={() => handleToggleTodayHabit(h.id)}
                            className="flex items-center justify-between p-3.5 bg-white hover:bg-[#F7F7F5] cursor-pointer select-none transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-base bg-[#F1F1F1] p-1.5 rounded-md shrink-0">{h.icon}</span>
                              <div className="text-left">
                                <span className={`text-sm font-medium block leading-none ${
                                  isDone ? 'line-through text-[#787774] font-normal' : 'text-[#37352F]'
                                }`}>
                                  {h.name}
                                </span>
                                <span className="text-[10.5px] text-[#787774]">Frekuensi: {h.frequency}</span>
                              </div>
                            </div>
                            
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              isDone 
                                ? 'bg-[#448361] border-[#448361] text-white' 
                                : 'border-[#EBEBEB] hover:border-[#37352F] bg-white'
                            }`}>
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Catatan Harian Section - Google Keep Style */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-[#337EA9]" />
                        <h2 className="text-xs font-bold text-[#37352F] uppercase tracking-widest">
                          Daily Journal Notes
                        </h2>
                      </div>

                      {/* Google Keep-styled unclicked card */}
                      <div
                        id="keep-note-card"
                        onClick={() => setIsKeepEditorOpen(true)}
                        className="bg-white border border-[#EBEBEB] hover:border-neutral-350 hover:shadow-md transition-all rounded-xl p-4 cursor-pointer select-none relative overflow-hidden"
                      >
                        {todayTrackingData.journalTitle ? (
                          <h4 className="text-sm font-bold text-neutral-800 mb-1.5 font-sans leading-snug">
                            {todayTrackingData.journalTitle}
                          </h4>
                        ) : null}
                        
                        {todayTrackingData.notes ? (
                          <div 
                            className="prose prose-sm max-w-none text-neutral-700 text-xs font-sans leading-relaxed break-words tiptap-output"
                            dangerouslySetInnerHTML={{ 
                              __html: /<[a-z][\s\S]*>/i.test(todayTrackingData.notes) 
                                ? todayTrackingData.notes 
                                : parseMarkdownPreview(todayTrackingData.notes) 
                            }}
                          />
                        ) : (
                          <p className="text-xs text-[#787774] italic font-sans leading-relaxed">
                            Take a note...
                          </p>
                        )}
                      </div>

                      {/* --- GOOGLE KEEP STYLE NOTE EDITOR MODAL --- */}
                      <AnimatePresence>
                        {isKeepEditorOpen && (
                          <>
                            {/* Backdrop */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.5 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setIsKeepEditorOpen(false)}
                              className="fixed inset-0 bg-neutral-950/40 z-50 cursor-pointer backdrop-blur-xs"
                            />
                            {/* Keep Modal Content */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 30 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 30 }}
                              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] sm:max-w-xl bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh]"
                            >
                              {/* Header: Title and Pin */}
                              <div className="flex items-center justify-between p-4 pb-2">
                                <input
                                  id="keep-editor-title-input"
                                  type="text"
                                  value={todayTrackingData.journalTitle || ''}
                                  onChange={(e) => handleUpdateTrackingDay({ ...todayTrackingData, journalTitle: e.target.value })}
                                  placeholder="Title"
                                  className="w-full text-base font-bold text-neutral-800 placeholder-neutral-400 bg-transparent border-0 outline-hidden focus:ring-0 px-1 py-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Pinned visual feedback
                                  }}
                                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                                  title="Pin note"
                                >
                                  <Pin className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Body: Note Content Area */}
                              <div className="flex-1 overflow-y-auto px-4 pb-4">
                                <TiptapEditor
                                  value={todayTrackingData.notes || ''}
                                  onChange={(html) => handleUpdateTrackingDay({ ...todayTrackingData, notes: html })}
                                  placeholder="Notes..."
                                />
                              </div>

                              {/* Formatting Toolbar */}
                              <div className="border-t border-neutral-100 bg-neutral-50 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-neutral-400 select-none">
                                    Edited {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsKeepEditorOpen(false)}
                                    className="px-4 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-md transition-all cursor-pointer"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Right Column: Today Secondary metrics inputs (Mood & Hours) */}
                  <div className="space-y-6">
                    {/* Today Mood Card */}
                    <div className="bg-white border border-[#EBEBEB] rounded-lg p-4 space-y-3.5">
                      <div>
                        <h3 className="text-xs font-bold text-[#37352F] opacity-40 uppercase tracking-widest">Today's Mood Aura</h3>
                        <p className="text-[11px] text-[#787774] mt-0.5">How do you feel overall?</p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {[
                          { value: 'great', icon: '😊', bg: 'bg-[#E7F3EF] text-[#0D7A5E] border-[#E7F3EF]', label: 'Excellent / Focused' },
                          { value: 'good', icon: '🙂', bg: 'bg-indigo-50 text-indigo-800 border-indigo-100', label: 'Very Good / Cozy' },
                          { value: 'neutral', icon: '😐', bg: 'bg-[#F1F1F1] text-[#37352F] border-[#EBEBEB]', label: 'Neutral / Balanced' },
                          { value: 'tired', icon: '🥱', bg: 'bg-[#FDECC8] text-[#CB912F] border-[#FDECC8]', label: 'Tired / Sleep Deprived' },
                          { value: 'bad', icon: '☹️', bg: 'bg-[#FBEEEE] text-[#EB5757] border-[#FBEEEE]', label: 'Unwell / Feeling Down' }
                        ].map((moodItem) => {
                          const isSelected = todayTrackingData.mood === moodItem.value;

                          return (
                            <button
                              id={`btn-today-mood-${moodItem.value}`}
                              key={moodItem.value}
                              onClick={() => handleSetTodayMood(moodItem.value as any)}
                              className={`flex items-center gap-2.5 w-full text-left p-2 rounded text-xs font-medium border transition-colors ${
                                isSelected 
                                  ? `${moodItem.bg} font-semibold` 
                                  : 'bg-white border-[#EBEBEB] hover:bg-[#F7F7F5] text-[#37352F]/80'
                              }`}
                            >
                              <span className="text-sm shrink-0">{moodItem.icon}</span>
                              <span className="truncate">{moodItem.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Productive Hours Slider */}
                    <div className="bg-white border border-[#EBEBEB] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-[#37352F] opacity-40 uppercase tracking-widest">Focus Duration</h4>
                        <span className="text-[11px] font-bold font-mono text-[#337EA9] bg-[#F1F1F1] border border-[#EBEBEB] px-1.5 py-0.5 rounded">
                          {todayTrackingData.productiveHours} Hours
                        </span>
                      </div>
                      <p className="text-[11px] text-[#787774] leading-tight">Measure focus hours achieved today:</p>

                      <input
                        id="today-hours-slider"
                        type="range"
                        min="0"
                        max="12"
                        step="1"
                        value={todayTrackingData.productiveHours}
                        onChange={(e) => handleSetTodayHours(Number(e.target.value))}
                        className="w-full h-1 accent-[#337EA9] rounded cursor-pointer bg-[#F1F1F1] select-none"
                      />

                      <div className="flex justify-between text-[9px] text-[#787774] font-mono">
                        <span>Relaxed (0h)</span>
                        <span>Very Intense (12h)</span>
                      </div>
                    </div>

                    {/* Streak Summary */}
                    <div className="p-3.5 rounded-lg border border-[#EBEBEB] bg-[#F7F7F5] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-[#448361] uppercase block tracking-wider">Summary Info</span>
                        <p className="text-xs font-bold text-[#37352F]">Checklist Running Smoothly</p>
                        <span className="text-[10px] text-[#787774]">14 Days Open Without Interruption!</span>
                      </div>
                      <div className="text-2xl shrink-0">🚀</div>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {currentPage.type === 'calendar' && (
              /* DOKUMEN: TRACKING MONTHLY CALENDAR GRID VIEW */
              <HabitCalendar
                habits={habits}
                trackingDays={trackingDays}
                onUpdateDay={handleUpdateTrackingDay}
                settings={settings}
              />
            )}

            {currentPage.type === 'analytics' && (
              /* DOKUMEN: STATISTIK CHARTS VIEW */
              <AnalyticsCharts
                habits={habits}
                trackingDays={trackingDays}
              />
            )}

            {currentPage.type === 'database' && (
              /* DOKUMEN: PROJECTS KANBAN DATABASE */
              <DatabaseView
                rows={databaseRows}
                onUpdateRows={setDatabaseRows}
                settings={settings}
              />
            )}

            {currentPage.type === 'recap' && (
              <ActivityRecapView
                activityRecaps={activityRecaps}
                onUpdateActivities={handleUpdateActivitiesForDate}
                settings={settings}
              />
            )}

            {currentPage.type === 'telegram' && (
              <TelegramBotView
                habits={habits}
                onUpdateHabits={setHabits}
                todayTrackingData={todayTrackingData}
                onToggleTodayHabit={handleToggleTodayHabit}
                onSetTodayMood={handleSetTodayMood}
                onSetTodayHours={handleSetTodayHours}
                databaseRows={databaseRows}
                onUpdateDatabaseRows={setDatabaseRows}
                settings={settings}
              />
            )}

            {(currentPage.type === 'notes' || currentPage.type === 'blank') && (
              /* DOKUMEN: NOVEL OR BRAIN NOTES BLOCK EDITOR + BLANK CANVAS (UNIFIED) */
              <BlockEditor
                blocks={currentPage.blocks || []}
                onChangeBlocks={(newBlocks) => handleUpdatePageBlocks(currentPage.id, newBlocks)}
                pages={pages}
                habits={habits}
                trackingDays={trackingDays}
                databaseRows={databaseRows}
                onNavigatePage={(pageId) => setCurrentPageId(pageId)}
              />
            )}
          </div>

        </div>
      </main>

      {/* --- INLINE OVERLAY TEMPLATE CONFIG MODAL --- */}
      <AnimatePresence>
        {showConfigModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfigModal(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full sm:max-w-lg bg-white border border-notion-border rounded-xl shadow-2xl p-6 z-50 space-y-5 flex flex-col max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-notion-border pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚙️</span>
                  <div>
                    <h3 className="text-base font-bold text-neutral-800 font-display leading-none">Habits Template Configuration</h3>
                    <span className="text-[11px] text-notion-gray">Global list of habits to track on your daily calendar</span>
                  </div>
                </div>
                <button
                  id="btn-config-modal-close"
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition-all"
                >
                  Close
                </button>
              </div>

              {/* Lists of currently loaded habits templates */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Active Templates ({habits.length})
                  </label>
                  
                  <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-150 overflow-hidden text-xs bg-neutral-50/50">
                    {habits.map(h => (
                      <div 
                        id={`config-habit-${h.id}`}
                        key={h.id} 
                        className="flex items-center justify-between p-3 bg-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{h.icon}</span>
                          <span className="font-semibold text-neutral-700">{h.name}</span>
                          <span className="text-[10px] bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-neutral-600 leading-none">
                            {h.frequency}
                          </span>
                        </div>
                        
                        <button
                          id={`btn-config-delete-habit-${h.id}`}
                          onClick={(e) => handleDeleteHabitTemplate(h.id, e)}
                          className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                          title="Delete Habit Template (Hold Shift to delete instantly)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form to add a new habit to the roster */}
                <div className="bg-slate-50/80 border border-slate-200/70 p-4 rounded-xl space-y-3.5">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                    + Add New Habit Template
                  </span>
                  
                  <div className="flex gap-2">
                    {/* Emoji choice */}
                    <select
                      id="config-select-emoji"
                      value={newHabitIcon}
                      onChange={(e) => setNewHabitIcon(e.target.value)}
                      className="p-2 border border-neutral-250 bg-white rounded-lg text-sm cursor-pointer outline-hidden"
                    >
                      {['🏃‍♂️', '💧', '📚', '🧘', '💻', '🍎', '🥦', '🛌', '🚶', '🌱', '✍️', '💡', '⏰', '🔋', '⚽'].map(em => (
                        <option key={em} value={em}>{em}</option>
                      ))}
                    </select>

                    {/* Text input */}
                    <input
                      id="config-input-habit-name"
                      type="text"
                      placeholder="New habit name (e.g., walk 10m)..."
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 border border-neutral-250 bg-white rounded-lg outline-hidden text-neutral-700 placeholder-neutral-400"
                    />
                  </div>

                  <button
                    id="btn-config-save-new-habit"
                    onClick={handleAddNewHabitTemplate}
                    className="w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Save Habit Template
                  </button>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[10.5px] leading-tight text-indigo-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <span>
                  Adding or deleting templates here will update the checkboxes on today's and subsequent trackers, without deleting yesterday's historical logs.
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Habit Option Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmHabitId && (
          <div className="fixed inset-0 bg-black/45 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg border border-[#EBEBEB] p-5 max-w-sm w-full shadow-xl space-y-4 text-xs font-sans text-[#37352F]"
            >
              <div className="flex items-start gap-3 text-left">
                <span className="p-2 bg-rose-50 text-rose-500 rounded-full shrink-0">
                  <Trash2 className="w-5 h-5" />
                </span>
                <div className="space-y-1">
                  <h3 className="font-bold text-[13px] text-[#37352F]">{t('Hapus Templat Kebiasaan?', 'Delete Habit Template?')}</h3>
                  <p className="text-[#787774] leading-normal">
                    {t('Apakah Anda yakin ingin menghapus kebiasaan', 'Are you sure you want to delete the habit')} <strong className="text-[#37352F]">"{deleteConfirmHabitName}"</strong>? {t('Data catatan hari kemarin akan tetap tersimpan di dalam riwayat kalender Anda.', 'Yesterday\'s records will remain saved in your calendar history.')}
                  </p>
                  <div className="text-[10px] text-emerald-800 bg-emerald-50/50 p-1.5 rounded border border-emerald-100 flex items-center gap-1.5 mt-1 font-medium select-none">
                    <span>💡 Tip:</span> {t('Tahan tombol', 'Hold')} <kbd className="font-mono bg-white border border-emerald-200/60 px-1 rounded shadow-3xs font-bold text-[9px] cursor-help">Shift</kbd> {t('saat klik ikon Hapus untuk menghapus langsung tanpa konfirmasi ini.', 'when clicking Delete to delete instantly without this confirmation.')}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 text-[11px] font-semibold pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmHabitId(null)}
                  className="px-3.5 py-1.5 rounded border border-[#EBEBEB] text-[#37352F] hover:bg-[#F7F7F5] cursor-pointer transition-colors"
                >
                  {t('Batal', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHabits(habits.filter(h => h.id !== deleteConfirmHabitId));
                    setDeleteConfirmHabitId(null);
                  }}
                  className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors"
                >
                  {t('Hapus Templat', 'Delete Template')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mode Menulis Fokus (Distraction-Free Focus Workspace Modal) */}
      <AnimatePresence>
        {showFocusWriter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xs overflow-hidden select-none"
          >
            {/* Main Desk Container */}
            <div className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 md:p-10 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className={`w-full max-w-4xl rounded-2xl border flex flex-col overflow-hidden min-h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-300 ${
                  focusWriterTheme === 'warm'
                    ? 'bg-[#FDFBF7] border-[#EAE3D2] text-[#3E382B]'
                    : focusWriterTheme === 'dark'
                      ? 'bg-[#191919] border-[#2E2E2E] text-[#E5E5E5]'
                      : 'bg-[#FAFBFD] border-[#DCE4EC] text-[#2C3E50] bg-[linear-gradient(to_right,#e2e9f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e9f0_1px,transparent_1px)] bg-[size:16px_16px]'
                }`}
              >
                {/* Focus Desk Header */}
                <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 select-none ${
                  focusWriterTheme === 'warm'
                    ? 'border-[#EAE3D2] bg-[#FAF8F2]'
                    : focusWriterTheme === 'dark'
                      ? 'border-[#2E2E2E] bg-[#1F1F1F]'
                      : 'border-[#DCE4EC] bg-[#F2F6FA]/80'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-emerald-500 text-white rounded text-[10px] font-extrabold font-mono tracking-wider uppercase animate-pulse">
                      Live Focus Mode
                    </span>
                    <span className={`text-[11px] font-semibold ${
                      focusWriterTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
                    }`}>
                      Menulis Tanpa Gangguan — <span className="underline font-mono">{todayTrackingData.date}</span>
                    </span>
                  </div>

                  {/* Desk Theme Switchers & Back Action */}
                  <div className="flex items-center gap-2.5">
                    {/* Theme Buttons */}
                    <div className={`flex items-center p-0.5 rounded-lg border text-[10px] font-bold ${
                      focusWriterTheme === 'dark' 
                        ? 'bg-neutral-800 border-neutral-700' 
                        : 'bg-neutral-100 border-[#EBEBEB] bg-white'
                    }`}>
                      <button
                        type="button"
                        onClick={() => setFocusWriterTheme('warm')}
                        className={`px-2 py-1 rounded transition-all cursor-pointer ${
                          focusWriterTheme === 'warm'
                            ? 'bg-[#FDFBF7] text-[#3E382B] shadow-3xs font-semibold'
                            : 'text-neutral-500 hover:text-[#37352F]'
                        }`}
                      >
                        ☕ Cream Warm
                      </button>
                      <button
                        type="button"
                        onClick={() => setFocusWriterTheme('dark')}
                        className={`px-2 py-1 rounded transition-all cursor-pointer ${
                          focusWriterTheme === 'dark'
                            ? 'bg-[#191919] text-[#E5E5E5] shadow-3xs font-semibold'
                            : 'text-neutral-500 hover:text-white'
                        }`}
                      >
                        🌙 Cosmic Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => setFocusWriterTheme('grid')}
                        className={`px-2 py-1 rounded transition-all cursor-pointer ${
                          focusWriterTheme === 'grid'
                            ? 'bg-white text-[#2C3E50] shadow-3xs font-semibold'
                            : 'text-neutral-500 hover:text-[#37352F]'
                        }`}
                      >
                        📐 Grid Tech
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowFocusWriter(false)}
                      className="flex items-center gap-1.5 p-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Kembali ke Notion</span>
                    </button>
                  </div>
                </div>

                {/* Inspiration Prompt banner */}
                <div className={`px-5 py-2 text-center text-[11px] border-b italic ${
                  focusWriterTheme === 'warm'
                    ? 'bg-[#FCFAF3] text-[#8C7A53] border-[#EAE3D2]'
                    : focusWriterTheme === 'dark'
                      ? 'bg-[#1D1D1D] text-neutral-400 border-[#2E2E2E]'
                      : 'bg-[#F4F8FC] text-slate-500 border-[#DCE4EC]'
                }`}>
                  📝 "Menulis adalah proses menuangkan pemikiran yang kusut menjadi baris kata yang jernih. Tuliskan apa saja."
                </div>

                {/* Formatting Toolbar - Sticky inside desk */}
                <div className={`px-5 py-2 border-b flex flex-wrap items-center gap-1 shrink-0 ${
                  focusWriterTheme === 'warm'
                    ? 'border-[#EAE3D2] bg-[#FAF8F2]/60'
                    : focusWriterTheme === 'dark'
                      ? 'border-[#2E2E2E] bg-[#1E1E1E]/60'
                      : 'border-[#DCE4EC] bg-[#F2F6FA]/50'
                }`}>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('**', '**')}
                    className="p-1 px-2.5 bg-neutral-200/50 hover:bg-neutral-200/80 rounded text-xs font-bold font-sans transition-colors cursor-pointer"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('*', '*')}
                    className="p-1 px-2.5 bg-neutral-200/50 hover:bg-neutral-200/80 rounded text-xs italic font-sans transition-colors cursor-pointer"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('__', '__')}
                    className="p-1 px-2.5 bg-neutral-200/50 hover:bg-neutral-200/80 rounded text-xs underline font-sans transition-colors cursor-pointer"
                    title="Underline"
                  >
                    U
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('`', '`')}
                    className="p-1 px-1.5 bg-neutral-200/50 hover:bg-neutral-200/80 rounded font-mono text-xs transition-colors cursor-pointer"
                    title="Code"
                  >
                    &lt;/&gt;
                  </button>
                  <div className="h-4 w-px bg-neutral-300 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('\n# ', '')}
                    className="p-1 px-2 bg-neutral-200/50 hover:bg-neutral-200/80 rounded text-[10px] font-extrabold transition-colors cursor-pointer"
                    title="Judul"
                  >
                    JUDUL
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('\n- ', '')}
                    className="p-1 px-2 bg-neutral-200/50 hover:bg-neutral-200/80 rounded text-xs transition-colors cursor-pointer"
                    title="List"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('\n> ', '')}
                    className="p-1 px-2 bg-neutral-200/50 hover:bg-neutral-200/80 rounded text-xs transition-colors cursor-pointer"
                    title="Blockquote"
                  >
                    “ Kutipan
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor('<mark>', '</mark>')}
                    className="p-1 px-2 bg-yellow-100 hover:bg-yellow-250 border border-yellow-200 text-yellow-800 rounded text-[10px] font-extrabold cursor-pointer transition-colors"
                    title="Highlight"
                  >
                    STABILO
                  </button>

                  {/* Focus Desk Templates */}
                  <div className="h-4 w-px bg-neutral-300 mx-1 hidden sm:block" />
                  <span className="text-[10px] opacity-60 hidden sm:inline">Templat:</span>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("✨ **Misi Hari Ini:** \n- \n\n🎯 **Refleksi Keberhasilan:** \n- ")}
                    className="p-1 px-2 bg-emerald-50 text-emerald-800 hover:bg-[#DCEEE7] text-[10px] rounded border border-emerald-100 transition-colors cursor-pointer"
                  >
                    🎯 Pencapaian
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTextAtCursor("💭 **Aliran Pikiran Bebas:** \n> ")}
                    className="p-1 px-2 bg-purple-50 text-purple-800 hover:bg-purple-100 text-[10px] rounded border border-purple-100 transition-colors cursor-pointer"
                  >
                    💭 Curahan Ide
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const hours = String(now.getHours()).padStart(2, '0');
                        const mins = String(now.getMinutes()).padStart(2, '0');
                        insertTextAtCursor(`[${hours}:${mins}] `);
                      }}
                      className="p-1 px-1.5 bg-neutral-200/50 hover:bg-neutral-200/80 rounded text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      ⏱️ Timestamp
                    </button>
                  </div>
                </div>

                {/* Desk paper zone */}
                <div className="flex-1 p-4 md:p-6 flex flex-col justify-stretch">
                  <textarea
                    id="focus-desk-notes-textarea"
                    value={todayTrackingData.notes}
                    onChange={(e) => handleUpdateTrackingDay({ ...todayTrackingData, notes: e.target.value })}
                    placeholder="Mulailah mengetik ide, catatan harian, evaluasi diri, atau impian besar Anda di sini secara murni..."
                    className="w-full flex-1 p-4 bg-transparent border-0 ring-0 focus:ring-0 outline-hidden focus:outline-hidden text-sm sm:text-base leading-loose resize-none font-sans placeholder-neutral-400"
                    style={{ minHeight: '380px' }}
                  />
                </div>

                {/* Distraction Free Desk Footer status */}
                <div className={`p-4 border-t flex flex-wrap items-center justify-between text-[11px] select-none ${
                  focusWriterTheme === 'warm'
                    ? 'border-[#EAE3D2] bg-[#FAF8F2] text-[#8C7A53]'
                    : focusWriterTheme === 'dark'
                      ? 'border-[#2E2E2E] bg-[#1F1F1F] text-neutral-400'
                      : 'border-[#DCE4EC] bg-[#F2F6FA]/80 text-slate-500'
                }`}>
                  <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span>Sinkronisasi Otomatis Aktif</span>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <span>
                      Kata: <strong className="font-sans text-neutral-850 dark:text-white">{todayTrackingData.notes ? todayTrackingData.notes.trim().split(/\s+/).filter(Boolean).length : 0}</strong>
                    </span>
                    <span>
                      Karakter: <strong className="font-sans text-neutral-850 dark:text-white">{todayTrackingData.notes ? todayTrackingData.notes.length : 0}</strong>
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Sign-In Portal Modal Overlay */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            key="google-login-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="w-full max-w-md bg-white rounded-2xl border border-neutral-150 shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col font-sans"
            >
              {/* Elegant Accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500" />
              
              <div className="p-8 flex flex-col items-center text-center">
                {/* Logo representation */}
                <Logo size="lg" className="mb-5 shadow-sm" />
                
                <h2 className="text-xl font-bold text-neutral-800 tracking-tight">
                  Selamat Datang di Ruang Tsaqif
                </h2>
                
                <p className="text-xs text-neutral-500 mt-2.5 max-w-sm leading-relaxed">
                  Platform produktivitas dan jurnal digital premium Anda. Silakan masuk dengan akun Google untuk sinkronisasi database cloud secara real-time.
                </p>

                {/* Main Google Login Action Button */}
                <button
                  onClick={handleLogin}
                  className="mt-8 w-full py-3.5 px-4 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl font-medium text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  {/* Google Vector Logo */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Masuk dengan Google</span>
                </button>

                <div className="mt-8 pt-6 border-t border-neutral-100 w-full flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span>Terhubung dengan Firebase Cloud</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications Floating Overlay */}
      <div className="fixed top-6 right-6 z-100 pointer-events-none space-y-2 max-w-sm w-full font-sans">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="pointer-events-auto w-full bg-white border border-neutral-150 rounded-xl shadow-[0_8px_24px_rgba(15,15,15,0.08)] p-3.5 flex items-start gap-3 relative overflow-hidden"
            >
              {/* Colored side indicator bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                toast.type === 'todo' ? 'bg-indigo-500' :
                toast.type === 'habit' ? 'bg-emerald-500' :
                toast.type === 'activity' ? 'bg-amber-500' : 'bg-purple-500'
              }`} />

              <div className="flex-1 pl-1">
                <h4 className="text-xs font-black text-neutral-800 tracking-tight leading-tight">
                  {toast.title}
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-neutral-400 hover:text-neutral-650 p-0.5 rounded-lg hover:bg-neutral-50 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AiAssistant 
        settings={settings}
        habits={habits}
        todayTrackingData={todayTrackingData}
        databaseRows={databaseRows}
        activePageTitle={currentPage?.title}
        pages={pages}
        onToggleTodayHabit={handleToggleTodayHabit}
        onUpdateTrackingDay={handleUpdateTrackingDay}
        onUpdateDatabaseRows={setDatabaseRows}
        onUpdateActivitiesForDate={handleUpdateActivitiesForDate}
        activityRecaps={activityRecaps}
        onAddNotification={triggerToastNotification}
        onUpdatePageBlocks={handleUpdatePageBlocks}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        user={user}
        onUpdateProfileName={handleUpdateProfileName}
        pages={pages}
        habits={habits}
        trackingDays={trackingDays}
        databaseRows={databaseRows}
        activityRecaps={activityRecaps}
        onImportData={handleImportData}
        onResetAllData={handleResetAllData}
        notificationSettings={notificationSettings}
        onUpdateNotificationSettings={setNotificationSettings}
      />

    </div>
  );
}
