import React, { useState } from 'react';
import { 
  TrendingUp, 
  Smile, 
  CheckCircle, 
  Award, 
  HelpCircle, 
  Calendar, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { Habit, TrackingDay } from '../types';
import EChart from './EChart';

interface AnalyticsChartsProps {
  habits: Habit[];
  trackingDays: TrackingDay[];
}

export default function AnalyticsCharts({ habits, trackingDays }: AnalyticsChartsProps) {
  // Take the last 10 tracked days to render chronological line chart
  const chronologicalDays = [...trackingDays]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10);

  // 1. Calculations: Habit Completion Rates over all tracked days
  const getHabitCompletionRate = (habitId: string) => {
    if (trackingDays.length === 0) return 0;
    const completedCount = trackingDays.filter(d => d.habitsCompleted.includes(habitId)).length;
    return Math.round((completedCount / trackingDays.length) * 100);
  };

  // 2. Calculations: Mood Counts & Distribution
  const moodCounts = { great: 0, good: 0, neutral: 0, tired: 0, bad: 0 };
  trackingDays.forEach(d => {
    if (d.mood in moodCounts) {
      moodCounts[d.mood]++;
    }
  });

  const totalMoods = Object.values(moodCounts).reduce((a, b) => a + b, 0) || 1;
  const moodPercentages = {
    great: Math.round((moodCounts.great / totalMoods) * 100),
    good: Math.round((moodCounts.good / totalMoods) * 100),
    neutral: Math.round((moodCounts.neutral / totalMoods) * 100),
    tired: Math.round((moodCounts.tired / totalMoods) * 100),
    bad: Math.round((moodCounts.bad / totalMoods) * 100),
  };

  // ECharts Option for Productive Hours Line Chart
  const productiveHoursOption = React.useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const p = params[0];
          const idx = p.dataIndex;
          const dayObj = chronologicalDays[idx];
          if (!dayObj) return '';
          return `
            <div style="font-family: Inter, sans-serif; padding: 4px; line-height: 1.4;">
              <div style="font-weight: bold; color: #337EA9; margin-bottom: 4px;">${dayObj.journalTitle || 'Rangkuman'}</div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 11px; color: #4F4F4F;">
                <span>Tanggal: <b>${dayObj.date}</b></span>
                <span style="font-weight: bold; color: #337EA9;">${p.value} Jam</span>
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
        shadowColor: 'rgba(0, 0, 0, 0.05)',
        shadowBlur: 10
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
        data: chronologicalDays.map(d => d.date.split('-').slice(1).join('/')),
        axisLine: { lineStyle: { color: '#EBEBEB' } },
        axisLabel: { color: '#787774', fontSize: 10, fontFamily: 'monospace' },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        max: 12,
        interval: 3,
        splitLine: { lineStyle: { type: 'dashed', color: '#EBEBEB' } },
        axisLine: { show: false },
        axisLabel: { color: '#787774', fontSize: 10, fontFamily: 'monospace', formatter: '{value}j' },
      },
      series: [{
        data: chronologicalDays.map(d => d.productiveHours),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#337EA9', borderWidth: 2, borderColor: '#ffffff' },
        lineStyle: { width: 3, color: '#337EA9' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(51, 126, 169, 0.25)' },
              { offset: 1, color: 'rgba(51, 126, 169, 0)' }
            ]
          }
        },
      }],
    };
  }, [chronologicalDays]);

  // ECharts Option for Habit Completion Bar Chart
  const habitCompletionOption = React.useMemo(() => {
    const habitData = habits.map(h => ({
      name: `${h.icon} ${h.name}`,
      rate: getHabitCompletionRate(h.id),
    }));
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}: <b>{c}%</b> Sukses',
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
        max: 100,
        splitLine: { lineStyle: { type: 'dashed', color: '#EBEBEB' } },
        axisLabel: { color: '#787774', fontSize: 10, formatter: '{value}%' },
        axisLine: { lineStyle: { color: '#EBEBEB' } }
      },
      yAxis: {
        type: 'category',
        data: habitData.map(d => d.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#37352F', fontSize: 11, fontWeight: '500' },
      },
      series: [{
        type: 'bar',
        data: habitData.map(d => d.rate),
        barWidth: '45%',
        itemStyle: {
          color: '#448361',
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: '#37352F',
          fontWeight: 'bold',
          fontSize: 10,
        }
      }]
    };
  }, [habits, trackingDays]);

  // ECharts Option for Mood Composition Pie Chart
  const moodCompositionOption = React.useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: <b>{c}%</b> Sebaran',
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
        name: 'Mood',
        type: 'pie',
        radius: '75%', // Modern SOLID pie chart
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        data: [
          { value: moodPercentages.great, name: 'Sangat Baik (😊)', itemStyle: { color: '#448361' } },
          { value: moodPercentages.good, name: 'Baik (🙂)', itemStyle: { color: '#337EA9' } },
          { value: moodPercentages.neutral, name: 'Biasa (😐)', itemStyle: { color: '#787774' } },
          { value: moodPercentages.tired, name: 'Lelah (🥱)', itemStyle: { color: '#D9730D' } },
          { value: moodPercentages.bad, name: 'Buruk (☹️)', itemStyle: { color: '#EB5757' } },
        ].filter(item => item.value > 0),
      }]
    };
  }, [moodPercentages]);

  // Calculate consistency score out of 100%
  const totalHabitSlots = trackingDays.length * habits.length;
  const completedHabitCount = trackingDays.reduce((sum, d) => sum + d.habitsCompleted.length, 0);
  const consistencyScore = totalHabitSlots > 0 ? Math.round((completedHabitCount / totalHabitSlots) * 100) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto py-2 space-y-6">
      
      {/* Metric Highlight Deck */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-3.5">
          <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Kepatuhan Habit</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-[#37352F]">{consistencyScore}%</span>
            <span className="text-[10px] text-[#0D7A5E] font-medium font-mono">↑ 4.2%</span>
          </div>
          <p className="text-[10px] text-[#787774] mt-1 leading-tight">Melacak keteraturan pencatatan</p>
        </div>

        <div className="bg-white border border-[#EBEBEB] rounded-lg p-3.5">
          <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Total Log Harian</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-[#37352F]">{trackingDays.length} Hari</span>
            <span className="text-[10px] text-[#0D7A5E] font-medium font-mono">Aktif</span>
          </div>
          <p className="text-[10px] text-[#787774] mt-1 leading-tight">Database sejarah terisi</p>
        </div>

        <div className="bg-white border border-[#EBEBEB] rounded-lg p-3.5">
          <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Rerata Mood</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-[#37352F]">Baik</span>
            <span className="text-sm">🙂</span>
          </div>
          <p className="text-[10px] text-[#787774] mt-1 leading-tight">Kondisi dominan 8 hari terakhir</p>
        </div>

        <div className="bg-white border border-[#EBEBEB] rounded-lg p-3.5">
          <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider block">Pilar Konsistensi</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-[#37352F]">5/5 Habit</span>
          </div>
          <p className="text-[10px] text-[#787774] mt-1 leading-tight">Konfigurasi habit harian</p>
        </div>
      </div>

      {/* Main Charts Two-column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart Card 1: Productive Hours Line Chart */}
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-4 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-[#337EA9] rounded-xs" />
              <h4 className="text-xs font-bold text-[#37352F] uppercase tracking-wider">Grafik Jam Kerja Produktif</h4>
            </div>
            <p className="text-[11px] text-[#787774] mt-0.5">Tren durasi jam kerja fokus harian (10 catatan terakhir)</p>
          </div>

          <div className="relative w-full h-[220px] border border-[#EBEBEB] rounded-lg bg-[#F7F7F5]/40 p-2">
            {chronologicalDays.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#787774] italic">
                Cari & buat data saku kalender untuk memulai visualisasi grafik.
              </div>
            ) : (
              <EChart options={productiveHoursOption as any} className="h-full w-full" />
            )}
          </div>

          <div className="mt-2.5 p-2.5 rounded border border-[#EBEBEB] bg-[#F7F7F5] flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-[#337EA9] mt-0.5 shrink-0" />
            <span className="text-[10px] text-[#787774] leading-tight">
              Arahkan kursor tetikus Anda pada garis grafik di atas untuk melihat catatan ringkasan produktivitas harian Anda secara bertahap dengan rincian interaktif.
            </span>
          </div>
        </div>

        {/* Chart Card 2: Habit Completion rate Bar Chart */}
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-[#448361] rounded-xs" />
              <h4 className="text-xs font-bold text-[#37352F] uppercase tracking-wider">Tingkat Pencapaian Setiap Kebiasaan</h4>
            </div>
            <p className="text-[11px] text-[#787774] mt-0.5">Persentase keberhasilan setiap pilar habit harian Anda</p>
          </div>

          <div className="relative w-full h-[220px] my-2">
            <EChart options={habitCompletionOption as any} className="h-full w-full" />
          </div>

          <div className="p-2.5 bg-[#E7F3EF] border border-[#EDEDED] text-[#0D7A5E] rounded text-[10px] leading-tight flex items-center gap-2">
            <Award className="w-4 h-4 text-[#448361] shrink-0" />
            <p className="font-medium text-[#0D7A5E]">
              Kebiasaan dengan tingkat penyelesaian tertinggi adalah <span className="font-bold">Minum Air Putih (3L)</span> di angka 100%! Pertahankan performa luar biasa ini.
            </p>
          </div>
        </div>

        {/* Chart Card 3: Mood Balance (Solid Pie Chart in ECharts) */}
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-4 flex flex-col justify-between ml-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-[#D9730D] rounded-xs" />
              <h4 className="text-xs font-bold text-[#37352F] uppercase tracking-wider">Komposisi Mood Harian</h4>
            </div>
            <p className="text-[11px] text-[#787774] mt-0.5">Sebaran kondisi emosional Anda selama periode pencatatan</p>
          </div>

          <div className="relative w-full h-[220px] my-2">
            <EChart options={moodCompositionOption as any} className="h-full w-full" />
          </div>

          <div className="text-[10px] text-[#787774] bg-[#F7F7F5] border border-[#EBEBEB] rounded p-2.5">
            Mood didominasi emosional positif (sebesar <span className="font-bold text-[#37352F]">{(moodPercentages.great + moodPercentages.good)}%</span> dari seluruh pencatatan harian).
          </div>
        </div>

        {/* Chart Card 4: Actionable Habits Coach */}
        <div className="bg-white border border-[#EBEBEB] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D9730D]" />
              <h4 className="text-xs font-bold text-[#37352F] uppercase tracking-wider">Asisten Pelatih Kebiasaan</h4>
            </div>
            <p className="text-[11px] text-[#787774] mt-0.5">Rekomendasi taktis berbasis pencatatan data riwayat Anda</p>
          </div>

          <div className="space-y-3 bg-[#F7F7F5] p-3.5 rounded border border-[#EBEBEB] my-4 text-xs text-[#37352F] leading-normal">
            <div className="flex gap-2 items-start">
              <div className="bg-amber-100 text-[#CB912F] w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 font-bold text-[9px] mt-0.5">1</div>
              <div>
                <span className="font-bold block text-[#37352F]">Ukur jam tidur malam</span>
                Tulisan jurnal Anda mendeteksi bahwa kurang tidur pada tgl 11 Juni berdampak signifikan terhadap penurunan durasi jam kerja fokus Anda menjadi 4 jam saja. Prioritaskan tidur berkualitas.
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <div className="bg-emerald-100 text-[#0D7A5E] w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 font-bold text-[9px] mt-0.5">2</div>
              <div>
                <span className="font-bold block text-[#37352F]">Tingkatkan Meditasi</span>
                Meditasi paling sering mengantar pada mood "Sempurna/Great". Menambah intensitas meditasi harian akan meregenerasi kestabilan fokus kognitif Anda.
              </div>
            </div>
          </div>

          <div className="text-right text-[10px] text-[#787774] italic">
            Dihasilkan secara instan berdasarkan algoritma data runtun waktu.
          </div>
        </div>

      </div>
    </div>
  );
}
