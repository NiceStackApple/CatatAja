export interface Block {
  id: string;
  type: 'paragraph' | 'h1' | 'h2' | 'h3' | 'todo' | 'bullet' | 'callout' | 'quote' | 'divider' | 'table' | 'chart' | 'bridge';
  content: string;
  isCompleted?: boolean; // For todo list blocks
  icon?: string; // For callout icons
  tableData?: BlankTableData; // For table block type
  chartData?: BlankChartData; // For chart block type
  bridgeData?: BlankBridgeData; // For bridge/page-link block type
}

export type PageType = 'tracker' | 'calendar' | 'analytics' | 'notes' | 'database' | 'blank' | 'recap' | 'whatsapp';

export interface BlankTableData {
  headers: string[];
  rows: Record<string, string>[];
}

export interface BlankChartData {
  title: string;
  chartType: 'bar' | 'line' | 'area';
  metrics: { label: string; value: number }[];
}

export interface BlankBridgeData {
  targetPageId: string;
  displayMode: 'stats' | 'link' | 'summary';
}

export interface BlankWidget {
  id: string;
  type: 'table' | 'chart' | 'bridge' | 'text';
  title: string;
  tableData?: BlankTableData;
  chartData?: BlankChartData;
  bridgeData?: BlankBridgeData;
  textContent?: string;
  width?: 'full' | 'half';
}

export interface Page {
  id: string;
  title: string;
  icon: string; // Emoji
  cover: string; // Tailwind bg gradient string or solid color
  type: PageType;
  isFavorite: boolean;
  blocks?: Block[]; // Holds notes blocks for 'notes' type
  blankWidgets?: BlankWidget[]; // Holds custom builder widgets for 'blank' type
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string; // Tailwind colored text etc.
  frequency: string; // "Harian" / "Mingguan"
}

export interface TrackingDay {
  date: string; // Format: YYYY-MM-DD
  habitsCompleted: string[]; // List of habit IDs completed
  mood: 'great' | 'good' | 'neutral' | 'tired' | 'bad';
  productiveHours: number; // 0 to 12
  notes: string;
  journalTitle?: string;
}

export interface DatabaseRow {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string; // Format: YYYY-MM-DD
  completedDate?: string; // Format: YYYY-MM-DD (populated when status is Completed)
  tags: string[];
}

export interface ActivityEntry {
  id: string;
  startTime: string; // "HH:MM" or ""
  endTime: string; // "HH:MM" or ""
  description: string;
  category: string; // e.g., "Study", "Work", etc.
  notes?: string;
  isDefault?: boolean;
  defaultType?: 'wakeup' | 'sleep' | 'sleep_session';
  didNotSleep?: boolean;
}

export interface AppSettings {
  language: 'en' | 'id';
  profileName?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO string
  isRead: boolean;
  type: 'todo' | 'habit' | 'activity' | 'custom';
  actionUrl?: string;
}

export interface NotificationSettings {
  enableDailyActivityReminder: boolean;
  dailyActivityReminderTime: string; // "HH:MM"
  enableTodoReminder: boolean;
  todoReminderTime: string; // "HH:MM"
  enableHabitReminder: boolean;
  habitReminderTime: string; // "HH:MM"
}

