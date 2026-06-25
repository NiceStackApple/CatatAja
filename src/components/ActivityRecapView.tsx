import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Moon, 
  Sun, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Check, 
  Info,
  TrendingUp,
  Award,
  Activity,
  Heart,
  X,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityEntry } from '../types';
import EChart from './EChart';

// MUI X and Day.js imports for Material Design clock wheel picker
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import dayjs, { Dayjs } from 'dayjs';

// Define the categories with emojis, colors, and styling matching the existing app tags
export const RECAP_CATEGORIES = [
  { value: 'Study', label: 'Study', emoji: '📚', color: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/30' },
  { value: 'Work', label: 'Work', emoji: '💻', color: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/30' },
  { value: 'Exercise', label: 'Exercise', emoji: '🏃‍♂️', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/30' },
  { value: 'Reading', label: 'Reading', emoji: '📖', color: 'bg-lime-50 text-lime-700 border-lime-100 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-900/30' },
  { value: 'Entertainment', label: 'Entertainment', emoji: '🎬', color: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/30' },
  { value: 'Gaming', label: 'Gaming', emoji: '🎮', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-900/30' },
  { value: 'Social', label: 'Social', emoji: '🤝', color: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/30' },
  { value: 'Family', label: 'Family', emoji: '🏠', color: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/30' },
  { value: 'Meeting', label: 'Meeting', emoji: '👥', color: 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/30' },
  { value: 'Travel', label: 'Travel', emoji: '✈️', color: 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900/30' },
  { value: 'Eating', label: 'Eating', emoji: '🍔', color: 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900/30' },
  { value: 'Shopping', label: 'Shopping', emoji: '🛒', color: 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900/30' },
  { value: 'Health', label: 'Health', emoji: '🏥', color: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/30' },
  { value: 'Worship', label: 'Worship', emoji: '🙏', color: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30' },
  { value: 'Rest', label: 'Rest', emoji: '🛋️', color: 'bg-stone-50 text-stone-700 border-stone-100 dark:bg-stone-950/40 dark:text-stone-300 dark:border-stone-900/30' },
  { value: 'Sleep', label: 'Sleep', emoji: '😴', color: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/30' },
  { value: 'Other', label: 'Other', emoji: '⚙️', color: 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-950/40 dark:text-gray-300 dark:border-gray-900/30' },
];

// Category Solid Colors Helper for Custom Pie Chart
export const getCategoryColor = (categoryVal: string): string => {
  const map: Record<string, string> = {
    Study: '#6366F1',         // Indigo
    Work: '#0EA5E9',          // Sky
    Exercise: '#10B981',      // Emerald
    Reading: '#84CC16',       // Lime
    Entertainment: '#A855F7',  // Purple
    Gaming: '#D946EF',        // Fuchsia
    Social: '#F43F5E',        // Rose
    Family: '#F97316',        // Orange
    Meeting: '#14B8A6',       // Teal
    Travel: '#06B6D4',        // Cyan
    Eating: '#EAB308',        // Yellow
    Shopping: '#EC4899',       // Pink
    Health: '#EF4444',        // Red
    Worship: '#F59E0B',       // Amber
    Rest: '#78716C',          // Stone
    Sleep: '#3B82F6',         // Blue
    Other: '#6B7280',         // Gray
  };
  return map[categoryVal] || '#10B981';
};

export const categoryWeights: Record<string, number> = {
  Work: 5,
  Study: 5,
  Reading: 5,
  Exercise: 4,
  Meeting: 4,
  Health: 3,
  Worship: 3,
  Rest: 2,
  Eating: 2,
  Shopping: 2,
  Travel: 2,
  Family: 1,
  Social: 1,
  Entertainment: 0,
  Gaming: 0,
  Sleep: 3,
  Other: 0,
};

interface ActivityRecapViewProps {
  activityRecaps: Record<string, ActivityEntry[]>;
  onUpdateActivities: (date: string, activities: ActivityEntry[]) => void;
}

// Math calculation helper for sleep duration
export function calculateSleepDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sHours, sMins] = startTime.split(':').map(Number);
  const [eHours, eMins] = endTime.split(':').map(Number);
  
  const startMinutes = sHours * 60 + sMins;
  const endMinutes = eHours * 60 + eMins;
  
  if (endMinutes >= startMinutes) {
    return (endMinutes - startMinutes) / 60;
  } else {
    const totalDayMinutes = 24 * 60;
    return (totalDayMinutes - startMinutes + endMinutes) / 60;
  }
}

// Convert "HH:MM" to decimal hours for graph scaling
function timeToDecimal(timeStr: string, treatAsBedtime: boolean = false): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  let val = h + m / 60;
  if (treatAsBedtime && h < 12) {
    val += 24; // Bedtime after midnight maps past 24.0 (e.g., 01:30 -> 25.5)
  }
  return val;
}

// Formats decimal hour to e.g. "07:30" or "23:00"
function decimalToTime(val: number): string {
  let h = Math.floor(val);
  const m = Math.round((val - h) * 60);
  if (h >= 24) h -= 24;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Convert "HH:mm" time string safely to Dayjs
function parseTimeToDayjs(timeStr: string): dayjs.Dayjs | null {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return dayjs().hour(hours).minute(minutes).second(0);
}

export default function ActivityRecapView({ activityRecaps, onUpdateActivities }: ActivityRecapViewProps) {
  // We use "2026-06-22" as our initial baseline date matching mock data records
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-06-22');
  
  // Calendar popover states
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const [calMonth, setCalMonth] = useState(() => dayjs('2026-06-22').month());
  const [calYear, setCalYear] = useState(() => dayjs('2026-06-22').year());

  const calendarCells = useMemo(() => {
    const startOfMonth = dayjs().year(calYear).month(calMonth).startOf('month');
    const endOfMonth = dayjs().year(calYear).month(calMonth).endOf('month');
    const daysInMonth = startOfMonth.daysInMonth();
    
    // Day of week of the 1st of the month (0 = Sunday, ..., 6 = Saturday)
    const startDayOfWeek = startOfMonth.day();
    
    const cells = [];
    
    // Days from previous month for padding
    const prevMonth = startOfMonth.subtract(1, 'month');
    const prevDaysInMonth = prevMonth.daysInMonth();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevDaysInMonth - i;
      const dateString = prevMonth.date(dayNum).format('YYYY-MM-DD');
      cells.push({
        day: dayNum,
        isCurrentMonth: false,
        dateStr: dateString,
      });
    }
    
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = startOfMonth.date(i).format('YYYY-MM-DD');
      cells.push({
        day: i,
        isCurrentMonth: true,
        dateStr: dateString,
      });
    }
    
    // Padding for the remaining cells to make standard multiple of 7
    const totalSlots = Math.ceil(cells.length / 7) * 7;
    const nextMonth = startOfMonth.add(1, 'month');
    let nextDayCount = 1;
    while (cells.length < totalSlots) {
      const dateString = nextMonth.date(nextDayCount).format('YYYY-MM-DD');
      cells.push({
        day: nextDayCount,
        isCurrentMonth: false,
        dateStr: dateString,
      });
      nextDayCount++;
    }
    
    return cells;
  }, [calMonth, calYear]);
  
  // Modals / forms state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);
  
  // Form values
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Study');
  const [formNotes, setFormNotes] = useState('');
  const [formDidNotSleep, setFormDidNotSleep] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);

  // Auto-reset validation error when input changes
  React.useEffect(() => {
    setValidationError(null);
  }, [formStartTime, formEndTime, formDidNotSleep]);

  // Activity Analytics Timeframe States
  const [timeframe, setTimeframe] = useState<string>('30_days');
  const [trendMetric, setTrendMetric] = useState<'hours' | 'score'>('hours');
  const [customStartDate, setCustomStartDate] = useState<string>(
    dayjs(selectedDateStr).subtract(30, 'day').format('YYYY-MM-DD')
  );
  const [customEndDate, setCustomEndDate] = useState<string>(selectedDateStr);

  // Sync custom range when selectedDateStr changes
  React.useEffect(() => {
    setCustomEndDate(selectedDateStr);
    setCustomStartDate(dayjs(selectedDateStr).subtract(30, 'day').format('YYYY-MM-DD'));
  }, [selectedDateStr]);

  // Date range for selected timeframe
  const timeframeRange = useMemo(() => {
    const anchor = dayjs(selectedDateStr);
    let start = anchor;
    let end = anchor;
    
    if (timeframe === 'today') {
      start = anchor;
      end = anchor;
    } else if (timeframe === '7_days') {
      start = anchor.subtract(6, 'day');
      end = anchor;
    } else if (timeframe === '30_days') {
      start = anchor.subtract(29, 'day');
      end = anchor;
    } else if (timeframe === '90_days') {
      start = anchor.subtract(89, 'day');
      end = anchor;
    } else if (timeframe === '1_year') {
      start = anchor.subtract(1, 'year').add(1, 'day');
      end = anchor;
    } else if (timeframe === 'custom') {
      start = dayjs(customStartDate || anchor.subtract(30, 'day').format('YYYY-MM-DD'));
      end = dayjs(customEndDate || selectedDateStr);
    }
    
    return { start, end };
  }, [timeframe, selectedDateStr, customStartDate, customEndDate]);

  // Number of calendar days in range
  const daysInRangeCount = useMemo(() => {
    const { start, end } = timeframeRange;
    const diff = end.diff(start, 'day') + 1;
    return Math.max(1, diff);
  }, [timeframeRange]);

  // Gather all activities across dates within timeframe range
  const filteredRangeEntries = useMemo(() => {
    const { start, end } = timeframeRange;
    const entries: { dateStr: string; entry: ActivityEntry }[] = [];
    
    Object.entries(activityRecaps).forEach(([dateStr, dayEntries]) => {
      const d = dayjs(dateStr);
      if ((d.isAfter(start) || d.isSame(start, 'day')) && (d.isBefore(end) || d.isSame(end, 'day'))) {
        dayEntries.forEach(entry => {
          entries.push({ dateStr, entry });
        });
      }
    });
    return entries;
  }, [activityRecaps, timeframeRange]);

  // Total Active Work/Study/Reading tracked hours in range (only for categories with weight >= 1)
  const totalActiveHours = useMemo(() => {
    let total = 0;
    filteredRangeEntries.forEach(({ entry }) => {
      if (entry.startTime && entry.endTime && entry.defaultType !== 'wakeup' && entry.defaultType !== 'sleep' && entry.defaultType !== 'sleep_session') {
        const weight = categoryWeights[entry.category] ?? 0;
        if (weight >= 1) {
          const [sH, sM] = entry.startTime.split(':').map(Number);
          const [eH, eM] = entry.endTime.split(':').map(Number);
          const diff = (eH * 60 + eM) - (sH * 60 + sM);
          if (diff > 0) {
            total += diff / 60;
          }
        }
      }
    });
    return total;
  }, [filteredRangeEntries]);

  // Total Sleep hours in range
  const totalSleepTrackedHours = useMemo(() => {
    let total = 0;
    filteredRangeEntries.forEach(({ entry }) => {
      if (entry.startTime && entry.endTime && entry.defaultType === 'sleep_session' && !entry.didNotSleep) {
        total += calculateSleepDuration(entry.startTime, entry.endTime);
      }
    });
    return total;
  }, [filteredRangeEntries]);

  // Total Overall tracked hours (Active + Sleep)
  const totalTrackedHours = useMemo(() => {
    return totalActiveHours + totalSleepTrackedHours;
  }, [totalActiveHours, totalSleepTrackedHours]);

  // Average Daily Active hours in range
  const avgDailyActiveHours = useMemo(() => {
    return Math.round((totalActiveHours / daysInRangeCount) * 10) / 10;
  }, [totalActiveHours, daysInRangeCount]);

  // Average Daily Sleep hours in range
  const avgDailySleepHours = useMemo(() => {
    const sleepSessionDays = new Set<string>();
    filteredRangeEntries.forEach(({ dateStr, entry }) => {
      if (entry.defaultType === 'sleep_session') {
        sleepSessionDays.add(dateStr);
      }
    });
    const divisor = Math.max(1, sleepSessionDays.size);
    return Math.round((totalSleepTrackedHours / divisor) * 10) / 10;
  }, [totalSleepTrackedHours, filteredRangeEntries]);

  // Number of days in range with logged records
  const uniqueLoggedDaysCount = useMemo(() => {
    const logged = new Set<string>();
    filteredRangeEntries.forEach(({ dateStr }) => {
      logged.add(dateStr);
    });
    return logged.size;
  }, [filteredRangeEntries]);

  // Category Totals sorted by descending hours
  const categoryTotalsRange = useMemo(() => {
    const summary: Record<string, number> = {};
    filteredRangeEntries.forEach(({ entry }) => {
      if (entry.startTime && entry.endTime && entry.defaultType !== 'wakeup' && entry.defaultType !== 'sleep' && entry.defaultType !== 'sleep_session') {
        const [sH, sM] = entry.startTime.split(':').map(Number);
        const [eH, eM] = entry.endTime.split(':').map(Number);
        const diff = (eH * 60 + eM) - (sH * 60 + sM);
        if (diff > 0) {
          summary[entry.category] = (summary[entry.category] || 0) + (diff / 60);
        }
      }
    });
    
    return Object.entries(summary).map(([category, hours]) => ({
      category,
      hours: Math.round(hours * 10) / 10
    })).sort((a, b) => b.hours - a.hours);
  }, [filteredRangeEntries]);


  // Total Weighted Productivity Score in selected range
  const totalWeightedScore = useMemo(() => {
    let total = 0;
    filteredRangeEntries.forEach(({ entry }) => {
      if (entry.startTime && entry.endTime && entry.defaultType !== 'wakeup' && entry.defaultType !== 'sleep') {
        let duration = 0;
        if (entry.defaultType === 'sleep_session') {
          if (!entry.didNotSleep) {
            duration = calculateSleepDuration(entry.startTime, entry.endTime);
          }
        } else {
          const [sH, sM] = entry.startTime.split(':').map(Number);
          const [eH, eM] = entry.endTime.split(':').map(Number);
          const diff = (eH * 60 + eM) - (sH * 60 + sM);
          if (diff > 0) {
            duration = diff / 60;
          }
        }
        const weight = (categoryWeights as any)[entry.category] ?? 0;
        total += duration * weight;
      }
    });
    return Math.round(total * 10) / 10;
  }, [filteredRangeEntries]);

  // Average Daily Weighted Productivity Score
  const avgDailyWeightedScore = useMemo(() => {
    return Math.round((totalWeightedScore / daysInRangeCount) * 10) / 10;
  }, [totalWeightedScore, daysInRangeCount]);

  const dailyProductivityRange = useMemo(() => {
    const map: Record<string, number> = {};
    const { start, end } = timeframeRange;
    
    let curr = start;
    const datesList: string[] = [];
    while (curr.isBefore(end) || curr.isSame(end, 'day')) {
      const dStr = curr.format('YYYY-MM-DD');
      map[dStr] = 0;
      datesList.push(dStr);
      curr = curr.add(1, 'day');
    }
    
    filteredRangeEntries.forEach(({ dateStr, entry }) => {
      if (entry.startTime && entry.endTime && entry.defaultType !== 'wakeup' && entry.defaultType !== 'sleep') {
        let duration = 0;
        if (entry.defaultType === 'sleep_session') {
          if (!entry.didNotSleep) {
            duration = calculateSleepDuration(entry.startTime, entry.endTime);
          }
        } else {
          const [sH, sM] = entry.startTime.split(':').map(Number);
          const [eH, eM] = entry.endTime.split(':').map(Number);
          const diff = (eH * 60 + eM) - (sH * 60 + sM);
          if (diff > 0) {
            duration = diff / 60;
          }
        }

        if (trendMetric === 'score') {
          const weight = (categoryWeights as any)[entry.category] ?? 0;
          map[dateStr] = (map[dateStr] || 0) + (duration * weight);
        } else {
          if (entry.defaultType !== 'sleep_session') {
            const weight = categoryWeights[entry.category] ?? 0;
            if (weight >= 1) {
              map[dateStr] = (map[dateStr] || 0) + duration;
            }
          }
        }
      }
    });
    
    return datesList.map(dateStr => ({
      date: dateStr,
      hours: Math.round(map[dateStr] * 10) / 10
    }));
  }, [filteredRangeEntries, timeframeRange, trendMetric]);

  // ECharts Option for Time by Category
  const timeByCategoryOption = useMemo(() => {
    const data = [...categoryTotalsRange].slice(0, 8); // Top 8 categories
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}: <b>{c}j</b>',
        backgroundColor: '#ffffff',
        borderColor: '#EBEBEB',
        borderWidth: 1,
        textStyle: { color: '#37352F' },
        borderRadius: 6,
      },
      grid: {
        top: 15,
        bottom: 15,
        left: 10,
        right: 35,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#EBEBEB' } },
        axisLabel: { color: '#787774', fontSize: 10, formatter: '{value}j' },
        axisLine: { lineStyle: { color: '#EBEBEB' } }
      },
      yAxis: {
        type: 'category',
        data: data.map(d => {
          const catObj = RECAP_CATEGORIES.find(c => c.value === d.category);
          return `${catObj?.emoji || '⚙️'} ${d.category}`;
        }),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#37352F', fontSize: 11, fontWeight: '500' },
      },
      series: [{
        type: 'bar',
        data: data.map(d => d.hours),
        barWidth: '55%',
        itemStyle: {
          color: (params: any) => {
            const cat = data[params.dataIndex].category;
            return getCategoryColor(cat);
          },
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}j',
          color: '#37352F',
          fontWeight: 'bold',
          fontSize: 10,
        }
      }]
    };
  }, [categoryTotalsRange]);

  // ECharts Option for Category Distribution Pie Chart
  const categoryDistributionOption = useMemo(() => {
    const data = categoryTotalsRange.map(item => {
      const catObj = RECAP_CATEGORIES.find(c => c.value === item.category);
      return {
        value: item.hours,
        name: `${catObj?.emoji || '⚙️'} ${item.category}`,
        itemStyle: { color: getCategoryColor(item.category) }
      };
    }).filter(d => d.value > 0);

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: <b>{c}j</b> ({d}%)',
        backgroundColor: '#ffffff',
        borderColor: '#EBEBEB',
        borderWidth: 1,
        textStyle: { color: '#37352F' },
        borderRadius: 6,
      },
      legend: {
        orient: 'vertical',
        right: '2%',
        top: 'middle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 8,
        textStyle: { color: '#37352F', fontSize: 10, fontFamily: 'Inter' },
      },
      series: [{
        name: 'Proporsi Kategori',
        type: 'pie',
        radius: '75%', // Modern solid pie chart
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        data: data,
      }]
    };
  }, [categoryTotalsRange]);

  // ECharts Option for Productivity Trend Line Chart
  const productivityTrendOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const p = params[0];
          const idx = p.dataIndex;
          const dayObj = dailyProductivityRange[idx];
          if (!dayObj) return '';
          const labelSuffix = trendMetric === 'score' ? 'Poin Skor' : 'Jam';
          return `
            <div style="font-family: Inter, sans-serif; padding: 4px; line-height: 1.4;">
              <div style="font-weight: bold; color: #4F46E5; margin-bottom: 4px;">${trendMetric === 'score' ? 'Tren Skor Produktivitas' : 'Tren Jam Produktif'}</div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 11px; color: #4F4F4F;">
                <span>Tanggal: <b>${dayjs(dayObj.date).format('DD MMM YYYY')}</b></span>
                <span style="font-weight: bold; color: #4F46E5;">${p.value} ${labelSuffix}</span>
              </div>
            </div>
          `;
        },
        backgroundColor: '#ffffff',
        borderColor: '#EBEBEB',
        borderWidth: 1,
        textStyle: { color: '#37352F' },
        borderRadius: 6,
        padding: 8,
      },
      grid: {
        top: 25,
        bottom: 25,
        left: 10,
        right: 15,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dailyProductivityRange.map(d => dayjs(d.date).format('DD/MM')),
        axisLine: { lineStyle: { color: '#EBEBEB' } },
        axisLabel: { color: '#787774', fontSize: 10, fontFamily: 'monospace' },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#EBEBEB' } },
        axisLine: { show: false },
        axisLabel: { color: '#787774', fontSize: 10, fontFamily: 'monospace', formatter: trendMetric === 'score' ? '{value}' : '{value}j' },
      },
      series: [{
        data: dailyProductivityRange.map(d => d.hours),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#4F46E5', borderWidth: 2, borderColor: '#ffffff' },
        lineStyle: { width: 3, color: '#4F46E5' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(79, 70, 229, 0.25)' },
              { offset: 1, color: 'rgba(79, 70, 229, 0)' }
            ]
          }
        },
      }],
    };
  }, [dailyProductivityRange]);



  // Date representation formatting helper (e.g., "Senin, 22 Jun 2026")
  const formattedSelectedDate = useMemo(() => {
    const d = new Date(selectedDateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('id-ID', options);
  }, [selectedDateStr]);

  // Handle previous / next day buttons
  const navigateDay = (offset: number) => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() + offset);
    const newDateStr = d.toISOString().split('T')[0];
    setSelectedDateStr(newDateStr);
  };

  // Get current day activities or initialize with defaults on-demand
  const currentActivities = useMemo(() => {
    let list: ActivityEntry[] = [];
    if (activityRecaps[selectedDateStr]) {
      list = [...activityRecaps[selectedDateStr]];
    }
    
    // Ensure there is a sleep session entry
    const hasSleepSession = list.some(e => e.defaultType === 'sleep_session');
    if (!hasSleepSession) {
      const newSession: ActivityEntry = {
        id: `ss-${selectedDateStr}`,
        startTime: '',
        endTime: '',
        description: 'Sleep Session',
        category: 'Sleep',
        notes: '',
        isDefault: true,
        defaultType: 'sleep_session',
        didNotSleep: false
      };
      // Filter out any older wakeup/sleep entries
      list = [newSession, ...list.filter(e => e.defaultType !== 'wakeup' && e.defaultType !== 'sleep')];
    } else {
      const session = list.find(e => e.defaultType === 'sleep_session')!;
      const others = list.filter(e => e.defaultType !== 'sleep_session' && e.defaultType !== 'wakeup' && e.defaultType !== 'sleep');
      
      // Sort others by start time
      others.sort((a, b) => {
        const tA = a.startTime || '23:59';
        const tB = b.startTime || '23:59';
        return tA.localeCompare(tB);
      });
      list = [session, ...others];
    }
    return list;
  }, [activityRecaps, selectedDateStr]);

  // Retrieve active sleep cycle analytics across last 30 days relative to selected date
  const sleepCycles = useMemo(() => {
    const cycles: { date: string; bedtime: string; wakeup: string; duration: number; bedtimeVal: number; wakeupVal: number; didNotSleep?: boolean }[] = [];
    const dates = Object.keys(activityRecaps).sort();
    
    const dateA = new Date(selectedDateStr);
    dateA.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const dateStr = dates[i];
      const dateB = new Date(dateStr);
      dateB.setHours(0, 0, 0, 0);
      
      const diffTime = dateA.getTime() - dateB.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      // Only include records in the last 30 days (ending on selectedDateStr, inclusive)
      if (diffDays >= 0 && diffDays < 30) {
        const dayEntries = activityRecaps[dateStr] || [];
        const session = dayEntries.find(e => e.defaultType === 'sleep_session');
        
        if (session) {
          if (session.didNotSleep) {
            cycles.push({
              date: dateStr,
              bedtime: '',
              wakeup: '',
              duration: 0,
              bedtimeVal: 0,
              wakeupVal: 0,
              didNotSleep: true
            });
          } else if (session.startTime && session.endTime) {
            const duration = calculateSleepDuration(session.startTime, session.endTime);
            cycles.push({
              date: dateStr,
              bedtime: session.startTime,
              wakeup: session.endTime,
              duration,
              bedtimeVal: timeToDecimal(session.startTime, true),
              wakeupVal: timeToDecimal(session.endTime, false),
              didNotSleep: false
            });
          }
        }
      }
    }
    return cycles;
  }, [activityRecaps, selectedDateStr]);

  // Statistics summaries
  const todaySleepCycle = useMemo(() => {
    const session = currentActivities.find(e => e.defaultType === 'sleep_session');
    if (session && !session.didNotSleep && session.startTime && session.endTime) {
      return {
        bedtime: session.startTime,
        wakeup: session.endTime,
        duration: calculateSleepDuration(session.startTime, session.endTime),
        didNotSleep: false
      };
    }
    if (session && session.didNotSleep) {
      return {
        bedtime: '',
        wakeup: '',
        duration: 0,
        didNotSleep: true
      };
    }
    return null;
  }, [currentActivities]);

  const avgSleepDuration = useMemo(() => {
    if (sleepCycles.length === 0) return 0;
    const total = sleepCycles.reduce((sum, c) => sum + c.duration, 0);
    return Math.round((total / sleepCycles.length) * 10) / 10;
  }, [sleepCycles]);

  const avgBedtimeStr = useMemo(() => {
    const validCycles = sleepCycles.filter(c => !c.didNotSleep);
    if (validCycles.length === 0) return '--:--';
    const total = validCycles.reduce((sum, c) => sum + c.bedtimeVal, 0);
    return decimalToTime(total / validCycles.length);
  }, [sleepCycles]);

  const avgWakeupStr = useMemo(() => {
    const validCycles = sleepCycles.filter(c => !c.didNotSleep);
    if (validCycles.length === 0) return '--:--';
    const total = validCycles.reduce((sum, c) => sum + c.wakeupVal, 0);
    return decimalToTime(total / validCycles.length);
  }, [sleepCycles]);

  // Category statistics of selected day for extra value
  const categorySummary = useMemo(() => {
    const summary: Record<string, number> = {};
    currentActivities.forEach(act => {
      if (act.startTime && act.endTime && act.defaultType !== 'wakeup' && act.defaultType !== 'sleep' && act.defaultType !== 'sleep_session') {
        const [sH, sM] = act.startTime.split(':').map(Number);
        const [eH, eM] = act.endTime.split(':').map(Number);
        const diff = (eH * 60 + eM) - (sH * 60 + sM);
        const hrs = diff > 0 ? diff / 60 : 0;
        
        summary[act.category] = (summary[act.category] || 0) + hrs;
      }
    });
    return Object.entries(summary).map(([category, hours]) => ({
      category,
      hours: Math.round(hours * 10) / 10
    })).sort((a, b) => b.hours - a.hours);
  }, [currentActivities]);

  // Open modal for writing/editing
  const openAddEditModal = (entry?: ActivityEntry) => {
    setValidationError(null);
    if (entry) {
      setEditingEntry(entry);
      setFormStartTime(entry.startTime || '');
      setFormEndTime(entry.endTime || '');
      setFormDescription(entry.description || '');
      setFormCategory(entry.category || 'Study');
      setFormNotes(entry.notes || '');
      setFormDidNotSleep(!!entry.didNotSleep);
    } else {
      setEditingEntry(null);
      setFormStartTime('');
      setFormEndTime('');
      setFormDescription('');
      setFormCategory('Study');
      setFormNotes('');
      setFormDidNotSleep(false);
    }
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEntry) {
      // Edit mode
      const updatedList = currentActivities.map(item => {
        if (item.id === editingEntry.id) {
          return {
            ...item,
            startTime: formDidNotSleep ? '' : formStartTime,
            endTime: item.defaultType === 'sleep_session' ? (formDidNotSleep ? '' : formEndTime) : (item.isDefault ? '' : formEndTime),
            description: item.isDefault ? item.description : formDescription,
            category: item.isDefault ? item.category : formCategory,
            notes: formNotes,
            didNotSleep: item.defaultType === 'sleep_session' ? formDidNotSleep : false
          };
        }
        return item;
      });
      onUpdateActivities(selectedDateStr, updatedList);
    } else {
      // Add mode
      const newEntry: ActivityEntry = {
        id: `act-${Date.now()}`,
        startTime: formStartTime,
        endTime: formEndTime,
        description: formDescription,
        category: formCategory,
        notes: formNotes,
        isDefault: false
      };
      onUpdateActivities(selectedDateStr, [...currentActivities, newEntry]);
    }
    
    setIsModalOpen(false);
  };

  // Handle deleting a regular entry
  const handleDeleteEntry = (id: string) => {
    const updatedList = currentActivities.filter(item => item.id !== id);
    onUpdateActivities(selectedDateStr, updatedList);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Date Navigation Bar */}
      <div className="bg-white border border-[#EBEBEB] rounded-lg p-3.5 flex items-center justify-between shadow-xs">
        <button 
          onClick={() => navigateDay(-1)}
          className="p-1.5 hover:bg-[#F1F1F0] text-[#37352F] rounded-md transition-all active:scale-95"
          title="Hari Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="relative flex flex-col items-center">
          <button 
            onClick={() => {
              const current = dayjs(selectedDateStr);
              setCalMonth(current.month());
              setCalYear(current.year());
              setShowCalendarPopover(!showCalendarPopover);
            }}
            className="flex flex-col items-center hover:bg-[#F1F1F0] px-4 py-1.5 rounded-lg transition-all group select-none cursor-pointer"
            title="Klik untuk memilih tanggal"
          >
            <span className="text-sm font-bold text-[#37352F] tracking-tight group-hover:text-[#4F46E5] transition-colors flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#787774] group-hover:text-[#4F46E5] transition-colors" />
              {formattedSelectedDate}
            </span>
            <span className="text-[10px] text-[#787774] uppercase font-semibold font-mono tracking-wider mt-0.5 group-hover:text-[#4F46E5]/80 transition-colors">
              {selectedDateStr === '2026-06-22' ? 'Hari Ini (Baseline)' : selectedDateStr}
            </span>
          </button>

          {/* Background Backdrop for clicking outside to close */}
          {showCalendarPopover && (
            <div 
              className="fixed inset-0 z-40 bg-transparent cursor-default" 
              onClick={(e) => {
                e.stopPropagation();
                setShowCalendarPopover(false);
              }} 
            />
          )}

          {/* Calendar Popover card */}
          {showCalendarPopover && (
            <div className="absolute top-full mt-2 w-[280px] bg-white border border-[#EBEBEB] shadow-lg rounded-xl p-3 z-50 text-[#37352F]">
              {/* Header: Month & Year Selector */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#F1F1F0]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    let newMonth = calMonth - 1;
                    let newYear = calYear;
                    if (newMonth < 0) {
                      newMonth = 11;
                      newYear -= 1;
                    }
                    setCalMonth(newMonth);
                    setCalYear(newYear);
                  }}
                  className="p-1 hover:bg-[#F1F1F0] text-[#787774] rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-bold text-[#37352F]">
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][calMonth]} {calYear}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    let newMonth = calMonth + 1;
                    let newYear = calYear;
                    if (newMonth > 11) {
                      newMonth = 0;
                      newYear += 1;
                    }
                    setCalMonth(newMonth);
                    setCalYear(newYear);
                  }}
                  className="p-1 hover:bg-[#F1F1F0] text-[#787774] rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Days of Week Header Grid */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                  <span key={d} className="text-[10px] font-bold text-[#787774] uppercase">
                    {d.substring(0, 1)}
                  </span>
                ))}
              </div>

              {/* Days Cells Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((cell, idx) => {
                  const isSelected = cell.dateStr === selectedDateStr;
                  const isToday = cell.dateStr === '2026-06-22'; // Baseline
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDateStr(cell.dateStr);
                        setShowCalendarPopover(false);
                      }}
                      className={`
                        h-7 text-xs font-semibold rounded-md flex items-center justify-center transition-all select-none cursor-pointer
                        ${!cell.isCurrentMonth ? 'text-[#787774]/40 hover:bg-[#F1F1F0]/50' : 'text-[#37352F] hover:bg-[#F1F1F0]'}
                        ${isSelected ? '!bg-[#4F46E5] !text-white' : ''}
                        ${isToday && !isSelected ? 'border border-[#4F46E5] text-[#4F46E5]' : ''}
                      `}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              {/* Shortcut buttons at bottom */}
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#F1F1F0]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDateStr('2026-06-22');
                    setShowCalendarPopover(false);
                  }}
                  className="flex-1 text-[10px] font-bold py-1.5 bg-[#F1F1F0] hover:bg-[#EBEBEB] rounded text-[#37352F] transition-colors cursor-pointer"
                >
                  Baseline
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const todayStr = dayjs().format('YYYY-MM-DD');
                    setSelectedDateStr(todayStr);
                    setShowCalendarPopover(false);
                  }}
                  className="flex-1 text-[10px] font-bold py-1.5 bg-white border border-[#EBEBEB] hover:bg-[#F1F1F0] rounded text-[#37352F] transition-colors cursor-pointer"
                >
                  Hari Ini
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => navigateDay(1)}
          className="p-1.5 hover:bg-[#F1F1F0] text-[#37352F] rounded-md transition-all active:scale-95"
          title="Hari Berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Layout: Timeline first, then Analytics below */}
      <div className="space-y-8">
        
        {/* Activity Timeline (Full-width) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-[#10B981] rounded-xs" />
              <h3 className="text-sm font-bold text-[#37352F] uppercase tracking-wider">Lini Masa Kegiatan (Timeline)</h3>
            </div>
            
            <button
              onClick={() => openAddEditModal()}
              className="flex items-center gap-1 text-xs font-semibold bg-[#10B981] text-white px-3 py-1.5 rounded-md hover:bg-[#0D9668] transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kegiatan</span>
            </button>
          </div>

          {/* Timeline List */}
          <div className="relative border-l-2 border-[#EBEBEB] ml-3.5 pl-6 space-y-5">
            {currentActivities.map((act) => {
              const categoryObj = RECAP_CATEGORIES.find(c => c.value === act.category);
              const isSleepSession = act.defaultType === 'sleep_session';
              const isFilled = isSleepSession 
                ? (act.didNotSleep || (!!act.startTime && !!act.endTime)) 
                : !!act.startTime;
              
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`relative group bg-white border p-4 rounded-xl shadow-xs transition-all hover:shadow-sm ${
                    isSleepSession 
                      ? 'border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/10' 
                      : 'border-[#EBEBEB] hover:border-[#10B981]/40'
                  }`}
                >
                  {/* Circle Indicator on the left-border line */}
                  <div className={`absolute -left-[31px] top-5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-colors ${
                    isFilled 
                      ? (isSleepSession ? 'border-indigo-500' : 'border-[#10B981]') 
                      : 'border-amber-400'
                  }`}>
                    {isSleepSession ? (
                      <Moon className="w-2 h-2 text-indigo-500 fill-indigo-500" />
                    ) : (
                      <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                    )}
                  </div>

                  {/* Top line content: Time and Category Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1 text-xs font-bold text-[#37352F] bg-[#F1F1F0] px-2.5 py-1 rounded-md border border-[#EBEBEB] font-mono">
                        <Clock className="w-3 h-3 text-[#787774]" />
                        {isSleepSession && act.didNotSleep ? (
                          <span className="text-amber-700 font-bold uppercase tracking-wider text-[10px]">Did Not Sleep ☕</span>
                        ) : (
                          <>
                            <span>{act.startTime ? act.startTime : '--:--'}</span>
                            <span className="opacity-40">-</span>
                            <span>{act.endTime ? act.endTime : '--:--'}</span>
                          </>
                        )}
                      </div>

                      {categoryObj && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 uppercase tracking-wider ${categoryObj.color}`}>
                          <span>{categoryObj.emoji}</span>
                          <span>{categoryObj.label}</span>
                        </span>
                      )}

                      {act.isDefault && (
                        <span className="text-[9px] font-bold bg-[#FFFBEB] text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30 px-1.5 py-0.2 rounded-sm uppercase font-mono">
                          Wajib
                        </span>
                      )}
                    </div>

                    {/* Timeline Controls */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openAddEditModal(act)}
                        className="p-1 hover:bg-[#F1F1F0] rounded text-[#37352F] transition-all"
                        title="Edit Entri"
                      >
                        <span className="text-[11px] font-semibold text-[#10B981] hover:underline">Edit</span>
                      </button>
                      
                      {!act.isDefault && (
                        <button
                          onClick={() => handleDeleteEntry(act.id)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded transition-all"
                          title="Hapus Entri"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Middle Line Content: Description */}
                  <div className="mt-2.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#37352F]">
                        {act.description}
                      </h4>
                      {isSleepSession && !act.didNotSleep && act.startTime && act.endTime && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-100/50">
                          {calculateSleepDuration(act.startTime, act.endTime)} Jam
                        </span>
                      )}
                    </div>
                    
                    {!isFilled && (
                      <p className="text-xs text-amber-600 font-medium italic mt-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-md border border-amber-100/50 w-fit">
                        {isSleepSession 
                          ? '⚠️ Belum mengisi jam tidur. Klik edit untuk mengisi catatan tidur.' 
                          : '⚠️ Belum mengisi jam. Klik edit untuk mengisi catatan aktivitas hari ini.'}
                      </p>
                    )}
                  </div>

                  {/* Bottom Line Content: Optional Notes / Chat Box */}
                  {act.notes && (
                    <div className="mt-3 bg-[#F7F7F5] border border-[#EBEBEB] rounded-lg p-2.5 text-xs text-[#4F4F4F] relative flex items-start gap-2.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#787774] shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <span className="text-[10px] font-bold text-[#787774] block uppercase font-mono">Catatan Harian:</span>
                        <p className="leading-relaxed whitespace-pre-wrap">{act.notes}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Full-width Activity Analytics Section */}
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 shadow-xs space-y-6">
          
          {/* Header & Timeframe Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EBEBEB] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-5 bg-[#4F46E5] rounded-xs" />
              <div>
                <h3 className="text-base font-bold text-[#37352F] uppercase tracking-wider">Activity Analytics</h3>
                <p className="text-xs text-[#787774] mt-0.5">Analisis mendalam dan visualisasi tren alokasi waktu aktivitas harian Anda</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-bold text-[#787774]">Rentang Analisis:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-[#F7F7F5] border border-[#EBEBEB] text-[#37352F] text-xs font-bold px-3 py-2 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#4F46E5]/40"
              >
                <option value="today">Today (Hari Ini)</option>
                <option value="7_days">7 Days (Seminggu)</option>
                <option value="30_days">30 Days (30 Hari)</option>
                <option value="90_days">90 Days (90 Hari)</option>
                <option value="1_year">1 Year (1 Tahun)</option>
                <option value="custom">Custom Range (Pilih Rentang)</option>
              </select>
            </div>
          </div>

          {/* Custom Date Inputs */}
          {timeframe === 'custom' && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-4 p-3.5 bg-[#F7F7F5] border border-[#EBEBEB] rounded-lg text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#787774]">Tanggal Mulai:</span>
                <input 
                  type="date" 
                  value={customStartDate} 
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-white border border-[#EBEBEB] px-3 py-1.5 rounded-md text-[#37352F] font-mono focus:outline-hidden focus:border-[#4F46E5] font-semibold"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#787774]">Tanggal Selesai:</span>
                <input 
                  type="date" 
                  value={customEndDate} 
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-white border border-[#EBEBEB] px-3 py-1.5 rounded-md text-[#37352F] font-mono focus:outline-hidden focus:border-[#4F46E5] font-semibold"
                />
              </div>
            </motion.div>
          )}

          {/* Bento metric highlights deck */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#F7F7F5] border border-[#EBEBEB] rounded-xl p-4 transition-all hover:shadow-xs">
              <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Total Tracked Hours</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-extrabold text-[#37352F] font-mono">{totalTrackedHours.toFixed(1)}j</span>
                <span className="text-[10px] text-[#787774] font-bold">aktif + tidur</span>
              </div>
              <p className="text-[10px] text-[#787774] mt-2.5 leading-tight">Total durasi waktu terekam dalam rentang waktu aktif</p>
            </div>

            <div className="bg-[#F7F7F5] border border-[#EBEBEB] rounded-xl p-4 transition-all hover:shadow-xs">
              <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Active Productive</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-extrabold text-[#10B981] font-mono">{totalActiveHours.toFixed(1)}j</span>
                <span className="text-[10px] text-[#10B981] font-bold">avg: {avgDailyActiveHours}j/hari</span>
              </div>
              <p className="text-[10px] text-[#787774] mt-2.5 leading-tight">Total jam kegiatan di luar tidur dan istirahat pasif</p>
            </div>

            <div className="bg-[#F7F7F5] border border-[#EBEBEB] rounded-xl p-4 transition-all hover:shadow-xs">
              <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Sleep Quality Hours</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-extrabold text-[#4F46E5] font-mono">{totalSleepTrackedHours.toFixed(1)}j</span>
                <span className="text-[10px] text-[#4F46E5] font-bold">avg: {avgDailySleepHours}j/hari</span>
              </div>
              <p className="text-[10px] text-[#787774] mt-2.5 leading-tight font-sans">Rerata tidur harian, dengan begadang terhitung 0 jam</p>
            </div>

            <div className="bg-[#F7F7F5] border border-[#EBEBEB] rounded-xl p-4 transition-all hover:shadow-xs">
              <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Days Tracked</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-extrabold text-[#D9730D] font-mono">{uniqueLoggedDaysCount} Hari</span>
                <span className="text-[10px] text-[#D9730D] font-bold">aktif</span>
              </div>
              <p className="text-[10px] text-[#787774] mt-2.5 leading-tight">Total hari unik yang terisi catatan dalam rentang waktu</p>
            </div>
          </div>

          {/* Widgets Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             {/* Widget 1: Time by Category (Horizontal Bar Chart) */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-5 shadow-xs flex flex-col justify-between lg:col-span-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3.5 bg-[#10B981] rounded-xs" />
                  <h4 className="text-xs font-bold text-[#37352F] uppercase tracking-wider">Time by Category</h4>
                </div>
                <p className="text-[11px] text-[#787774] mb-4">Total alokasi jam kerja fokus per kategori kegiatan produktif Anda.</p>
              </div>

              <div className="relative w-full h-[250px] my-2">
                {categoryTotalsRange.length === 0 ? (
                  <div className="py-12 h-full flex items-center justify-center text-xs text-[#787774] italic">
                    Belum ada alokasi aktivitas produktif dalam rentang ini.
                  </div>
                ) : (
                  <EChart options={timeByCategoryOption as any} className="h-full w-full" />
                )}
              </div>
            </div>

            {/* Widget 2: Category Distribution (Solid Pie Chart in ECharts) */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-5 shadow-xs flex flex-col justify-between lg:col-span-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3.5 bg-[#6931E3] rounded-xs" />
                  <h4 className="text-xs font-bold text-[#37352F] uppercase tracking-wider">Category Distribution</h4>
                </div>
                <p className="text-[11px] text-[#787774] mb-4">Proporsi persentase alokasi waktu aktivitas produktif Anda.</p>
              </div>

              <div className="relative w-full h-[250px] my-2">
                {categoryTotalsRange.length === 0 ? (
                  <div className="py-12 h-full flex items-center justify-center text-xs text-[#787774] italic">
                    Belum ada alokasi data kategori terdaftar.
                  </div>
                ) : (
                  <EChart options={categoryDistributionOption as any} className="h-full w-full" />
                )}
              </div>
            </div>

            {/* Widget 3: Productivity Trend (Line Chart) */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-5 shadow-xs flex flex-col justify-between lg:col-span-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-[#4F46E5] rounded-xs" />
                    <h4 className="text-xs font-bold text-[#37352F] uppercase tracking-wider">Productivity Trend</h4>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F1F1F0] p-0.5 rounded-lg shrink-0">
                    <button
                      onClick={() => setTrendMetric('hours')}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all ${trendMetric === 'hours' ? 'bg-white text-[#37352F] shadow-xs' : 'text-[#787774] hover:text-[#37352F]'}`}
                    >
                      Jam Kerja
                    </button>
                    <button
                      onClick={() => setTrendMetric('score')}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all ${trendMetric === 'score' ? 'bg-white text-[#37352F] shadow-xs' : 'text-[#787774] hover:text-[#37352F]'}`}
                    >
                      Skor Bobot
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-[#787774] mb-4">
                  {trendMetric === 'score' 
                    ? 'Grafik fluktuasi total nilai skor produktivitas harian berdasarkan bobot kategori.'
                    : 'Grafik fluktuasi total jam aktivitas kerja produktif harian Anda.'}
                </p>
              </div>

              <div className="relative w-full h-[250px] my-2">
                {dailyProductivityRange.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#787774] italic">
                    Belum ada data untuk memetakan visualisasi tren produktivitas.
                  </div>
                ) : (
                  <EChart options={productivityTrendOption as any} className="h-full w-full" />
                )}
              </div>
            </div>

            {/* Widget 4: Top Hours Rank Categories */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-5 shadow-xs flex flex-col justify-between lg:col-span-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-3.5 bg-[#D9730D] rounded-xs" />
                  <h4 className="text-xs font-bold text-[#37352F] uppercase tracking-wider">Top Hours (Peringkat)</h4>
                </div>
                <p className="text-[11px] text-[#787774] mb-4">Kategori aktivitas teraktif diurutkan berdasarkan akumulasi jam tertinggi.</p>
              </div>

              {categoryTotalsRange.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#787774] italic">
                  Belum ada data peringkat aktivitas.
                </div>
              ) : (
                <div className="space-y-3.5 my-2">
                  {categoryTotalsRange.slice(0, 5).map((item, idx) => {
                    const catObj = RECAP_CATEGORIES.find(c => c.value === item.category);
                    const avgDaily = item.hours / daysInRangeCount;
                    const rankColors = [
                      'bg-amber-100 text-amber-700 border-amber-200',
                      'bg-slate-100 text-slate-700 border-slate-200',
                      'bg-amber-50 text-amber-800/80 border-amber-100',
                      'bg-neutral-50 text-neutral-600 border-neutral-100',
                      'bg-neutral-50 text-neutral-600 border-neutral-100',
                    ];
                    return (
                      <div key={item.category} className="flex items-center justify-between p-2.5 bg-[#F7F7F5] border border-[#EBEBEB] rounded-lg">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-6.5 h-6.5 border flex items-center justify-center rounded-full text-xs font-extrabold font-mono shrink-0 ${rankColors[idx] || 'bg-neutral-50 text-neutral-500'}`}>
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#37352F] flex items-center gap-1">
                              <span>{catObj?.emoji}</span>
                              <span className="truncate">{item.category}</span>
                            </span>
                            <span className="text-[10px] text-[#787774] block font-mono">
                              avg: {avgDaily.toFixed(1)}j / hari
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-[#37352F] font-mono bg-white px-2.5 py-1 border border-[#EBEBEB] rounded-md shrink-0">
                          {item.hours.toFixed(1)}j
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Reference Matrix & Weighted Productivity Score Section */}
          <div className="border-t border-[#EBEBEB] pt-6 mt-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-5 bg-[#10B981] rounded-xs" />
                <div>
                  <h4 className="text-sm font-bold text-[#37352F] uppercase tracking-wider">Reference Matrix & Skor Produktivitas</h4>
                  <p className="text-xs text-[#787774] mt-0.5">Metrik pembobotan aktivitas terstandarisasi untuk mengukur efektivitas harian.</p>
                </div>
              </div>
              
              {/* Score summary badge */}
              <div className="flex items-center gap-3 bg-[#E7F3EF] border border-[#10B981]/25 p-3 rounded-xl shrink-0">
                <div>
                  <div className="text-[10px] text-[#0D7A5E] font-bold uppercase tracking-wider leading-none">Rerata Skor Harian</div>
                  <div className="text-lg font-black text-[#0D7A5E] font-mono mt-0.5 leading-none">
                    {avgDailyWeightedScore} <span className="text-xs font-normal">poin/hari</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score interpretation card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4.5 bg-[#F7F7F5] border border-[#EBEBEB] rounded-xl text-xs">
              <div className="md:col-span-5 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Status Produktivitas</span>
                  <div className="text-sm font-bold text-[#37352F] mt-1 flex items-center gap-2">
                    {avgDailyWeightedScore >= 25 ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                        <span className="text-[#10B981]">Sangat Produktif (Excellent Focus)</span>
                      </>
                    ) : avgDailyWeightedScore >= 15 ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-indigo-600">Produktif (Optimal Balance)</span>
                      </>
                    ) : avgDailyWeightedScore >= 5 ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-amber-600">Cukup Produktif (Maintenance)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-rose-600">Kurang Produktif / Recovery Mode</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[#787774] leading-relaxed">
                  Skor terhitung secara otomatis dari: <code className="bg-white px-1 py-0.5 rounded border border-[#EBEBEB] font-mono">Σ (Durasi Kegiatan × Bobot Kategori)</code>. 
                  Gunakan visualisasi trend untuk memantau fluktuasi skor Anda dari hari ke hari.
                </p>
              </div>

              {/* Quick stats distribution summary */}
              <div className="md:col-span-7 grid grid-cols-3 gap-3">
                <div className="bg-white border border-[#EBEBEB] p-3 rounded-lg flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-[#787774] uppercase tracking-wider block">Total Skor Terbobot</span>
                  <span className="text-lg font-extrabold text-[#37352F] font-mono mt-1 block">{totalWeightedScore}</span>
                  <span className="text-[9px] text-[#787774] block mt-1">poin terkumpul</span>
                </div>
                <div className="bg-white border border-[#EBEBEB] p-3 rounded-lg flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-[#787774] uppercase tracking-wider block">Fokus Utama (Bobot 5)</span>
                  <span className="text-lg font-extrabold text-[#4F46E5] font-mono mt-1 block">
                    {categoryTotalsRange
                      .filter(item => ['Work', 'Study', 'Reading'].includes(item.category))
                      .reduce((sum, item) => sum + item.hours, 0)
                      .toFixed(1)}j
                  </span>
                  <span className="text-[9px] text-[#787774] block mt-1">Work / Study / Reading</span>
                </div>
                <div className="bg-white border border-[#EBEBEB] p-3 rounded-lg flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-[#787774] uppercase tracking-wider block">Downtime & Leisure</span>
                  <span className="text-lg font-extrabold text-[#F43F5E] font-mono mt-1 block">
                    {categoryTotalsRange
                      .filter(item => ['Entertainment', 'Gaming', 'Other'].includes(item.category))
                      .reduce((sum, item) => sum + item.hours, 0)
                      .toFixed(1)}j
                  </span>
                  <span className="text-[9px] text-[#787774] block mt-1">Entertainment / Game / Lain</span>
                </div>
              </div>
            </div>

            {/* Reference Table of weights */}
            <div className="overflow-x-auto bg-white border border-[#EBEBEB] rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F7F5] border-b border-[#EBEBEB] text-[10px] font-bold text-[#787774] uppercase tracking-wider">
                    <th className="py-2.5 px-4">Kategori Kegiatan</th>
                    <th className="py-2.5 px-4 text-center">Value (0 - 5)</th>
                    <th className="py-2.5 px-4">Tingkat Produktivitas</th>
                    <th className="py-2.5 px-4">Catatan Akademis & Evaluasi</th>
                    <th className="py-2.5 px-4 text-right">Terpakai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F1F0] text-xs text-[#37352F]">
                  {[
                    { name: 'Work', weight: 5, level: 'High', style: 'text-sky-700 bg-sky-50 dark:bg-sky-950/20', notes: 'Indikator output utama profesional/proyek.', emoji: '💻' },
                    { name: 'Study', weight: 5, level: 'High', style: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/20', notes: 'Indikator pembelajaran aktif dan peningkatan kapabilitas.', emoji: '📚' },
                    { name: 'Reading', weight: 5, level: 'High', style: 'text-lime-700 bg-lime-50 dark:bg-lime-950/20', notes: 'Asumsi: Membaca teks substantif/edukatif (bukan fiksi ringan).', emoji: '📖' },
                    { name: 'Exercise', weight: 4, level: 'Supporting', style: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20', notes: 'Vital untuk menjaga stamina fisik dan fokus kognitif jangka panjang.', emoji: '🏃‍♂️' },
                    { name: 'Meeting', weight: 4, level: 'Supporting', style: 'text-teal-700 bg-teal-50 dark:bg-teal-950/20', notes: 'Produktif jika memiliki agenda jelas dan menghasilkan keputusan.', emoji: '👥' },
                    { name: 'Health', weight: 3, level: 'Maintenance', style: 'text-red-700 bg-red-50 dark:bg-red-950/20', notes: 'Tindakan preventif agar performa harian tidak drop.', emoji: '🏥' },
                    { name: 'Worship', weight: 3, level: 'Maintenance', style: 'text-amber-700 bg-amber-50 dark:bg-amber-950/20', notes: 'Menjaga stabilitas mental, spiritual, dan fokus internal.', emoji: '🙏' },
                    { name: 'Sleep', weight: 3, level: 'Maintenance', style: 'text-blue-700 bg-blue-50 dark:bg-blue-950/20', notes: 'Penting untuk recovery biologis, kesehatan mental, dan konsolidasi memori.', emoji: '😴' },
                    { name: 'Rest', weight: 2, level: 'Neutral', style: 'text-stone-700 bg-stone-50 dark:bg-stone-950/20', notes: 'Necessary downtime. Krusial untuk recovery, tapi harus dibatasi.', emoji: '🛋️' },
                    { name: 'Eating', weight: 2, level: 'Neutral', style: 'text-yellow-700 bg-yellow-50 dark:bg-yellow-950/20', notes: 'Kebutuhan biologis fundamental untuk energi.', emoji: '🍔' },
                    { name: 'Shopping', weight: 2, level: 'Neutral', style: 'text-pink-700 bg-pink-50 dark:bg-pink-950/20', notes: 'Urusan logistik harian. Usahakan seefisien mungkin.', emoji: '🛒' },
                    { name: 'Travel', weight: 2, level: 'Neutral', style: 'text-cyan-700 bg-cyan-50 dark:bg-cyan-950/20', notes: 'Berpotensi menjadi time sink (waktu terbuang). Optimalkan durasinya.', emoji: '✈️' },
                    { name: 'Family', weight: 1, level: 'Low / Recovery', style: 'text-orange-700 bg-orange-50 dark:bg-orange-950/20', notes: 'Penting untuk aspek kehidupan sosial, namun bernilai rendah dalam metrik kerja.', emoji: '🏠' },
                    { name: 'Social', weight: 1, level: 'Low / Recovery', style: 'text-rose-700 bg-rose-50 dark:bg-rose-950/20', notes: 'Masuk kategori networking atau sekadar rekreasi sosial (nongkrong).', emoji: '🤝' },
                    { name: 'Entertainment', weight: 0, level: 'Pure Leisure', style: 'text-purple-700 bg-purple-50 dark:bg-purple-950/20', notes: 'Konsumsi konten pasif. Gunakan hanya untuk burnout prevention.', emoji: '🎬' },
                    { name: 'Gaming', weight: 0, level: 'Pure Leisure', style: 'text-fuchsia-700 bg-fuchsia-50 dark:bg-fuchsia-950/20', notes: 'Hiburan murni. Durasi wajib dikontrol ketat.', emoji: '🎮' },
                    { name: 'Other', weight: 0, level: 'Unclassified', style: 'text-gray-700 bg-gray-50 dark:bg-gray-950/20', notes: 'Kategori default untuk aktivitas yang tidak terdefinisi.', emoji: '⚙️' }
                  ].map((row) => {
                    const matchedTotal = categoryTotalsRange.find(item => item.category === row.name);
                    const isUsed = matchedTotal && matchedTotal.hours > 0;
                    return (
                      <tr 
                        key={row.name} 
                        className={`transition-colors hover:bg-[#F7F7F5] ${isUsed ? 'bg-[#10B981]/5 font-medium' : ''}`}
                      >
                        <td className="py-2 px-4 flex items-center gap-2">
                          <span>{row.emoji}</span>
                          <span className="font-bold">{row.name}</span>
                        </td>
                        <td className="py-2 px-4 text-center font-bold font-mono">
                          <span className="px-2 py-0.5 bg-[#F1F1F0] rounded border border-[#EBEBEB]">
                            {row.weight}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.style}`}>
                            {row.level}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-[#787774] leading-relaxed max-w-sm truncate hover:text-clip hover:whitespace-normal">
                          {row.notes}
                        </td>
                        <td className="py-2 px-4 text-right font-mono text-[11px]">
                          {isUsed ? (
                            <span className="text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md font-bold">
                              {matchedTotal.hours.toFixed(1)}j
                            </span>
                          ) : (
                            <span className="text-[#787774]/40">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Slide-over Form / Modal for Add & Edit Entries */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-x-4 top-[10%] max-w-lg mx-auto bg-white border border-[#EBEBEB] p-6 rounded-xl shadow-xl z-50 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#10B981]" />
                  <h4 className="text-base font-bold text-[#37352F]">
                    {editingEntry ? `Edit: ${editingEntry.description}` : 'Catat Kegiatan Baru'}
                  </h4>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-[#F1F1F0] rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-[#787774]" />
                </button>
              </div>

              <form onSubmit={handleSaveEntry} className="space-y-4">
                
                {/* Did Not Sleep Toggle for Sleep Session */}
                {editingEntry?.defaultType === 'sleep_session' && (
                  <div className="flex items-center justify-between p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 rounded-lg">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#37352F] flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-indigo-500" />
                        Did Not Sleep (Tidak Tidur)
                      </span>
                      <span className="text-[10px] text-[#787774] block">
                        Aktifkan jika Anda begadang semalaman dan tidak tidur.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formDidNotSleep} 
                        onChange={(e) => setFormDidNotSleep(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                )}

                {/* Time Fields */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">
                        {editingEntry?.defaultType === 'sleep_session' ? 'Waktu Mulai Tidur (Start)' : 'Waktu Mulai (Start)'}
                      </label>
                      <MobileTimePicker
                        value={formStartTime ? parseTimeToDayjs(formStartTime) : null}
                        onChange={(newValue) => {
                          if (newValue && newValue.isValid()) {
                            setFormStartTime(newValue.format('HH:mm'));
                          } else {
                            setFormStartTime('');
                          }
                        }}
                        disabled={formDidNotSleep}
                        ampm={false}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            required: !formDidNotSleep,
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#F7F7F5',
                                fontSize: '0.75rem',
                                borderRadius: '0.5rem',
                                fontFamily: 'monospace',
                                '& fieldset': {
                                  borderColor: '#EBEBEB',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#10B981',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#10B981',
                                  borderWidth: '1px',
                                },
                              },
                              '& .MuiInputBase-input': {
                                padding: '8px 12px',
                                color: '#37352F',
                              }
                            }
                          }
                        }}
                      />
                    </div>

                    {(!editingEntry?.isDefault || editingEntry?.defaultType === 'sleep_session') && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">
                          {editingEntry?.defaultType === 'sleep_session' ? 'Waktu Bangun (End)' : 'Waktu Selesai (End)'}
                        </label>
                        <MobileTimePicker
                          value={formEndTime ? parseTimeToDayjs(formEndTime) : null}
                          onChange={(newValue) => {
                            if (newValue && newValue.isValid()) {
                              setFormEndTime(newValue.format('HH:mm'));
                            } else {
                              setFormEndTime('');
                            }
                          }}
                          disabled={formDidNotSleep}
                          ampm={false}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              required: !formDidNotSleep,
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: '#F7F7F5',
                                  fontSize: '0.75rem',
                                  borderRadius: '0.5rem',
                                  fontFamily: 'monospace',
                                  '& fieldset': {
                                    borderColor: '#EBEBEB',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#10B981',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#10B981',
                                    borderWidth: '1px',
                                  },
                                },
                                '& .MuiInputBase-input': {
                                  padding: '8px 12px',
                                  color: '#37352F',
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </LocalizationProvider>

                {/* Validation Error Message */}
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600 flex items-start gap-2">
                    <span className="text-red-500 font-bold">⚠️</span>
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Description - Hidden or disabled for default entries */}
                {!editingEntry?.isDefault && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Nama Kegiatan (Deskripsi)</label>
                    <input
                      type="text"
                      placeholder="e.g. Belajar Kotlin dasar..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      required
                      className="w-full bg-[#F7F7F5] border border-[#EBEBEB] text-xs px-3 py-2.5 rounded-lg outline-hidden focus:border-[#10B981]/50"
                    />
                  </div>
                )}

                {/* Categories Chips - Hidden for default entries */}
                {!editingEntry?.isDefault && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Kategori Kegiatan</label>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-[#F7F7F5] border border-[#EBEBEB] rounded-lg">
                      {RECAP_CATEGORIES.filter(c => c.value !== 'Sleep').map(cat => {
                        const isSelected = formCategory === cat.value;
                        return (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setFormCategory(cat.value)}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                              isSelected 
                                ? 'bg-[#10B981] text-white border-[#10B981]' 
                                : 'bg-white text-[#4F4F4F] border-[#EBEBEB] hover:bg-[#F1F1F0]'
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Journal Notes / Chat Area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Detail Catatan / Chat Harian</label>
                  <textarea
                    placeholder="Tulis detail aktivitas, pemikiran, kendala, atau sekadar cerita harian di sini..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-[#F7F7F5] border border-[#EBEBEB] text-xs px-3 py-2.5 rounded-lg outline-hidden focus:border-[#10B981]/50 resize-none leading-relaxed"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EBEBEB]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs font-semibold text-[#787774] bg-[#F1F1F0] hover:bg-[#EBEBEB] px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-semibold bg-[#10B981] hover:bg-[#0D9668] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Catatan</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
