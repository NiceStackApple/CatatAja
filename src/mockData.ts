import { Page, Habit, TrackingDay, DatabaseRow } from './types';

export const INITIAL_HABITS: Habit[] = [
  { id: 'hb-1', name: 'Olahraga Pagi (20m)', icon: '🏃‍♂️', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', frequency: 'Harian' },
  { id: 'hb-2', name: 'Minum Air Putih (3L)', icon: '💧', color: 'bg-blue-50 text-blue-700 border-blue-200', frequency: 'Harian' },
  { id: 'hb-3', name: 'Membaca Buku (15 Hal)', icon: '📚', color: 'bg-amber-50 text-amber-700 border-amber-200', frequency: 'Harian' },
  { id: 'hb-4', name: 'Meditasi & Jurnal', icon: '🧘', color: 'bg-purple-50 text-purple-700 border-purple-200', frequency: 'Harian' },
  { id: 'hb-5', name: 'Ngoding / Belajar Skill', icon: '💻', color: 'bg-rose-50 text-rose-700 border-rose-200', frequency: 'Harian' },
];

export const INITIAL_DATABASE_ROWS: DatabaseRow[] = [
  { id: 'task-1', title: 'Desain UI Notion Tracker', status: 'Completed', priority: 'High', dueDate: '2026-06-18', completedDate: '2026-06-18', tags: ['Desain', 'UI/UX'] },
  { id: 'task-2', title: 'Integrasi Charts SVG Kustom', status: 'Completed', priority: 'High', dueDate: '2026-06-20', completedDate: '2026-06-20', tags: ['Koding', 'SVG'] },
  { id: 'task-3', title: 'Implementasi Fitur Kalender', status: 'In Progress', priority: 'Medium', dueDate: '2026-06-22', tags: ['Kalender', 'Fitur'] },
  { id: 'task-4', title: 'Optimasi Mobile Responsif', status: 'Not Started', priority: 'Medium', dueDate: '2026-06-24', tags: ['Optimasi'] },
  { id: 'task-5', title: 'Refaktor Hooks State Persistent', status: 'Not Started', priority: 'Low', dueDate: '2026-06-28', tags: ['Backend'] },
];

// Generates past days with beautiful realistic data
export const INITIAL_TRACKING_DAYS: TrackingDay[] = [
  {
    date: '2026-06-08',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3'],
    mood: 'good',
    productiveHours: 6,
    notes: 'Hari pertama mencatat kemajuan. Sedikit lelah setelah bersepeda pagi.',
    journalTitle: 'Senin Produktif'
  },
  {
    date: '2026-06-09',
    habitsCompleted: ['hb-2', 'hb-3', 'hb-4'],
    mood: 'neutral',
    productiveHours: 5,
    notes: 'Banyak meeting hari ini. Hanya sempat membaca buku di sela waktu kerja.',
    journalTitle: 'Hari Meeting Beruntun'
  },
  {
    date: '2026-06-10',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3', 'hb-5'],
    mood: 'great',
    productiveHours: 8,
    notes: 'Luar biasa fokus hari ini! Berhasil menyelesaikan modul autentikasi database.',
    journalTitle: 'Fokus Maksimal'
  },
  {
    date: '2026-06-11',
    habitsCompleted: ['hb-2', 'hb-5'],
    mood: 'tired',
    productiveHours: 4,
    notes: 'Kurang tidur semalam karena mendengarkan bising jalanan. Hari berjalan lamban.',
    journalTitle: 'Kelelahan Siang Hari'
  },
  {
    date: '2026-06-12',
    habitsCompleted: ['hb-2', 'hb-3', 'hb-4', 'hb-5'],
    mood: 'good',
    productiveHours: 7,
    notes: 'Weekend sudah dekat. Selesai meditasi sore di gazebo halaman rumah.',
    journalTitle: 'Sore yang Tenang'
  },
  {
    date: '2026-06-13',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3', 'hb-4'],
    mood: 'great',
    productiveHours: 3,
    notes: 'Sabtu santai. Habiskan waktu dengan olahraga lari pagi 5KM lalu baca novel fiksi.',
    journalTitle: 'Sabtu Sehat'
  },
  {
    date: '2026-06-14',
    habitsCompleted: ['hb-2', 'hb-4'],
    mood: 'neutral',
    productiveHours: 2,
    notes: 'Minggu beristirahat total bersama keluarga.',
    journalTitle: 'Family Time'
  },
  {
    date: '2026-06-15',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3', 'hb-5'],
    mood: 'good',
    productiveHours: 7,
    notes: 'Senin kembali bersemangat. Berhasil minum air 3 liter pas.',
    journalTitle: 'Mulai Minggu Baru'
  },
  {
    date: '2026-06-16',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3', 'hb-4', 'hb-5'],
    mood: 'great',
    productiveHours: 9,
    notes: 'All screen green! 100% habit tercapai dan produktivitas maksimal!',
    journalTitle: 'Sempurna & Lancar'
  },
  {
    date: '2026-06-17',
    habitsCompleted: ['hb-2', 'hb-3', 'hb-5'],
    mood: 'good',
    productiveHours: 8,
    notes: 'Berhasil menulis draf artikel baru tentang UI Design System.',
    journalTitle: 'Draf Artikel Selesai'
  },
  {
    date: '2026-06-18',
    habitsCompleted: ['hb-2', 'hb-4', 'hb-5'],
    mood: 'neutral',
    productiveHours: 6,
    notes: 'Konsentrasi sempat terpecah karena cuaca hujan deras.',
    journalTitle: 'Hujan Deras Menemani'
  },
  {
    date: '2026-06-19',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3', 'hb-4', 'hb-5'],
    mood: 'great',
    productiveHours: 8,
    notes: 'Jumat penuh berkah. Olahraga pagi terasa segar dibantu udara sejuk.',
    journalTitle: 'Jumat Berkah'
  },
  {
    date: '2026-06-20',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3'],
    mood: 'good',
    productiveHours: 4,
    notes: 'Berhasil lari pagi. Sisa hari diisi dengan bermain game santai.',
    journalTitle: 'Refreshed Weekend'
  },
  {
    date: '2026-06-21',
    habitsCompleted: ['hb-2', 'hb-3', 'hb-4'],
    mood: 'good',
    productiveHours: 3,
    notes: 'Menyusun rencana kerja untuk minggu depan agar tidak kewalahan.',
    journalTitle: 'Sunday Prep'
  },
  {
    date: '2026-06-22',
    habitsCompleted: ['hb-2'], // today!
    mood: 'good',
    productiveHours: 5,
    notes: 'Hari Senin ini dimulai dengan baik. Desain Notion Tracker hampir selesai.',
    journalTitle: 'Senin Fokus Tracker'
  }
];

export const INITIAL_PAGES: Page[] = [
  {
    id: 'pg-1',
    title: 'Daily Habits Logger',
    icon: '📔',
    cover: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    type: 'tracker',
    isFavorite: true,
    createdAt: '2026-06-01'
  },
  {
    id: 'pg-2',
    title: 'Workspace Tracking Calendar',
    icon: '📅',
    cover: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    type: 'calendar',
    isFavorite: true,
    createdAt: '2026-06-01'
  },
  {
    id: 'pg-3',
    title: 'Productivity Analytics',
    icon: '📊',
    cover: 'linear-gradient(135deg, #fd1d1d 0%, #fcb045 100%)',
    type: 'analytics',
    isFavorite: true,
    createdAt: '2026-06-02'
  },
  {
    id: 'pg-4',
    title: 'Papan Kerja Projek (Kanban)',
    icon: '🗂️',
    cover: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
    type: 'database',
    isFavorite: false,
    createdAt: '2026-06-03'
  },
  {
    id: 'pg-5',
    title: 'Catatan & Ide Kreatif',
    icon: '📝',
    cover: 'linear-gradient(135deg, #f1a7a1 0%, #f7dbbd 100%)',
    type: 'notes',
    isFavorite: false,
    createdAt: '2026-06-04',
    blocks: [
      { id: 'blk-1', type: 'h1', content: '💡 Brainstorming Ide & Catatan Harian' },
      { id: 'blk-2', type: 'paragraph', content: 'Halaman ini dibuat dengan Notion-style editor. Kamu bisa menambahkan paragraf baru, menandai daftar tugas (to-do), menuliskan kutipan (quote), atau meletakkan blok informasi callout.' },
      { id: 'blk-3', type: 'callout', content: 'Tip: Klik tombol "+" di bawah untuk menyisipkan blok jenis lain secara instan, atau klik ikon sampah di samping blok untuk menghapusnya.', icon: '💡' },
      { id: 'blk-4', type: 'h2', content: '🎯 Rencana Pengembangan Aplikasi' },
      { id: 'blk-5', type: 'todo', content: 'Menyelesaikan fungsionalitas kalender interaktif', isCompleted: true },
      { id: 'blk-6', type: 'todo', content: 'Membuat visualisasi grafik garis & donat interaktif', isCompleted: true },
      { id: 'blk-7', type: 'todo', content: 'Meningkatkan estetika Notion Workspace Sidebar', isCompleted: false },
      { id: 'blk-8', type: 'todo', content: 'Menyiapkan modul ekspor laporan mingguan', isCompleted: false },
      { id: 'blk-9', type: 'divider', content: '' },
      { id: 'blk-10', type: 'quote', content: '"Sesuatu yang diukur adalah sesuatu yang dapat ditingkatkan." — Peter Drucker' },
    ]
  },
  {
    id: 'pg-6',
    title: 'Dashboard Kustom (Blank Canvas)',
    icon: '✨',
    cover: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    type: 'blank',
    isFavorite: false,
    createdAt: '2026-06-22',
    blocks: [
      {
        id: 'blk-u-1',
        type: 'paragraph',
        content: 'Selamat Datang di Halaman Kustom Anda! Halaman kosong/blank ini dirancang agar Anda bebas menyusun komponen penting Anda sendiri menggunakan tombol "+" di sebelah kiri baris teks.'
      },
      {
        id: 'blk-u-2',
        type: 'table',
        content: 'Tabel Pemantauan Tugas Lokal',
        tableData: {
          headers: ['Nama Tugas', 'Sistem Poin', 'Waktu Estimasi (Menit)', 'Prioritas'],
          rows: [
            { 'Nama Tugas': 'Membaca Dokumentasi', 'Sistem Poin': '15', 'Waktu Estimasi (Menit)': '30', 'Prioritas': 'Tinggi' },
            { 'Nama Tugas': 'Review Desain Grafis', 'Sistem Poin': '25', 'Waktu Estimasi (Menit)': '45', 'Prioritas': 'Sedang' },
            { 'Nama Tugas': 'Latihan Menulis Kode', 'Sistem Poin': '35', 'Waktu Estimasi (Menit)': '60', 'Prioritas': 'Tinggi' }
          ]
        }
      },
      {
        id: 'blk-u-3',
        type: 'chart',
        content: 'Grafik Efisiensi Kerja',
        chartData: {
          title: 'Distribusi Poin Mingguan',
          chartType: 'bar',
          metrics: [
            { label: 'Sen', value: 15 },
            { label: 'Sel', value: 25 },
            { label: 'Rab', value: 40 },
            { label: 'Kam', value: 30 },
            { label: 'Jum', value: 55 },
            { label: 'Sab', value: 20 },
            { label: 'Min', value: 10 }
          ]
        }
      },
      {
        id: 'blk-u-4',
        type: 'bridge',
        content: 'Jembatan Cepat: Papan Kanban',
        bridgeData: {
          targetPageId: 'pg-2',
          displayMode: 'stats'
        }
      },
      {
        id: 'blk-u-5',
        type: 'bridge',
        content: 'Jembatan Cepat: Pelacak Harian',
        bridgeData: {
          targetPageId: 'pg-1',
          displayMode: 'summary'
        }
      }
    ]
  },
  {
    id: 'pg-recap',
    title: 'Daily Activity Recap',
    icon: '⏳',
    cover: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    type: 'recap',
    isFavorite: true,
    createdAt: '2026-06-22'
  }
];
