import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { AppSettings, Habit, TrackingDay } from '../types';

interface LiveDateTimeBannerProps {
  settings: AppSettings;
  habits: Habit[];
  todayTrackingData: TrackingDay;
}

export default function LiveDateTimeBanner({ settings, habits, todayTrackingData }: LiveDateTimeBannerProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isId = settings.language === 'id';

  // Format Time (HH:mm:ss)
  const formattedTime = time.toLocaleTimeString(isId ? 'id-ID' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Get Day & Date String
  const dayNamesId = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const monthNamesId = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayName = isId ? dayNamesId[time.getDay()] : dayNamesEn[time.getDay()];
  const monthName = isId ? monthNamesId[time.getMonth()] : monthNamesEn[time.getMonth()];
  const dateNum = time.getDate();
  const yearNum = time.getFullYear();

  const formattedDate = isId 
    ? `${dayName}, ${dateNum} ${monthName} ${yearNum}`
    : `${dayName}, ${monthName} ${dateNum}, ${yearNum}`;

  // Habits Progress Stats
  const totalHabits = habits.length;
  const completedCount = habits.filter(h => todayTrackingData.habitsCompleted.includes(h.id)).length;
  const progressPercent = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  return (
    <div className="bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 border border-[#EBEBEB] rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-3xs">
      <div className="flex items-center gap-3.5">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0 shadow-2xs">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-indigo-600/80 uppercase tracking-widest block font-sans">
            {isId ? 'KALENDER PELACAKAN AKTIF' : 'ACTIVE TRACKING CALENDAR'}
          </span>
          <h2 className="text-sm md:text-base font-bold text-neutral-800 tracking-tight font-sans mt-0.5">
            {formattedDate}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{isId ? 'Waktu Lokal:' : 'Local Time:'}</span>
            <span className="font-mono text-neutral-700 font-bold bg-neutral-100 px-1.5 py-0.5 rounded tracking-wide border border-neutral-200/50">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-neutral-100 pt-3 md:pt-0 gap-2">
        <div className="text-left md:text-right">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            {isId ? 'KEMAJUAN TARGET HARI INI' : 'TODAY\'S TARGET PROGRESS'}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold text-neutral-700">
              {completedCount} / {totalHabits} {isId ? 'Selesai' : 'Completed'}
            </span>
            <span className="text-xs font-extrabold text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100/60">
              {progressPercent}%
            </span>
          </div>
        </div>
        
        <div className="w-24 md:w-32 bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200/40">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
