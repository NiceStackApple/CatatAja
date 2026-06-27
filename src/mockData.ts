import { Page, Habit, TrackingDay, DatabaseRow } from './types';

export const INITIAL_HABITS: Habit[] = [
  { id: 'hb-1', name: 'Morning Workout (20m)', icon: '🏃‍♂️', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', frequency: 'Daily' },
  { id: 'hb-2', name: 'Drink Water (3L)', icon: '💧', color: 'bg-blue-50 text-blue-700 border-blue-200', frequency: 'Daily' },
  { id: 'hb-3', name: 'Read Book (15 Pages)', icon: '📚', color: 'bg-amber-50 text-amber-700 border-amber-200', frequency: 'Daily' },
  { id: 'hb-4', name: 'Meditation & Journaling', icon: '🧘', color: 'bg-purple-50 text-purple-700 border-purple-200', frequency: 'Daily' },
  { id: 'hb-5', name: 'Coding / Learn Skills', icon: '💻', color: 'bg-rose-50 text-rose-700 border-rose-200', frequency: 'Daily' },
];

export const INITIAL_DATABASE_ROWS: DatabaseRow[] = [
  { id: 'task-1', title: 'UI Design Notion Tracker', status: 'Completed', priority: 'High', dueDate: '2026-06-18', completedDate: '2026-06-18', tags: ['Design', 'UI/UX'] },
  { id: 'task-2', title: 'Integrate Custom SVG Charts', status: 'Completed', priority: 'High', dueDate: '2026-06-20', completedDate: '2026-06-20', tags: ['Coding', 'SVG'] },
  { id: 'task-3', title: 'Implement Calendar Feature', status: 'In Progress', priority: 'Medium', dueDate: '2026-06-22', tags: ['Calendar', 'Feature'] },
  { id: 'task-4', title: 'Responsive Mobile Optimization', status: 'Not Started', priority: 'Medium', dueDate: '2026-06-24', tags: ['Optimization'] },
  { id: 'task-5', title: 'Refactor Persistent State Hooks', status: 'Not Started', priority: 'Low', dueDate: '2026-06-28', tags: ['Backend'] },
];

// Generates past days with beautiful realistic data
export const INITIAL_TRACKING_DAYS: TrackingDay[] = [
  {
    date: '2026-06-08',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3'],
    mood: 'good',
    productiveHours: 6,
    notes: 'First day of logging progress. A bit tired after morning cycling.',
    journalTitle: 'Productive Monday'
  },
  {
    date: '2026-06-09',
    habitsCompleted: ['hb-2', 'hb-3', 'hb-4'],
    mood: 'neutral',
    productiveHours: 5,
    notes: 'Many meetings today. Only had time to read a book during work breaks.',
    journalTitle: 'Back-to-Back Meetings'
  },
  {
    date: '2026-06-10',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3', 'hb-5'],
    mood: 'great',
    productiveHours: 8,
    notes: 'Amazing focus today! Successfully completed the database authentication module.',
    journalTitle: 'Maximum Focus'
  },
  {
    date: '2026-06-11',
    habitsCompleted: ['hb-2', 'hb-5'],
    mood: 'tired',
    productiveHours: 4,
    notes: 'Lack of sleep last night due to street noise. Day went slowly.',
    journalTitle: 'Midday Fatigue'
  },
  {
    date: '2026-06-12',
    habitsCompleted: ['hb-2', 'hb-3', 'hb-4', 'hb-5'],
    mood: 'good',
    productiveHours: 7,
    notes: 'Weekend is near. Completed afternoon meditation in the backyard gazebo.',
    journalTitle: 'Peaceful Afternoon'
  },
  {
    date: '2026-06-13',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3', 'hb-4'],
    mood: 'great',
    productiveHours: 3,
    notes: 'Relaxing Saturday. Spent time with a 5KM morning run then read a fiction novel.',
    journalTitle: 'Healthy Saturday'
  },
  {
    date: '2026-06-14',
    habitsCompleted: ['hb-2', 'hb-4'],
    mood: 'neutral',
    productiveHours: 2,
    notes: 'Sunday total rest with family.',
    journalTitle: 'Family Time'
  },
  {
    date: '2026-06-15',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3', 'hb-5'],
    mood: 'good',
    productiveHours: 7,
    notes: 'Spirited Monday. Successfully drank exactly 3 liters of water.',
    journalTitle: 'New Week Start'
  },
  {
    date: '2026-06-16',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3', 'hb-4', 'hb-5'],
    mood: 'great',
    productiveHours: 9,
    notes: 'All screens green! 100% habits achieved and maximum productivity!',
    journalTitle: 'Perfect & Smooth'
  },
  {
    date: '2026-06-17',
    habitsCompleted: ['hb-2', 'hb-3', 'hb-5'],
    mood: 'good',
    productiveHours: 8,
    notes: 'Successfully drafted a new article about UI Design Systems.',
    journalTitle: 'Article Draft Finished'
  },
  {
    date: '2026-06-18',
    habitsCompleted: ['hb-2', 'hb-4', 'hb-5'],
    mood: 'neutral',
    productiveHours: 6,
    notes: 'Concentration was a bit scattered due to heavy rain.',
    journalTitle: 'Accompanying Heavy Rain'
  },
  {
    date: '2026-06-19',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3', 'hb-4', 'hb-5'],
    mood: 'great',
    productiveHours: 8,
    notes: 'Blessed Friday. Morning exercise felt fresh with the cool breeze.',
    journalTitle: 'Blessed Friday'
  },
  {
    date: '2026-06-20',
    habitsCompleted: ['hb-1', 'hb-2', 'hb-3'],
    mood: 'good',
    productiveHours: 4,
    notes: 'Successfully did a morning run. Spent the rest of the day playing casual games.',
    journalTitle: 'Refreshed Weekend'
  },
  {
    date: '2026-06-21',
    habitsCompleted: ['hb-2', 'hb-3', 'hb-4'],
    mood: 'good',
    productiveHours: 3,
    notes: 'Drafting next week\'s work plan to avoid getting overwhelmed.',
    journalTitle: 'Sunday Prep'
  },
  {
    date: '2026-06-22',
    habitsCompleted: ['hb-2'], // today!
    mood: 'good',
    productiveHours: 5,
    notes: 'Monday started off well. Notion Tracker design is almost finished.',
    journalTitle: 'Monday Tracker Focus'
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
    title: 'Project Kanban Board',
    icon: '🗂️',
    cover: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
    type: 'database',
    isFavorite: false,
    createdAt: '2026-06-03'
  },
  {
    id: 'pg-5',
    title: 'Notes & Creative Ideas',
    icon: '📝',
    cover: 'linear-gradient(135deg, #f1a7a1 0%, #f7dbbd 100%)',
    type: 'notes',
    isFavorite: false,
    createdAt: '2026-06-04',
    blocks: [
      { id: 'blk-1', type: 'h1', content: '💡 Brainstorming Ideas & Daily Notes' },
      { id: 'blk-2', type: 'paragraph', content: 'This page is built with a Notion-style editor. You can add new paragraphs, task lists (to-do), write quotes, or place callout informational blocks.' },
      { id: 'blk-3', type: 'callout', content: 'Tip: Click the "+" button below to insert other block types instantly, or click the trash icon next to a block to delete it.', icon: '💡' },
      { id: 'blk-4', type: 'h2', content: '🎯 Application Development Roadmap' },
      { id: 'blk-5', type: 'todo', content: 'Complete interactive calendar functionality', isCompleted: true },
      { id: 'blk-6', type: 'todo', content: 'Create interactive line & donut charts visualization', isCompleted: true },
      { id: 'blk-7', type: 'todo', content: 'Improve Notion Workspace Sidebar aesthetics', isCompleted: false },
      { id: 'blk-8', type: 'todo', content: 'Prepare weekly report export module', isCompleted: false },
      { id: 'blk-9', type: 'divider', content: '' },
      { id: 'blk-10', type: 'quote', content: '"What gets measured gets improved." — Peter Drucker' },
    ]
  },
  {
    id: 'pg-6',
    title: 'Custom Dashboard (Blank Canvas)',
    icon: '✨',
    cover: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    type: 'blank',
    isFavorite: false,
    createdAt: '2026-06-22',
    blocks: [
      {
        id: 'blk-u-1',
        type: 'paragraph',
        content: 'Welcome to your Custom Page! This blank page is designed to let you freely arrange your own important components using the "+" button to the left of the text lines.'
      },
      {
        id: 'blk-u-2',
        type: 'table',
        content: 'Local Task Monitoring Table',
        tableData: {
          headers: ['Task Name', 'Points System', 'Estimated Time (Mins)', 'Priority'],
          rows: [
            { 'Task Name': 'Read Documentation', 'Points System': '15', 'Estimated Time (Mins)': '30', 'Priority': 'High' },
            { 'Task Name': 'Review Graphic Design', 'Points System': '25', 'Estimated Time (Mins)': '45', 'Priority': 'Medium' },
            { 'Task Name': 'Practice Coding', 'Points System': '35', 'Estimated Time (Mins)': '60', 'Priority': 'High' }
          ]
        }
      },
      {
        id: 'blk-u-3',
        type: 'chart',
        content: 'Work Efficiency Chart',
        chartData: {
          title: 'Weekly Points Distribution',
          chartType: 'bar',
          metrics: [
            { label: 'Mon', value: 15 },
            { label: 'Tue', value: 25 },
            { label: 'Wed', value: 40 },
            { label: 'Thu', value: 30 },
            { label: 'Fri', value: 55 },
            { label: 'Sat', value: 20 },
            { label: 'Sun', value: 10 }
          ]
        }
      },
      {
        id: 'blk-u-4',
        type: 'bridge',
        content: 'Quick Bridge: Kanban Board',
        bridgeData: {
          targetPageId: 'pg-2',
          displayMode: 'stats'
        }
      },
      {
        id: 'blk-u-5',
        type: 'bridge',
        content: 'Quick Bridge: Daily Tracker',
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
