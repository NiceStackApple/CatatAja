import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smartphone, 
  Bot, 
  Settings, 
  Copy, 
  Check, 
  CheckCheck, 
  Sparkles, 
  HelpCircle, 
  Activity, 
  CheckSquare,
  Smile,
  Clock,
  Play,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit, TrackingDay, DatabaseRow, AppSettings } from '../types';

interface TelegramBotViewProps {
  habits: Habit[];
  onUpdateHabits: (habits: Habit[]) => void;
  todayTrackingData: TrackingDay;
  onToggleTodayHabit: (habitId: string) => void;
  onSetTodayMood: (mood: TrackingDay['mood']) => void;
  onSetTodayHours: (hours: number) => void;
  databaseRows: DatabaseRow[];
  onUpdateDatabaseRows: (rows: DatabaseRow[]) => void;
  settings: AppSettings;
}

interface SimulatedMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export default function TelegramBotView({
  habits,
  onUpdateHabits,
  todayTrackingData,
  onToggleTodayHabit,
  onSetTodayMood,
  onSetTodayHours,
  databaseRows,
  onUpdateDatabaseRows,
  settings
}: TelegramBotViewProps) {
  const [botEnabled, setBotEnabled] = useState(() => {
    return localStorage.getItem('tg_bot_enabled') === 'true';
  });
  const [botName, setBotName] = useState(() => {
    return localStorage.getItem('tg_bot_name') || 'Asisten Tsaqif';
  });
  const [botToken, setBotToken] = useState(() => {
    return localStorage.getItem('tg_bot_token') || '';
  });
  const [persona, setPersona] = useState(() => {
    return localStorage.getItem('tg_persona') || 'Anda adalah AI Telegram Bot pribadi untuk Ruang Tsaqif. Tugas Anda adalah membantu user melacak kebiasaan, mencatat jurnal harian, dan menambahkan tugas baru. Balas dengan bahasa yang hangat, memotivasi, santai, dan penuh dukungan.';
  });

  const [showToken, setShowToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [webhookMessage, setWebhookMessage] = useState('');

  // Simulated Telegram states
  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<SimulatedMessage[]>([
    {
      id: 'tg-init',
      sender: 'bot',
      text: 'Halo! Saya AI Telegram Bot dari Ruang Tsaqif Anda. Silakan ketik apa saja untuk mencatat kebiasaan harian, menambah tugas/to-do harian, atau menceritakan hari Anda! 🤖✨',
      timestamp: '12:00'
    }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isBotTyping]);

  const t = (idText: string, enText: string) => {
    return settings.language === 'id' ? idText : enText;
  };

  const getWebhookUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ruang-tsaqif.vercel.app';
    return `${origin}/api/telegram/webhook${botToken ? `?token=${botToken}` : ''}`;
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(getWebhookUrl());
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSaveConfig = () => {
    localStorage.setItem('tg_bot_enabled', String(botEnabled));
    localStorage.setItem('tg_bot_name', botName);
    localStorage.setItem('tg_bot_token', botToken);
    localStorage.setItem('tg_persona', persona);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRegisterWebhook = async () => {
    if (!botToken.trim()) {
      setWebhookStatus('error');
      setWebhookMessage(t('Harap isi token bot Telegram terlebih dahulu!', 'Please enter your Telegram bot token first!'));
      return;
    }

    setWebhookStatus('loading');
    setWebhookMessage('');

    try {
      // Direct call to Telegram API to set the webhook endpoint!
      const targetUrl = encodeURIComponent(getWebhookUrl());
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${getWebhookUrl()}`);
      const data = await response.json();

      if (data.ok) {
        setWebhookStatus('success');
        setWebhookMessage(t('Sukses mendaftarkan webhook ke Telegram!', 'Successfully registered webhook to Telegram!'));
      } else {
        setWebhookStatus('error');
        setWebhookMessage(data.description || t('Gagal mengonfigurasi webhook.', 'Failed to configure webhook.'));
      }
    } catch (err: any) {
      console.error(err);
      setWebhookStatus('error');
      setWebhookMessage(err.message || t('Terjadi kesalahan jaringan.', 'A network error occurred.'));
    }
  };

  // Process the user text with AI to match intents and manipulate parent states!
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputMessage('');
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message to chat thread
    const userMsgId = `user-${Date.now()}`;
    setChatMessages(prev => [...prev, {
      id: userMsgId,
      sender: 'user',
      text: text,
      timestamp: timeStr
    }]);

    setIsBotTyping(true);

    // AI API Processing
    try {
      // Build habits description to feed to the model
      const habitsDesc = habits.map(h => `- ID: "${h.id}", Name: "${h.name}", Icon: "${h.icon}"`).join('\n');
      const todayStr = new Date().toISOString().split('T')[0];

      const parserPrompt = `You are an intelligent natural language parse engine for the 'Ruang Tsaqif' personal productivity workspace.
You receive a text message from a Telegram bot and must analyze it to trigger real state actions in the workspace.
Today's Date: ${todayStr}

Available Habits in Workspace:
${habitsDesc}

Current Completed Habits today: ${JSON.stringify(todayTrackingData.habitsCompleted)}
Current Mood today: "${todayTrackingData.mood || 'None'}"
Current Productive Hours today: ${todayTrackingData.productiveHours || 0}

You MUST return a JSON object with EXACTLY these two keys:
1. "reply": A warm, encouraging response in Indonesian language (matching the tone of a friendly personal assistant bot, starting with an emoji, acknowledging exactly what was done).
2. "action": An object containing the parsed action. If no specific action is found, set "type" to "none".

Action Schemas:
- For logging a habit (user says "Saya sudah lari", "check minum air", etc.):
  { "type": "toggle_habit", "habitId": "<id_of_the_matched_habit>" }
- For setting/updating mood (user says "saya sedih", "hari ini senang", "mood ok", etc.):
  { "type": "set_mood", "mood": "excellent" | "good" | "neutral" | "bad" | "terrible" }
- For setting productive work duration (user says "bekerja 5 jam", "productive 3 jam", etc.):
  { "type": "set_hours", "hours": <number_of_hours> }
- For adding a new task to database (user says "tambah tugas beli susu", "ingatkan belajar react besok", etc.):
  { "type": "add_task", "title": "<task_title>", "priority": "High" | "Medium" | "Low", "dueDate": "YYYY-MM-DD" }
- For creating/adding a new habit template or routine list (user says "bikin routine list baru: Membaca Buku dengan ikon 📚", "buat kebiasaan baru Belajar", "tambah kebiasaan Olahraga", dsb.):
  { "type": "add_habit", "name": "<habit_name>", "icon": "<emoji_icon_or_default_to_💪>" }

Do NOT include any markdown code blocks or backticks in your output. Return only the raw JSON.`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          systemPrompt: parserPrompt,
          temperature: 0.1
        })
      });

      const data = await response.json();
      let replyText = 'Maaf, saya sedang mengalami gangguan koneksi ke Ruang Tsaqif Anda. 😢';
      let parsedJson: any = null;

      if (data.success && data.message?.content) {
        try {
          // Clean possible markdown wrapper
          let rawContent = data.message.content.trim();
          if (rawContent.startsWith('```')) {
            rawContent = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
          }
          parsedJson = JSON.parse(rawContent.trim());
          replyText = parsedJson.reply;
        } catch (e) {
          console.error("Failed to parse JSON reply from AI:", e);
          replyText = data.message.content;
        }
      }

      // If action is parsed, execute it in real time!
      if (parsedJson && parsedJson.action && parsedJson.action.type !== 'none') {
        const action = parsedJson.action;

        if (action.type === 'toggle_habit' && action.habitId) {
          onToggleTodayHabit(action.habitId);
        } else if (action.type === 'set_mood' && action.mood) {
          onSetTodayMood(action.mood);
        } else if (action.type === 'set_hours' && action.hours) {
          onSetTodayHours(action.hours);
        } else if (action.type === 'add_habit' && action.name) {
          const newHabit: Habit = {
            id: `hb-${Date.now()}`,
            name: action.name,
            icon: action.icon || '💪',
            color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            frequency: 'Daily'
          };
          onUpdateHabits([...habits, newHabit]);
        } else if (action.type === 'add_task' && action.title) {
          const newTask: DatabaseRow = {
            id: `row-${Date.now()}`,
            title: action.title,
            status: 'Not Started',
            priority: action.priority || 'Medium',
            dueDate: action.dueDate || todayStr,
            tags: ['Telegram Bot']
          };
          onUpdateDatabaseRows([...databaseRows, newTask]);
        }
      }

      // Add Bot reply to chat thread
      setTimeout(() => {
        setIsBotTyping(false);
        setChatMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 500);

    } catch (err) {
      console.error(err);
      setIsBotTyping(false);
      setChatMessages(prev => [...prev, {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: 'Aduh! Koneksi server terputus. Pastikan kunci API Anda terkonfigurasi dengan benar di panel pengaturan utama Anda. ⚠️',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleQuickPreset = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header and Introduction */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F1F1F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F0F9FF] text-[#0284C7] rounded-lg">
              <Smartphone className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {t('Integrasi Agen Telegram AI', 'Telegram AI Agent Integration')}
            </h1>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {t('Hubungkan workspace Ruang Tsaqif Anda ke bot Telegram pribadi secara gratis untuk pencatatan instan.', 'Connect your Ruang Tsaqif workspace to a personal Telegram bot for free instant logs.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
            botEnabled 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${botEnabled ? 'bg-blue-500 animate-pulse' : 'bg-neutral-400'}`} />
            {botEnabled ? t('Bot Aktif', 'Bot Active') : t('Bot Nonaktif', 'Bot Disabled')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Config Panel & BotFather Guide (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Bot Control Card */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-600" />
              {t('Konfigurasi Agen AI', 'AI Agent Configuration')}
            </h2>

            <div className="space-y-4">
              {/* Bot Enabled Switcher */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-neutral-700 block">
                    {t('Aktifkan Layanan Bot', 'Enable Bot Service')}
                  </label>
                  <span className="text-xs text-neutral-500">
                    {t('Izinkan bot membalas pesan Telegram asli lewat Webhook.', 'Allow bot to respond to real Telegram messages via Webhook.')}
                  </span>
                </div>
                <button
                  onClick={() => setBotEnabled(!botEnabled)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none relative cursor-pointer ${
                    botEnabled ? 'bg-sky-500' : 'bg-neutral-300'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    botEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Bot Name Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                    {t('Nama Bot Telegram', 'Telegram Bot Name')}
                  </label>
                  <input
                    type="text"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E1E1E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="e.g. Asisten Tsaqif"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                    {t('Token Bot Telegram', 'Telegram Bot Token')}
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[#E1E1E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
                      placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showToken ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Webhook URL Endpoint */}
              <div className="space-y-1.5 bg-[#F9F9F8] p-3 rounded-lg border border-[#EBEBEB]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-600 block">
                    {t('Webhook URL untuk Telegram Webhook API', 'Webhook URL for Telegram Webhook API')}
                  </label>
                  <button
                    onClick={handleCopyWebhook}
                    className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3 h-3" />
                        {t('Tersalin!', 'Copied!')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        {t('Salin URL', 'Copy URL')}
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs font-mono bg-white p-2 rounded border border-[#EBEBEB] text-neutral-600 select-all overflow-x-auto whitespace-nowrap">
                  {getWebhookUrl()}
                </div>
              </div>

              {/* Instant Webhook Register Button */}
              <div className="p-3.5 bg-sky-50/50 border border-sky-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-sky-800 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    {t('Daftarkan Webhook Otomatis', 'Automatic Webhook Registration')}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {t('Daftarkan URL di atas langsung ke API Telegram secara instan.', 'Register the above URL straight to Telegram API instantly.')}
                  </p>
                </div>
                <button
                  onClick={handleRegisterWebhook}
                  disabled={webhookStatus === 'loading'}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${webhookStatus === 'loading' ? 'animate-spin' : ''}`} />
                  {t('Daftarkan Webhook', 'Register Webhook')}
                </button>
              </div>

              {webhookMessage && (
                <div className={`p-2.5 rounded-lg text-xs border ${
                  webhookStatus === 'success' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {webhookMessage}
                </div>
              )}

              {/* Persona Instructions */}
              <div>
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                  {t('Petunjuk Karakter & Persona Bot', 'Bot Character & Persona Instructions')}
                </label>
                <textarea
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-[#E1E1E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 leading-relaxed"
                  placeholder="e.g. Balas dengan sopan..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    {t('Pengaturan berhasil disimpan!', 'Settings saved successfully!')}
                  </span>
                ) : (
                  <span />
                )}
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  {t('Simpan Konfigurasi', 'Save Configuration')}
                </button>
              </div>

            </div>
          </div>

          {/* BotFather Telegram Integration Guide */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              {t('Cara Membuat Bot Telegram 100% Gratis dalam 1 Menit', 'How to Create a Telegram Bot 100% Free in 1 Minute')}
            </h2>

            <div className="space-y-3 text-sm text-neutral-600 leading-relaxed">
              <p>
                {t(
                  'Membuat bot Telegram sangatlah mudah, gratis selamanya, tanpa memerlukan kartu kredit atau layanan berbayar:',
                  'Creating a Telegram bot is extremely easy, free forever, and requires no credit cards or paid services:'
                )}
              </p>
              <ol className="list-decimal pl-5 space-y-2.5">
                <li>
                  {t('Buka aplikasi Telegram Anda, cari akun resmi ', 'Open your Telegram app, search for the official ')}
                  <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-600 underline font-bold inline-flex items-center gap-0.5">
                    @BotFather
                    <ExternalLink className="w-3 h-3" />
                  </a>.
                </li>
                <li>
                  {t('Kirim perintah ', 'Send the command ')}
                  <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-xs text-rose-600">/newbot</code>
                  {t(' untuk membuat bot baru.', ' to create a new bot.')}
                </li>
                <li>
                  {t('Masukkan Nama Bot dan Username Bot (harus diakhiri dengan kata "bot", contoh: ', 'Enter a Name and a Username (must end with "bot", e.g. ')}
                  <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-xs">tsaqif_helper_bot</code>).
                </li>
                <li>
                  {t('Salin kode ', 'Copy the ')}
                  <strong className="text-neutral-800">HTTP API Token</strong>
                  {t(' yang diberikan oleh BotFather dan tempel di kolom konfigurasi di atas.', ' provided by BotFather and paste it into the Telegram Bot Token field above.')}
                </li>
                <li>
                  {t('Klik tombol "Daftarkan Webhook" di atas agar Telegram otomatis mengirimkan pesan yang masuk ke dashboard ini!', 'Click the "Register Webhook" button above so Telegram automatically forwards messages to this workspace!')}
                </li>
                <li>
                  {t('Buka bot baru Anda di Telegram, klik "Start" dan mulai mengetik untuk menggunakannya secara riil!', 'Open your new bot in Telegram, click "Start" and begin chatting to use it live!')}
                </li>
              </ol>

              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded-lg flex items-start gap-2.5 mt-2">
                <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong>{t('Catatan Keamanan:', 'Security Note:')}</strong>{' '}
                  {t(
                    'Kredensial Token Bot Telegram Anda disimpan dengan aman secara lokal di browser Anda dan hanya digunakan untuk komunikasi dengan API Telegram resmi.',
                    'Your Telegram Bot Token is saved securely in your browser and only used for direct communication with the official Telegram APIs.'
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Phone Telegram Simulator (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          <div className="w-full max-w-[340px] bg-[#182533] rounded-[36px] p-3 shadow-2xl border-4 border-neutral-700 relative overflow-hidden h-[600px] flex flex-col">
            
            {/* Phone Speaker & Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-neutral-700 rounded-b-xl z-20 flex items-center justify-center gap-1.5">
              <div className="w-10 h-1 bg-neutral-800 rounded-full" />
              <div className="w-2 h-2 bg-neutral-950 rounded-full" />
            </div>

            {/* Simulated Telegram Header */}
            <div className="bg-[#1e2c3a] text-white pt-6 pb-2.5 px-3 flex items-center gap-2 border-b border-[#131d27] z-10">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-xs">
                  {botName.substring(0, 2).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-sky-400 border-2 border-[#1e2c3a]" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold truncate max-w-[150px]">{botName}</div>
                <div className="text-[10px] text-sky-300">bot</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                  TG_AGENT
                </span>
              </div>
            </div>

            {/* Chat Area with Telegram background style */}
            <div 
              className="flex-1 overflow-y-auto p-3 space-y-2.5 relative flex flex-col bg-[#0e1621]"
              style={{
                backgroundImage: 'radial-gradient(#151f2d 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              
              <div className="self-center bg-[#1e2c3a]/60 text-sky-200 text-[9px] px-2 py-0.5 rounded shadow-sm uppercase tracking-wider mb-2">
                {t('Hari ini', 'Today')}
              </div>

              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs shadow-xs flex flex-col relative ${
                    msg.sender === 'user'
                      ? 'self-end bg-[#2b5278] text-white rounded-tr-none'
                      : 'self-start bg-[#182533] text-white rounded-tl-none'
                  }`}
                >
                  <div className="break-words leading-normal select-text pr-3">{msg.text}</div>
                  
                  <div className="flex items-center justify-end gap-1 text-[8px] text-slate-400 mt-1 self-end">
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {isBotTyping && (
                <div className="self-start bg-[#182533] text-white rounded-lg rounded-tl-none px-3 py-2 text-xs shadow-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Phone Message Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-[#1e2c3a] p-2 flex items-center gap-1.5 z-10 border-t border-[#131d27]"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('Ketik pesan ke bot...', 'Type message to bot...')}
                className="flex-1 bg-[#17212b] text-white rounded-full px-3.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 border-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isBotTyping}
                className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 disabled:bg-neutral-600 disabled:opacity-50 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5 pl-0.5" />
              </button>
            </form>

          </div>

          {/* Quick Sandbox Simulator Presets */}
          <div className="w-full max-w-[340px] mt-4 space-y-2">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center">
              💡 {t('Pemicu Simulasi Cepat', 'Quick Simulation Presets')}
            </h4>
            <p className="text-[10px] text-neutral-400 text-center leading-normal mb-2">
              {t('Klik preset untuk mensimulasikan input Telegram riil dan lihat dashboard diperbarui secara real-time!', 'Click any preset to simulate Telegram input and see the dashboard update in real-time!')}
            </p>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => handleQuickPreset('Saya sudah lari pagi hari ini')}
                className="text-left px-3 py-2 bg-white hover:bg-sky-50 border border-neutral-200 hover:border-sky-200 rounded-lg text-xs font-medium text-neutral-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Activity className="w-3.5 h-3.5 text-sky-500" />
                <span>"Saya sudah lari pagi hari ini"</span>
              </button>

              <button
                onClick={() => handleQuickPreset('Tambahkan tugas baru: Belajar TypeScript dengan prioritas Tinggi')}
                className="text-left px-3 py-2 bg-white hover:bg-sky-50 border border-neutral-200 hover:border-sky-200 rounded-lg text-xs font-medium text-neutral-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <CheckSquare className="w-3.5 h-3.5 text-sky-500" />
                <span>"Tambahkan tugas baru: Belajar TS"</span>
              </button>

              <button
                onClick={() => handleQuickPreset('Hari ini saya sangat bahagia karena bot Telegram berjalan lancar!')}
                className="text-left px-3 py-2 bg-white hover:bg-sky-50 border border-neutral-200 hover:border-sky-200 rounded-lg text-xs font-medium text-neutral-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Smile className="w-3.5 h-3.5 text-sky-500" />
                <span>"Saya sangat bahagia hari ini"</span>
              </button>

              <button
                onClick={() => handleQuickPreset('Atur jam produktif saya hari ini menjadi 8 jam')}
                className="text-left px-3 py-2 bg-white hover:bg-sky-50 border border-neutral-200 hover:border-sky-200 rounded-lg text-xs font-medium text-neutral-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>"Atur jam produktif hari ini jadi 8 jam"</span>
              </button>

              <button
                onClick={() => handleQuickPreset('Bikin routine list baru: Membaca Buku dengan ikon 📚')}
                className="text-left px-3 py-2 bg-white hover:bg-sky-50 border border-neutral-200 hover:border-sky-200 rounded-lg text-xs font-medium text-neutral-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>"Bikin routine list baru: Membaca Buku 📚"</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
