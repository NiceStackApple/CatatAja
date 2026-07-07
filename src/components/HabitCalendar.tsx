import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Smile, 
  Clock, 
  FileText, 
  Check, 
  X, 
  CalendarDays,
  Flame,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit, TrackingDay } from '../types';

interface HabitCalendarProps {
  habits: Habit[];
  trackingDays: TrackingDay[];
  onUpdateDay: (day: TrackingDay) => void;
  settings?: any;
}

const MOODS = [
  { value: 'great', label: 'Luar Biasa', enLabel: 'Great', emoji: '😊', color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800' },
  { value: 'good', label: 'Baik', enLabel: 'Good', emoji: '🙂', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800' },
  { value: 'neutral', label: 'Biasa Saja', enLabel: 'Neutral', emoji: '😐', color: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800' },
  { value: 'tired', label: 'Lelah', enLabel: 'Tired', emoji: '🥱', color: 'bg-amber-100 hover:bg-amber-200 text-amber-800' },
  { value: 'bad', label: 'Buruk', enLabel: 'Bad', emoji: '☹️', color: 'bg-rose-100 hover:bg-rose-200 text-rose-800' },
];

export default function HabitCalendar({ habits, trackingDays, onUpdateDay, settings }: HabitCalendarProps) {
  // Center on June 2026 (matching mockData)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 22)); // June 22, 2026
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  const t = (idText: string, enText: string) => {
    return settings?.language === 'id' ? idText : enText;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (June = 5)

  const monthNames = settings?.language === 'id' ? [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ] : [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar dates generation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1 etc

  // Adjust so Monday is first day of the week
  // Sunday (0) becomes 6, Monday (1) becomes 0, etc.
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const prevMonthDays = [];
  if (adjustedStartDay > 0) {
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = adjustedStartDay - 1; i >= 0; i--) {
      prevMonthDays.push(prevMonthDaysCount - i);
    }
  }

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Search tracking metrics for a given string date (YYYY-MM-DD)
  const getDayData = (dateStr: string): TrackingDay | undefined => {
    return trackingDays.find(d => d.date === dateStr);
  };

  const handleDaySelect = (dayNum: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    setSelectedDayString(dateStr);
  };

  const selectedDayData = selectedDayString ? getDayData(selectedDayString) : undefined;

  // Modify currently selected Peeking Day
  const handleUpdatePeekingDay = (partial: Partial<TrackingDay>) => {
    if (!selectedDayString) return;

    if (selectedDayData) {
      onUpdateDay({
        ...selectedDayData,
        ...partial
      });
    } else {
      // Create new tracking day representation
      onUpdateDay({
        date: selectedDayString,
        habitsCompleted: [],
        mood: 'neutral',
        productiveHours: 0,
        notes: '',
        journalTitle: 'Hari Baru',
        ...partial
      });
    }
  };

  const handleToggleHabitForPeekingDay = (habitId: string) => {
    const currentCompleted = selectedDayData?.habitsCompleted || [];
    const updatedCompleted = currentCompleted.includes(habitId)
      ? currentCompleted.filter(id => id !== habitId)
      : [...currentCompleted, habitId];

    handleUpdatePeekingDay({ habitsCompleted: updatedCompleted });
  };

  // Move months
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Math helper for streaks
  const calculateStreak = (days: TrackingDay[]): number => {
    if (!days || days.length === 0) return 0;
    
    // Filter days that have completed habits
    const completedDays = days.filter(d => d.habitsCompleted && d.habitsCompleted.length > 0);
    if (completedDays.length === 0) return 0;

    // Map of date string -> completed count
    const dateMap = new Map<string, boolean>();
    completedDays.forEach(d => {
      dateMap.set(d.date, true);
    });

    // Sort dates ascending
    const sortedDates = completedDays
      .map(d => d.date)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const latestDateStr = sortedDates[sortedDates.length - 1];
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (d: Date) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);

    let anchorDateStr = latestDateStr;
    
    // If the latest completed habit was done today or yesterday, use today as anchor
    if (dateMap.has(todayStr) || dateMap.has(yesterdayStr)) {
      anchorDateStr = dateMap.has(todayStr) ? todayStr : yesterdayStr;
    }

    // Calculate streak backwards from anchorDateStr
    let streak = 0;
    let current = new Date(anchorDateStr);
    
    while (true) {
      const currentStr = formatDate(current);
      if (dateMap.has(currentStr)) {
        streak++;
        // Go to previous day
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak(trackingDays);
  const completedAllHabitsCount = habits.length > 0 
    ? trackingDays.filter(d => d.habitsCompleted.length >= habits.length).length 
    : 0;

  // Average productivity hours calculation
  const productiveDays = trackingDays.filter(d => d.productiveHours > 0);
  const avgProductive = productiveDays.length > 0
    ? (productiveDays.reduce((acc, d) => acc + d.productiveHours, 0) / productiveDays.length).toFixed(1)
    : '0.0';

  return (
    <div className="w-full max-w-5xl mx-auto py-4 space-y-6">
      {/* Mini Streak Tracker Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-3.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#787774] font-semibold uppercase tracking-wider block">{t('Penyelesaian Beruntun', 'Streak Completion')}</span>
            <p className="text-xl font-bold text-[#37352F]">
              {settings?.language === 'id' 
                ? `${currentStreak} Hari Beruntun` 
                : `${currentStreak} Days Streak`}
            </p>
          </div>
          <div className="w-9 h-9 rounded bg-[#FBEEEE] text-[#EB5757] flex items-center justify-center">
            <Flame className="w-4 h-4 fill-current" />
          </div>
        </div>

        <div className="bg-white border border-[#EBEBEB] rounded-lg p-3.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#787774] font-semibold uppercase tracking-wider block">{t('Sempurna (100% Habit)', 'Perfect (100% Habit)')}</span>
            <p className="text-xl font-bold text-[#37352F]">{completedAllHabitsCount} {t('Hari Tercatat', 'Days Logged')}</p>
          </div>
          <div className="w-9 h-9 rounded bg-[#E7F3EF] text-[#0D7A5E] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white border border-[#EBEBEB] rounded-lg p-3.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#787774] font-semibold uppercase tracking-wider block">{t('Rata-Rata Produktif', 'Average Productivity')}</span>
            <p className="text-xl font-bold text-[#37352F] font-mono">
              {avgProductive} {t('Jam/Hari', 'Hours/Day')}
            </p>
          </div>
          <div className="w-9 h-9 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Calendar layout */}
      <div className="bg-white border border-[#EBEBEB] rounded-lg overflow-hidden">
        {/* Calendar Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#F1F1F1] text-[#37352F] shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-bold text-[#37352F] leading-none">
                {monthNames[month]} {year}
              </h3>
              <span className="text-[10px] sm:text-[11px] text-[#787774] block mt-1 leading-tight">
                {t('Klik pada tanggal untuk melihat/mengedit catatan saku', 'Click on a date to view/edit pocket logs')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 border border-[#EBEBEB] rounded-md bg-[#F1F1F1] p-0.5 w-fit ml-auto sm:ml-0">
            <button
              id="btn-calendar-prev"
              onClick={prevMonth}
              className="p-1 rounded hover:bg-white text-[#37352F] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-calendar-today"
              onClick={() => setCurrentDate(new Date(2026, 5, 22))}
              className="px-2 py-0.5 rounded bg-white text-[10px] sm:text-[11px] font-semibold text-[#37352F] shadow-xs hover:bg-[#F7F7F5] border border-[#EBEBEB] cursor-pointer"
            >
              {t('Hari Ini', 'Today')}
            </button>
            <button
              id="btn-calendar-next"
              onClick={nextMonth}
              className="p-1 rounded hover:bg-white text-[#37352F] transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days of week labels */}
        <div className="grid grid-cols-7 border-b border-[#EBEBEB] bg-[#F7F7F5] text-center text-[11px] font-medium text-[#787774] py-1.5">
          <span>{t('Sen', 'Mon')}</span>
          <span>{t('Sel', 'Tue')}</span>
          <span>{t('Rab', 'Wed')}</span>
          <span>{t('Kam', 'Thu')}</span>
          <span>{t('Jum', 'Fri')}</span>
          <span>{t('Sab', 'Sat')}</span>
          <span>{t('Min', 'Sun')}</span>
        </div>

        {/* Calendar cell grid */}
        <div className="grid grid-cols-7 border-collapse bg-neutral-50/10">
          {/* Previous month empty placeholders */}
          {prevMonthDays.map((day, idx) => (
            <div 
              id={`prev-month-cell-${idx}`}
              key={`prev-${idx}`} 
              className="h-16 sm:h-24 p-1 sm:p-2 border-b border-r border-[#EBEBEB] text-neutral-300 pointer-events-none text-[10.5px] sm:text-xs"
            >
              {day}
            </div>
          ))}

          {/* Current month days */}
          {daysArray.map((dayNum) => {
            const formattedMonth = String(month + 1).padStart(2, '0');
            const formattedDay = String(dayNum).padStart(2, '0');
            const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
            const data = getDayData(dateStr);
            const isToday = dayNum === 22 && month === 5 && year === 2026;

            const completionRate = data 
              ? (data.habitsCompleted.length / habits.length) * 100 
              : 0;

            return (
              <div
                id={`cell-${dateStr}`}
                key={dayNum}
                onClick={() => handleDaySelect(dayNum)}
                className={`group h-16 sm:h-24 p-1 sm:p-2 border-b border-r border-[#EBEBEB] bg-white cursor-pointer hover:bg-[#F7F7F5] relative flex flex-col justify-between transition-colors ${
                  isToday ? 'bg-[#E7F3EF]/30 outline outline-2 outline-[#448361]/40' : ''
                }`}
              >
                {/* Cell top: date numbering and mood indicator */}
                <div className="flex items-start justify-between">
                  <span className={`text-[10px] sm:text-[11px] font-semibold ${
                    isToday ? 'bg-[#448361] text-white rounded w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold' : 'text-[#37352F]'
                  }`}>
                    {dayNum}
                  </span>
                  
                  {data?.mood && (
                    <span 
                      className="text-xs sm:text-sm rounded hover:scale-110 transition-transform" 
                      title={`Kondisi Mood: ${data.mood}`}
                    >
                      {MOODS.find(m => m.value === data.mood)?.emoji}
                    </span>
                  )}
                </div>

                {/* Tracking Progress Fill Visual */}
                {data && (
                  <div className="space-y-1 mt-auto">
                    {/* Tiny habit checked icons list */}
                    <div className="hidden sm:flex flex-wrap gap-0.5 max-h-5 overflow-hidden">
                      {data.habitsCompleted.map(habitId => {
                        const h = habits.find(habitItem => habitItem.id === habitId);
                        return h ? (
                          <span key={habitId} className="text-[10px]" title={h.name}>
                            {h.icon}
                          </span>
                        ) : null;
                      })}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#F1F1F1] rounded-full h-0.5 sm:h-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          completionRate === 100 
                            ? 'bg-[#448361]' 
                            : completionRate >= 60 
                            ? 'bg-[#337EA9]' 
                            : completionRate >= 30 
                            ? 'bg-[#D9730D]' 
                            : 'bg-[#EB5757]'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>

                    {/* Meta stats text */}
                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-[#787774] font-mono leading-none">
                      <span>{data.habitsCompleted.length}/{habits.length}<span className="hidden md:inline"> Habit</span></span>
                      {data.productiveHours > 0 && (
                        <span className="flex items-center gap-0.5 text-[#337EA9]">
                          <Clock className="w-2 h-2" />
                          {data.productiveHours}<span className="hidden sm:inline">j</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Hover suggestion text if cell has no data */}
                {!data && (
                  <span className="text-[8px] text-[#787774]/40 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 left-1 hidden sm:inline">
                    + Track
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notion Style Slide drawer Side-Peek Overlay */}
      <AnimatePresence>
        {selectedDayString && (
          <>
            {/* Dark background blanket */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDayString(null)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />

            {/* Slide Peek Panel */}
            <motion.div
              id="notion-side-peek"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white border-l border-notion-border shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Peek Header */}
              <div className="p-4 border-b border-notion-border bg-neutral-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-semibold text-neutral-500">Notion Side-Peek Editor</span>
                </div>
                <button
                  id="btn-peek-close"
                  onClick={() => setSelectedDayString(null)}
                  className="p-1 px-2.5 bg-neutral-200/80 hover:bg-neutral-200 text-neutral-700 text-xs rounded-lg flex items-center gap-1 transition-all"
                >
                  <X className="w-3.5 h-3.5" /> {t('Tutup', 'Close')}
                </button>
              </div>

              {/* Scrollable Peek Layout */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Title and Date description */}
                <div>
                  <input
                    id="peek-journal-title"
                    type="text"
                    value={selectedDayData?.journalTitle || t('Rangkuman Harian', 'Daily Summary')}
                    onChange={(e) => handleUpdatePeekingDay({ journalTitle: e.target.value })}
                    placeholder={t('Judul jurnal harian...', 'Daily journal title...')}
                    className="w-full text-xl font-bold text-neutral-800 bg-transparent border-none outline-hidden font-display mb-1"
                  />
                  <p className="text-xs text-notion-gray font-mono">
                    {t('Tanggal:', 'Date:')} <span className="underline">{selectedDayString}</span>
                  </p>
                </div>

                {/* Mood Selection Row */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                    {t('Kondisi Mood Hari Ini', "Today's Mood")}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map(m => {
                      const isActive = selectedDayData?.mood === m.value;
                      return (
                        <button
                          id={`btn-mood-select-${m.value}`}
                          key={m.value}
                          onClick={() => handleUpdatePeekingDay({ mood: m.value as any })}
                          className={`flex items-center gap-1 text-[13px] px-2.5 py-1.5 rounded-lg border transition-all ${
                            isActive 
                              ? `${m.color} border-slate-400 font-semibold shadow-2xs` 
                              : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                          }`}
                        >
                          <span>{m.emoji}</span>
                          <span>{t(m.label, m.enLabel)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Productive Hours Slider */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-neutral-100">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {t('Jam Kerja Produktif', 'Productive Working Hours')}
                    </label>
                    <span className="text-xs font-bold font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {selectedDayData?.productiveHours || 0} {t('Jam', 'Hours')}
                    </span>
                  </div>
                  <input
                    id="peek-slider-hours"
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={selectedDayData?.productiveHours || 0}
                    onChange={(e) => handleUpdatePeekingDay({ productiveHours: Number(e.target.value) })}
                    className="w-full accent-sky-600 cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-notion-gray font-mono">
                    <span>{t('Sangat Santai (0j)', 'Relaxed (0h)')}</span>
                    <span>{t('Intens (12j)', 'Intense (12h)')}</span>
                  </div>
                </div>

                {/* Habits tracking Checklist */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                    {t('Daftar Kebiasaan (Habits Checklist)', 'Habits Checklist')}
                  </label>
                  <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-150 overflow-hidden shadow-2xs">
                    {habits.map(h => {
                      const isDone = selectedDayData?.habitsCompleted.includes(h.id) || false;

                      return (
                        <div 
                          id={`item-peek-habit-${h.id}`}
                          key={h.id}
                          onClick={() => handleToggleHabitForPeekingDay(h.id)}
                          className="flex items-center justify-between p-3 bg-white hover:bg-neutral-50 cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{h.icon}</span>
                            <span className={`text-sm ${isDone ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
                              {h.name}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            isDone 
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-3xs' 
                              : 'border-neutral-300 hover:border-emerald-600 bg-white'
                          }`}>
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Free Text Jurnal Block */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                    {t('Tulisan Jurnal Harian', 'Daily Journal Notes')}
                  </label>
                  <textarea
                    id="peek-textarea-notes"
                    value={selectedDayData?.notes || ''}
                    onChange={(e) => handleUpdatePeekingDay({ notes: e.target.value })}
                    placeholder={t('Tuliskan evaluasi harian, kejadian berharga, atau refleksi diri di sini...', 'Write down daily evaluations, memorable events, or self-reflections here...')}
                    rows={4}
                    className="w-full p-3 text-sm text-neutral-700 bg-white border border-neutral-200 rounded-xl shadow-2xs focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Side Peek footer */}
              <div className="p-4 bg-neutral-50 border-t border-notion-border flex justify-end">
                <button
                  id="btn-peek-save"
                  onClick={() => setSelectedDayString(null)}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-display shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> {t('Simpan & Selesaikan Saku', 'Save & Complete Pocket Log')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
