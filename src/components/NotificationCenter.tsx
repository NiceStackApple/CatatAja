import React, { useState } from 'react';
import { Bell, X, Check, BellOff, Settings, Sparkles, AlertCircle, Play, Calendar, CheckSquare, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationItem, NotificationSettings } from '../types';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  unreadCount: number;
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onTriggerSimulation: (type: 'todo' | 'habit' | 'activity') => void;
  language: 'en' | 'id';
}

export default function NotificationCenter({
  notifications,
  unreadCount,
  settings,
  onUpdateSettings,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onTriggerSimulation,
  language
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings'>('alerts');

  const isId = language === 'id';
  const t = (idText: string, enText: string) => (isId ? idText : enText);

  // Time options helper
  const hoursOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutesOptions = ['00', '15', '30', '45'];

  const handleTimeChange = (key: 'dailyActivityReminderTime' | 'todoReminderTime' | 'habitReminderTime', hour: string, minute: string) => {
    onUpdateSettings({
      ...settings,
      [key]: `${hour}:${minute}`
    });
  };

  const parseTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    return {
      hour: parts[0] || '09',
      minute: parts[1] || '00'
    };
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'todo':
        return <CheckSquare className="w-4 h-4 text-indigo-500" />;
      case 'habit':
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'activity':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative font-sans">
      {/* Trigger Bell Button */}
      <button
        id="btn-trigger-notification-center"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-md transition-all relative cursor-pointer ${
          isOpen
            ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-3xs'
            : 'text-[#37352F]/60 hover:text-[#37352F] hover:bg-white border border-transparent'
        }`}
        title={t('Pusat Notifikasi', 'Notification Center')}
      >
        <Bell className={`w-3.5 h-3.5 ${unreadCount > 0 ? 'animate-swing origin-top' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center px-1 border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop wrapper for safe closing */}
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 mt-2.5 w-[340px] sm:w-[380px] max-h-[480px] bg-white border border-[#EBEBEB] rounded-xl shadow-[0_12px_36px_rgba(15,15,15,0.12)] z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-3.5 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black text-neutral-800 uppercase tracking-wider">
                    {t('Pusat Notifikasi', 'Notification Hub')}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab(activeTab === 'alerts' ? 'settings' : 'alerts')}
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
                    }`}
                    title={t('Pengaturan Notifikasi', 'Notification Settings')}
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tabs Content */}
              {activeTab === 'alerts' ? (
                /* ALERTS TAB */
                <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[350px] flex flex-col bg-white">
                  {notifications.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 my-auto">
                      <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400">
                        <BellOff className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-700">
                          {t('Tidak ada notifikasi baru', 'No notifications yet')}
                        </h4>
                        <p className="text-[10px] text-neutral-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                          {t(
                            'Anda akan menerima pengingat harian, tugas penting, atau anjuran AI di sini.',
                            'You will receive daily reminders, crucial tasks, or AI cues here.'
                          )}
                        </p>
                      </div>

                      {/* Simulation shortcuts */}
                      <div className="pt-2 w-full max-w-[240px] space-y-1.5">
                        <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1">
                          {t('Simulasikan Pengingat', 'Simulate Reminder')}
                        </span>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => onTriggerSimulation('activity')}
                            className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Activity
                          </button>
                          <button
                            onClick={() => onTriggerSimulation('todo')}
                            className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Todo
                          </button>
                          <button
                            onClick={() => onTriggerSimulation('habit')}
                            className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Habit
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {/* Top actions toolbar */}
                      <div className="p-2 bg-neutral-50/40 px-3 flex items-center justify-between text-[10px]">
                        <span className="text-neutral-500 font-medium">
                          {t(`${unreadCount} belum dibaca`, `${unreadCount} unread`)}
                        </span>
                        <div className="flex items-center gap-2.5">
                          {unreadCount > 0 && (
                            <button
                              onClick={onMarkAllAsRead}
                              className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-pointer"
                            >
                              {t('Tandai semua dibaca', 'Mark all as read')}
                            </button>
                          )}
                          <button
                            onClick={onClearAll}
                            className="text-rose-600 hover:text-rose-800 font-bold transition-colors cursor-pointer"
                          >
                            {t('Hapus semua', 'Clear all')}
                          </button>
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="divide-y divide-neutral-100">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => onMarkAsRead(n.id)}
                            className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                              n.isRead ? 'bg-white hover:bg-neutral-50/40' : 'bg-indigo-50/15 hover:bg-indigo-50/30'
                            }`}
                          >
                            {/* Icon Indicator */}
                            <div className="mt-0.5 p-1.5 rounded-lg bg-neutral-50 shrink-0 border border-neutral-100">
                              {getNotificationIcon(n.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-extrabold text-neutral-800 leading-tight">
                                  {n.title}
                                </h4>
                                {!n.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-600 leading-relaxed">
                                {n.message}
                              </p>
                              <span className="text-[9px] text-neutral-400 font-mono block pt-0.5">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* SETTINGS TAB */
                <div className="p-4 space-y-4 bg-white overflow-y-auto max-h-[350px]">
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-indigo-500" />
                      {t('Pengaturan Jadwal Pengingat', 'Reminder Schedule Settings')}
                    </h4>
                    <p className="text-[10px] text-neutral-400">
                      {t(
                        'Pusat notifikasi kami memantau aktivitas Anda secara cerdas berdasarkan waktu berikut:',
                        'Reminders trigger automatically based on your customized timing preferences below:'
                      )}
                    </p>
                  </div>

                  <hr className="border-neutral-100" />

                  {/* 1. Daily Activity Reminders */}
                  <div className="space-y-2 bg-neutral-50/50 p-2.5 rounded-xl border border-neutral-100">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enableDailyActivityReminder}
                          onChange={(e) =>
                            onUpdateSettings({ ...settings, enableDailyActivityReminder: e.target.checked })
                          }
                          className="w-3.5 h-3.5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-bold text-neutral-700">
                          {t('Pengingat Catat Aktivitas', 'Activity Log Reminder')}
                        </span>
                      </label>
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.2 rounded">
                        Daily
                      </span>
                    </div>
                    {settings.enableDailyActivityReminder && (
                      <div className="flex items-center gap-2.5 pl-5 pt-1">
                        <span className="text-[10px] text-neutral-500">{t('Waktu pengingat:', 'Trigger at:')}</span>
                        <div className="flex items-center gap-1">
                          {/* Hour */}
                          <select
                            value={parseTime(settings.dailyActivityReminderTime).hour}
                            onChange={(e) =>
                              handleTimeChange(
                                'dailyActivityReminderTime',
                                e.target.value,
                                parseTime(settings.dailyActivityReminderTime).minute
                              )
                            }
                            className="bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-xs text-neutral-700 font-mono outline-hidden"
                          >
                            {hoursOptions.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                          <span className="font-mono text-neutral-400 text-xs">:</span>
                          {/* Minute */}
                          <select
                            value={parseTime(settings.dailyActivityReminderTime).minute}
                            onChange={(e) =>
                              handleTimeChange(
                                'dailyActivityReminderTime',
                                parseTime(settings.dailyActivityReminderTime).hour,
                                e.target.value
                              )
                            }
                            className="bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-xs text-neutral-700 font-mono outline-hidden"
                          >
                            {minutesOptions.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Todo Reminders */}
                  <div className="space-y-2 bg-neutral-50/50 p-2.5 rounded-xl border border-neutral-100">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enableTodoReminder}
                          onChange={(e) =>
                            onUpdateSettings({ ...settings, enableTodoReminder: e.target.checked })
                          }
                          className="w-3.5 h-3.5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-bold text-neutral-700">
                          {t('Pengingat Tugas / Proyek', 'Todo/Task Reminder')}
                        </span>
                      </label>
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                        Deadline
                      </span>
                    </div>
                    {settings.enableTodoReminder && (
                      <div className="flex items-center gap-2.5 pl-5 pt-1">
                        <span className="text-[10px] text-neutral-500">{t('Waktu pengingat:', 'Trigger at:')}</span>
                        <div className="flex items-center gap-1">
                          {/* Hour */}
                          <select
                            value={parseTime(settings.todoReminderTime).hour}
                            onChange={(e) =>
                              handleTimeChange(
                                'todoReminderTime',
                                e.target.value,
                                parseTime(settings.todoReminderTime).minute
                              )
                            }
                            className="bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-xs text-neutral-700 font-mono outline-hidden"
                          >
                            {hoursOptions.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                          <span className="font-mono text-neutral-400 text-xs">:</span>
                          {/* Minute */}
                          <select
                            value={parseTime(settings.todoReminderTime).minute}
                            onChange={(e) =>
                              handleTimeChange(
                                'todoReminderTime',
                                parseTime(settings.todoReminderTime).hour,
                                e.target.value
                              )
                            }
                            className="bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-xs text-neutral-700 font-mono outline-hidden"
                          >
                            {minutesOptions.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Habit Reminders */}
                  <div className="space-y-2 bg-neutral-50/50 p-2.5 rounded-xl border border-neutral-100">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.enableHabitReminder}
                          onChange={(e) =>
                            onUpdateSettings({ ...settings, enableHabitReminder: e.target.checked })
                          }
                          className="w-3.5 h-3.5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-bold text-neutral-700">
                          {t('Pengingat Check off Kebiasaan', 'Habit Checklist Reminder')}
                        </span>
                      </label>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                        Evening
                      </span>
                    </div>
                    {settings.enableHabitReminder && (
                      <div className="flex items-center gap-2.5 pl-5 pt-1">
                        <span className="text-[10px] text-neutral-500">{t('Waktu pengingat:', 'Trigger at:')}</span>
                        <div className="flex items-center gap-1">
                          {/* Hour */}
                          <select
                            value={parseTime(settings.habitReminderTime).hour}
                            onChange={(e) =>
                              handleTimeChange(
                                'habitReminderTime',
                                e.target.value,
                                parseTime(settings.habitReminderTime).minute
                              )
                            }
                            className="bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-xs text-neutral-700 font-mono outline-hidden"
                          >
                            {hoursOptions.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                          <span className="font-mono text-neutral-400 text-xs">:</span>
                          {/* Minute */}
                          <select
                            value={parseTime(settings.habitReminderTime).minute}
                            onChange={(e) =>
                              handleTimeChange(
                                'habitReminderTime',
                                parseTime(settings.habitReminderTime).hour,
                                e.target.value
                              )
                            }
                            className="bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-xs text-neutral-700 font-mono outline-hidden"
                          >
                            {minutesOptions.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informative Footer */}
              <div className="p-2.5 bg-neutral-50 border-t border-neutral-100 px-4 flex items-center justify-between text-[10px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span>Auto-Sync Background Engine</span>
                </span>
                <button
                  onClick={() => setActiveTab(activeTab === 'alerts' ? 'settings' : 'alerts')}
                  className="font-bold hover:text-indigo-600 transition-colors"
                >
                  {activeTab === 'alerts' ? t('Pengaturan', 'Settings') : t('Kembali', 'Back')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
