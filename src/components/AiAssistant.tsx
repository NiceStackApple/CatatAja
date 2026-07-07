import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, Trash2, Zap, Trophy, Lightbulb, CheckSquare, Calendar, FolderPlus, Edit, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings, Habit, TrackingDay, DatabaseRow, ActivityEntry } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  // Hold recognized actions to display inline success alerts
  executedAction?: {
    type: string;
    description: string;
  };
}

interface AiAssistantProps {
  settings: AppSettings;
  habits: Habit[];
  todayTrackingData: TrackingDay;
  databaseRows: DatabaseRow[];
  activePageTitle?: string;
  onToggleTodayHabit?: (habitId: string) => void;
  onUpdateTrackingDay?: (updatedDay: TrackingDay) => void;
  onUpdateDatabaseRows?: (updatedRows: DatabaseRow[]) => void;
  onUpdateActivitiesForDate?: (date: string, activities: ActivityEntry[]) => void;
  activityRecaps?: Record<string, ActivityEntry[]>;
  onAddNotification?: (title: string, message: string, type: 'todo' | 'habit' | 'activity' | 'custom') => void;
}

// 1. Light and robust Markdown renderer component
function MarkdownBubble({ text, isUser }: { text: string; isUser: boolean }) {
  if (isUser) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  const parseInlineBold = (line: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      const before = line.slice(lastIndex, match.index);
      if (before) parts.push(before);
      parts.push(
        <strong key={match.index} className="font-extrabold text-neutral-900 bg-amber-100/50 px-1 py-0.2 rounded-sm border-b border-amber-200">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }
    const remaining = line.slice(lastIndex);
    if (remaining) parts.push(remaining);

    return parts.length > 0 ? parts : line;
  };

  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      renderedElements.push(
        <ul key={`list-${listKey++}`} className="list-none my-1.5 space-y-1.5 pl-1.5">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Horizontal Ruler
    if (trimmed === '---' || trimmed === '***' || trimmed === '===') {
      flushList();
      renderedElements.push(<hr key={index} className="my-2.5 border-neutral-200/60" />);
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      renderedElements.push(
        <h4 key={index} className="text-xs font-extrabold text-neutral-800 uppercase tracking-wide mt-3.5 mb-1.5 flex items-center gap-1">
          <span className="w-1.5 h-3 bg-indigo-500 rounded-xs" />
          {parseInlineBold(trimmed.substring(4))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flushList();
      const cleanHeading = trimmed.startsWith('## ') ? trimmed.substring(3) : trimmed.substring(2);
      renderedElements.push(
        <h3 key={index} className="text-sm font-black text-indigo-950 mt-4 mb-2">
          {parseInlineBold(cleanHeading)}
        </h3>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(
        <li key={index} className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
          <div className="flex-1">{parseInlineBold(trimmed.substring(2))}</div>
        </li>
      );
      return;
    }

    // Standard Paragraph
    if (trimmed.length > 0) {
      flushList();
      renderedElements.push(
        <p key={index} className="text-xs text-neutral-700 leading-relaxed my-1">
          {parseInlineBold(trimmed)}
        </p>
      );
    } else {
      flushList();
    }
  });

  flushList();

  return <div className="space-y-1.5">{renderedElements}</div>;
}

export default function AiAssistant({
  settings,
  habits,
  todayTrackingData,
  databaseRows,
  activePageTitle,
  onToggleTodayHabit,
  onUpdateTrackingDay,
  onUpdateDatabaseRows,
  onUpdateActivitiesForDate,
  activityRecaps,
  onAddNotification
}: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isId = settings.language === 'id';
  const t = (idText: string, enText: string) => (isId ? idText : enText);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Execute Action from Assistant JSON payload
  const executeWorkspaceAction = (actionType: string, params: any): { success: boolean; description: string } => {
    try {
      if (!params || typeof params !== 'object') {
        return { success: false, description: 'Invalid parameters' };
      }

      switch (actionType) {
        case 'TOGGLE_HABIT': {
          if (!onToggleTodayHabit) return { success: false, description: 'State modifier missing' };
          
          let habitId = params.habitId;
          // Match by name if ID was not specified or is not recognized
          if (!habitId && params.habitName) {
            const normalizedParamName = params.habitName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const matchedHabit = habits.find(h => {
              const normalizedHabitName = h.name.toLowerCase().replace(/[^a-z0-9]/g, '');
              return normalizedHabitName.includes(normalizedParamName) || normalizedParamName.includes(normalizedHabitName);
            });
            if (matchedHabit) {
              habitId = matchedHabit.id;
            }
          }

          if (!habitId) {
            return { success: false, description: isId ? 'Kebiasaan tidak ditemukan.' : 'Habit not found.' };
          }

          const habitItem = habits.find(h => h.id === habitId);
          if (!habitItem) {
            return { success: false, description: isId ? 'Kebiasaan tidak ditemukan.' : 'Habit not found.' };
          }

          onToggleTodayHabit(habitId);
          return {
            success: true,
            description: isId
              ? `Centang kebiasaan "${habitItem.icon} ${habitItem.name}" berhasil diperbarui!`
              : `Habit "${habitItem.icon} ${habitItem.name}" checkbox status toggled successfully!`
          };
        }

        case 'ADD_ACTIVITY': {
          if (!onUpdateActivitiesForDate || !activityRecaps) {
            return { success: false, description: 'Recap modifier missing' };
          }

          const todayStr = new Date().toISOString().split('T')[0];
          const date = params.date || todayStr;
          const currentActivities = [...(activityRecaps[date] || [])];

          const isSleep = 
            params.category === 'Sleep' || 
            params.defaultType === 'sleep_session' || 
            params.description?.toLowerCase().includes('sleep') || 
            params.description?.toLowerCase().includes('tidur');

          let descriptionMsg = '';

          if (isSleep) {
            // Check if there is an existing sleep_session in currentActivities
            const existingSleepIdx = currentActivities.findIndex(e => e.defaultType === 'sleep_session' || e.category === 'Sleep');
            if (existingSleepIdx !== -1) {
              const updatedSleep = {
                ...currentActivities[existingSleepIdx],
                startTime: params.startTime || currentActivities[existingSleepIdx].startTime || '22:00',
                endTime: params.endTime || currentActivities[existingSleepIdx].endTime || '07:00',
                description: params.description || currentActivities[existingSleepIdx].description || 'Sleep Session',
                notes: params.notes || currentActivities[existingSleepIdx].notes || 'Diperbarui otomatis oleh Tsaqif AI Co-Pilot',
                category: 'Sleep',
                didNotSleep: params.didNotSleep !== undefined ? params.didNotSleep : false,
                isDefault: false
              };
              currentActivities[existingSleepIdx] = updatedSleep;
              descriptionMsg = isId
                ? `Berhasil memperbarui catatan tidur Anda (${updatedSleep.startTime} - ${updatedSleep.endTime})`
                : `Updated your existing sleep session (${updatedSleep.startTime} - ${updatedSleep.endTime})`;
            } else {
              // Create default sleep session and insert
              const newSleep: ActivityEntry = {
                id: 'ss-' + date,
                startTime: params.startTime || '22:00',
                endTime: params.endTime || '07:00',
                category: 'Sleep',
                description: params.description || 'Sleep Session',
                notes: params.notes || 'Dicatat otomatis oleh Tsaqif AI Co-Pilot',
                isDefault: false,
                defaultType: 'sleep_session',
                didNotSleep: params.didNotSleep !== undefined ? params.didNotSleep : false
              };
              currentActivities.unshift(newSleep);
              descriptionMsg = isId
                ? `Berhasil mencatat tidur Anda (${newSleep.startTime} - ${newSleep.endTime})`
                : `Logged your sleep session (${newSleep.startTime} - ${newSleep.endTime})`;
            }
          } else {
            // Check if user is asking to update an existing general activity by matching description
            let updatedExisting = false;
            if (params.matchDescription || params.description) {
              const query = (params.matchDescription || params.description).toLowerCase().trim();
              const existingIdx = currentActivities.findIndex(e => 
                e.defaultType !== 'sleep_session' && 
                (e.description.toLowerCase().includes(query) || query.includes(e.description.toLowerCase()))
              );
              if (existingIdx !== -1) {
                const current = currentActivities[existingIdx];
                const updated = {
                  ...current,
                  startTime: params.startTime || current.startTime,
                  endTime: params.endTime || current.endTime,
                  category: params.category || current.category,
                  description: params.description || current.description,
                  notes: params.notes || current.notes,
                };
                currentActivities[existingIdx] = updated;
                updatedExisting = true;
                descriptionMsg = isId
                  ? `Memperbarui aktivitas: "${updated.description}" (${updated.startTime} - ${updated.endTime})`
                  : `Updated activity: "${updated.description}" (${updated.startTime} - ${updated.endTime})`;
              }
            }

            if (!updatedExisting) {
              const newActivity: ActivityEntry = {
                id: 'act-ai-' + Date.now() + Math.random().toString(36).substr(2, 4),
                startTime: params.startTime || '08:00',
                endTime: params.endTime || '09:00',
                category: params.category || 'General',
                description: params.description || 'Aktivitas Tercatat',
                notes: params.notes || 'Dicatat otomatis oleh Tsaqif AI Co-Pilot',
                isDefault: false
              };
              currentActivities.push(newActivity);
              descriptionMsg = isId
                ? `Menambahkan aktivitas: "${newActivity.description}" (${newActivity.startTime} - ${newActivity.endTime})`
                : `Added activity: "${newActivity.description}" (${newActivity.startTime} - ${newActivity.endTime})`;
            }
          }

          onUpdateActivitiesForDate(date, currentActivities);
          return {
            success: true,
            description: descriptionMsg
          };
        }

        case 'ADD_DATABASE_ROW': {
          if (!onUpdateDatabaseRows) return { success: false, description: 'Database modifier missing' };

          const todayStr = new Date().toISOString().split('T')[0];
          const titleQuery = params.title ? params.title.toLowerCase().trim() : '';

          // Look for an existing row with matching title
          const existingRowIdx = databaseRows.findIndex(row => 
            row.title.toLowerCase().trim().includes(titleQuery) || 
            titleQuery.includes(row.title.toLowerCase().trim())
          );

          if (existingRowIdx !== -1 && titleQuery.length > 0) {
            const current = databaseRows[existingRowIdx];
            const updatedRow: DatabaseRow = {
              ...current,
              status: params.status || current.status,
              priority: params.priority || current.priority,
              dueDate: params.dueDate || current.dueDate,
              title: params.title || current.title,
            };

            if (updatedRow.status === 'Completed' && current.status !== 'Completed') {
              updatedRow.completedDate = todayStr;
            }

            const updatedRows = [...databaseRows];
            updatedRows[existingRowIdx] = updatedRow;
            onUpdateDatabaseRows(updatedRows);

            return {
              success: true,
              description: isId
                ? `Berhasil memperbarui proyek "${updatedRow.title}" menjadi status ${updatedRow.status}!`
                : `Updated project "${updatedRow.title}" to status ${updatedRow.status}!`
            };
          } else {
            const newRow: DatabaseRow = {
              id: 'db-ai-' + Date.now(),
              title: params.title || (isId ? 'Tugas AI Baru' : 'New AI Task'),
              status: params.status || 'In Progress',
              priority: params.priority || 'Medium',
              dueDate: params.dueDate || todayStr,
              tags: params.tags || ['AI Generated']
            };

            if (newRow.status === 'Completed') {
              newRow.completedDate = todayStr;
            }

            onUpdateDatabaseRows([...databaseRows, newRow]);
            return {
              success: true,
              description: isId
                ? `Proyek "${newRow.title}" dimasukkan ke database dengan prioritas ${newRow.priority}!`
                : `Project "${newRow.title}" inserted into database with ${newRow.priority} priority!`
            };
          }
        }

        case 'UPDATE_TODAY_NOTES': {
          if (!onUpdateTrackingDay) return { success: false, description: 'Journal modifier missing' };

          const updatedDay = {
            ...todayTrackingData,
            notes: params.notes || todayTrackingData.notes,
            journalTitle: params.journalTitle || todayTrackingData.journalTitle
          };

          onUpdateTrackingDay(updatedDay);
          return {
            success: true,
            description: isId
              ? `Catatan harian berhasil diperbarui: "${updatedDay.journalTitle}"!`
              : `Journal notes updated successfully: "${updatedDay.journalTitle}"!`
          };
        }

        case 'ADD_NOTIFICATION': {
          if (!onAddNotification) return { success: false, description: 'Notification callback missing' };
          
          const title = params.title || (isId ? 'Notifikasi AI' : 'AI Notification');
          const message = params.message || (isId ? 'Pesan pengingat dari asisten AI.' : 'Reminder message from your AI assistant.');
          const type = params.type || 'custom';
          
          onAddNotification(title, message, type);
          return {
            success: true,
            description: isId
              ? `Notifikasi "${title}" berhasil dijadwalkan!`
              : `Notification "${title}" successfully scheduled!`
          };
        }

        default:
          return { success: false, description: 'Unknown Action' };
      }
    } catch (e: any) {
      console.error('Error executing workspace action:', e);
      return { success: false, description: e.message };
    }
  };

  // Main chat execution helper
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    if (!customText) {
      setInput('');
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Gather dynamic context for AI Co-Pilot
      const habitsListStr = habits.map(h => `- ID: "${h.id}", Nama: "${h.name}" (${h.frequency})`).join('\n');
      const completedHabitsStr = habits
        .filter(h => todayTrackingData.habitsCompleted.includes(h.id))
        .map(h => `- ${h.name}`)
        .join('\n') || t('(Belum ada kebiasaan selesai)', '(No completed habits yet)');
        
      const activeProjectsStr = databaseRows
        .slice(0, 5)
        .map(r => `- Title: "${r.title}", Status: "${r.status}", Priority: "${r.priority}"`)
        .join('\n') || t('(Belum ada proyek/tugas aktif)', '(No active projects/tasks yet)');

      const systemPrompt = `You are "Tsaqif AI Workspace Co-pilot", a super fast, helpful, personal, and minimalist AI assistant embedded within the "Ruang Tsaqif" (Tsaqif Workspace) dashboard application.

CRITICAL INSTRUCTIONS FOR CONCISE & NATURAL RESPONSE:
- Speak casually, naturally, and warmly in the user's selected language: ${isId ? 'Bahasa Indonesia' : 'English'}.
- Keep replies extremely concise (Maximum 2-3 short, friendly sentences). Do NOT output long introductory texts, wordy headers, or generic paragraphs. Answer the user directly!
- Your replies must feel human, helpful, and instant.

CAPABILITY TO ACCESS & EDIT THE WORKSPACE:
You are an AGENT that can modify the workspace. If the user asks you to modify their tracker, notes, habits, or database, you MUST append a valid action JSON block at the VERY END of your message. 

Available actions and their parameters:
1. Complete / Uncheck a habit today:
\`\`\`json
{
  "action": "TOGGLE_HABIT",
  "params": {
    "habitId": "hb-1", // Use the matching ID from Available Habits
    "habitName": "Morning Workout" // fallback if ID is dynamic
  }
}
\`\`\`

2. Add a Sleep Session or customized activity/log today:
\`\`\`json
{
  "action": "ADD_ACTIVITY",
  "params": {
    "startTime": "22:00", // HH:MM
    "endTime": "07:00", // HH:MM
    "category": "Sleep", // categories: "Sleep", "Work", "Study", "Rest", "Gaming"
    "description": "Tidur Nyenyak", 
    "notes": "Dicatat otomatis"
  }
}
\`\`\`

3. Insert a new project/todo task into the database:
\`\`\`json
{
  "action": "ADD_DATABASE_ROW",
  "params": {
    "title": "Mengerjakan Web App",
    "status": "In Progress", // "Not Started" | "In Progress" | "Completed"
    "priority": "High" // "High" | "Medium" | "Low"
  }
}
\`\`\`

4. Update today's journal/writing notes:
\`\`\`json
{
  "action": "UPDATE_TODAY_NOTES",
  "params": {
    "notes": "Teks lengkap catatan...",
    "journalTitle": "Judul Catatan Kreatif"
  }
}
\`\`\`

5. Push a real notification / toast / reminder on screen immediately:
\`\`\`json
{
  "action": "ADD_NOTIFICATION",
  "params": {
    "title": "Pengingat Penting",
    "message": "Isi pesan pengingat Anda...",
    "type": "custom" // "todo" | "habit" | "activity" | "custom"
  }
}
\`\`\`

Current App Live Context:
- Current Page Title: "${activePageTitle || 'Dashboard Tracker'}"
- Available Habits to Toggle:
${habitsListStr}
- Already Checked Habits Today:
${completedHabitsStr}
- Live Database Projects:
${activeProjectsStr}

Keep replies natural, polite, and very brief. Do NOT explain the JSON code block to the user in your text. Just perform the action.`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt,
          temperature: 0.6, // slightly lower temperature for more robust JSON blocks
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      if (data.success && data.message) {
        const rawContent = data.message.content;

        // Extract and clean JSON action from message
        let cleanedText = rawContent;
        let actionObj: any = null;
        let executedAlert: any = undefined;

        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = rawContent.match(jsonRegex);
        if (match) {
          try {
            const jsonStr = match[1].trim();
            actionObj = JSON.parse(jsonStr);
            cleanedText = rawContent.replace(jsonRegex, '').trim();
          } catch (e) {
            console.warn("Failed to parse action JSON:", e);
          }
        } else {
          // Check naked JSON
          const nakedJsonRegex = /\{\s*"action"\s*:\s*"[A-Z_]+"\s*,\s*"params"[\s\S]*?\}/;
          const nakedMatch = rawContent.match(nakedJsonRegex);
          if (nakedMatch) {
            try {
              actionObj = JSON.parse(nakedMatch[0].trim());
              cleanedText = rawContent.replace(nakedJsonRegex, '').trim();
            } catch (e) {
              // Ignore
            }
          }
        }

        // Execute action if parsed successfully
        if (actionObj && actionObj.action && actionObj.params) {
          const executionResult = executeWorkspaceAction(actionObj.action, actionObj.params);
          if (executionResult.success) {
            executedAlert = {
              type: actionObj.action,
              description: executionResult.description
            };
          }
        }

        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: cleanedText || t('Aksi berhasil dieksekusi!', 'Action executed successfully!'),
            executedAction: executedAlert
          }
        ]);
      } else {
        throw new Error(data.error || 'Failed to get a response');
      }
    } catch (error) {
      console.error('Error fetching from AI proxy:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: t(
            '⚠️ Gagal terhubung ke Asisten AI. Silakan coba lagi atau cek Groq API Key.',
            '⚠️ Failed to connect to the AI Assistant. Please try again or check Groq API Key.'
          ),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 w-[360px] md:w-[400px] h-[540px] bg-white border border-[#EBEBEB] rounded-2xl shadow-[0_12px_45px_rgba(15,15,15,0.16)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 px-4 py-3.5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-neutral-800 tracking-wide uppercase">
                    Tsaqif AI Co-Pilot
                  </h3>
                  <span className="text-[10px] text-indigo-600 font-extrabold tracking-widest uppercase block leading-none mt-0.5">
                    {t('LLAMA 3.1 & GROQ AGENT', 'LLAMA 3.1 & GROQ AGENT')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
                    title={t('Hapus Riwayat Chat', 'Clear Chat History')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/20">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center p-5 space-y-4">
                  <div className="w-13 h-13 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm animate-pulse">
                    <Sparkles className="w-6.5 h-6.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wide">
                      {t('Asisten Agentik Terintegrasi', 'Integrated Agentic Co-pilot')}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-1 max-w-[290px] mx-auto leading-relaxed">
                      {t(
                        'Saya dapat memodifikasi aplikasi secara otomatis! Cukup ketik "centang minum air", "tulis catatan harian hari ini tentang...", atau "tambahkan proyek web baru ke database".',
                        'I can modify your workspace on the fly! Try typing "check workout habit", "write a journal note about...", or "add website design task to database".'
                      )}
                    </p>
                  </div>

                  {/* Built-in presets for fast testing */}
                  <div className="w-full space-y-1.5 pt-1.5">
                    <button
                      onClick={() => handleSendMessage(t('tolong centang kebiasaan minum air hari ini', 'please check drink water habit today'))}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-[#EBEBEB] hover:border-indigo-400 hover:bg-indigo-50/20 rounded-xl text-left text-xs text-neutral-700 transition-all shadow-3xs cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate flex-1 font-medium">{t('Centang kebiasaan minum air', 'Check off drink water')}</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage(t('tulis catatan harian baru judul "Evaluasi Fokus" isinya "Hari ini produktivitas luar biasa, fokus penuh mengerjakan layout"', 'write a new journal note with title "Focus Evaluation" and content "Today was extremely productive, fully focused on layouts"'))}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-[#EBEBEB] hover:border-indigo-400 hover:bg-indigo-50/20 rounded-xl text-left text-xs text-neutral-700 transition-all shadow-3xs cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate flex-1 font-medium">{t('Tulis catatan harian baru', 'Write a new journal note')}</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage(t('tambahkan tidur jam 22:00 sampai 07:00 ke dalam aktivitas hari ini', 'add sleep session from 22:00 to 07:00 to today\'s timeline'))}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-[#EBEBEB] hover:border-indigo-400 hover:bg-indigo-50/20 rounded-xl text-left text-xs text-neutral-700 transition-all shadow-3xs cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate flex-1 font-medium">{t('Catat tidur jam 22.00 - 07.00', 'Log sleep 22:00 - 07:00')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {/* Message Bubble */}
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-3xs ${
                          m.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none font-medium'
                            : 'bg-white border border-[#EBEBEB] text-neutral-800 rounded-bl-none'
                        }`}
                      >
                        <MarkdownBubble text={m.content} isUser={m.role === 'user'} />
                      </div>

                      {/* Executed Action Pill */}
                      {m.executedAction && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="mt-1.5 flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-3xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{m.executedAction.description}</span>
                        </motion.div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-[#EBEBEB] rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-3xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce duration-300" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce duration-300" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce duration-300" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-neutral-100 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('Ketik instruksi ke Tsaqif AI...', 'Type instructions to Tsaqif AI...')}
                className="flex-1 bg-neutral-50 border border-[#EBEBEB] focus:border-indigo-400 focus:bg-white rounded-xl px-3 py-2 text-xs outline-hidden transition-all text-neutral-800"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-100 text-white disabled:text-neutral-300 rounded-xl transition-all shadow-3xs shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        id="btn-trigger-ai"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg cursor-pointer relative group"
        title={t('Tanya Tsaqif AI', 'Ask Tsaqif AI')}
      >
        <Sparkles className="w-5 h-5" />
        
        {/* Unread dot indicator */}
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white animate-ping" />
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white" />
      </motion.button>
    </div>
  );
}
