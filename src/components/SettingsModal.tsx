import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Palette, 
  Database, 
  Clock, 
  Globe, 
  Languages, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Moon, 
  Sun,
  Laptop,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings, Page, Habit, TrackingDay, DatabaseRow, ActivityEntry } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  user: any; // Firebase User
  onUpdateProfileName: (name: string) => Promise<void>;
  // For Data Import / Export / Delete
  pages: Page[];
  habits: Habit[];
  trackingDays: TrackingDay[];
  databaseRows: DatabaseRow[];
  activityRecaps: Record<string, ActivityEntry[]>;
  onImportData: (data: {
    pages: Page[];
    habits: Habit[];
    trackingDays: TrackingDay[];
    databaseRows: DatabaseRow[];
    activityRecaps: Record<string, ActivityEntry[]>;
    settings?: AppSettings;
  }) => void;
  onResetAllData: () => Promise<void>;
}

type ActiveTab = 'profile' | 'data';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  user,
  onUpdateProfileName,
  pages,
  habits,
  trackingDays,
  databaseRows,
  activityRecaps,
  onImportData,
  onResetAllData
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  
  // Profile tab states
  const [profileName, setProfileName] = useState(settings.profileName || user?.displayName || 'Tsaqif');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Data management states
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  // Handle profile update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setIsUpdatingProfile(true);
    setProfileSuccessMsg('');
    try {
      await onUpdateProfileName(profileName.trim());
      onUpdateSettings({
        ...settings,
        profileName: profileName.trim()
      });
      setProfileSuccessMsg(settings.language === 'en' ? 'Profile updated successfully!' : 'Profil berhasil diperbarui!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setProfileSuccessMsg(settings.language === 'en' ? 'Failed to update profile.' : 'Gagal memperbarui profil.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Export data to JSON file
  const handleExportData = () => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      pages,
      habits,
      trackingDays,
      databaseRows,
      activityRecaps,
      settings
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ruang-tsaqif-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup data
  const processImportedJson = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      
      // Basic validation of keys
      if (!data.pages || !Array.isArray(data.pages)) {
        throw new Error(settings.language === 'en' ? 'Invalid format: "pages" array is missing.' : 'Format tidak valid: array "pages" tidak ditemukan.');
      }
      
      onImportData({
        pages: data.pages,
        habits: data.habits || habits,
        trackingDays: data.trackingDays || [],
        databaseRows: data.databaseRows || [],
        activityRecaps: data.activityRecaps || {},
        settings: data.settings || settings
      });

      setImportSuccess(true);
      setImportError('');
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setImportError(err?.message || (settings.language === 'en' ? 'Failed to parse backup file.' : 'Gagal membaca berkas cadangan.'));
      setImportSuccess(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        processImportedJson(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/json" || file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && typeof event.target.result === 'string') {
            processImportedJson(event.target.result);
          }
        };
        reader.readAsText(file);
      } else {
        setImportError(settings.language === 'en' ? 'Please upload a JSON file only.' : 'Hanya diperbolehkan mengunggah berkas JSON.');
      }
    }
  };

  // Reset/Delete all data
  const handleResetData = async () => {
    setIsDeleting(true);
    try {
      await onResetAllData();
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to delete data.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Common language translations helper
  const t = (idText: string, enText: string) => {
    return settings.language === 'id' ? idText : enText;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        id="settings-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Card */}
      <div 
        id="settings-dialog"
        className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl h-[520px] max-h-[90vh] flex overflow-hidden z-10 text-neutral-800 dark:text-neutral-200"
      >
        {/* Left Navigation Sidebar */}
        <div className="w-48 bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 p-3 flex flex-col justify-between shrink-0 select-none">
          <div>
            <div className="px-3 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              {t('Pengaturan', 'Settings')}
            </div>
            
            <nav className="space-y-1 mt-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'profile'
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('Profil Saya', 'My Profile')}</span>
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'data'
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{t('Kelola Data', 'Data Control')}</span>
              </button>
            </nav>
          </div>

          <div className="p-3 text-[10px] text-neutral-400 border-t border-neutral-100 dark:border-neutral-800">
            <div>Ruang Tsaqif v1.2</div>
            <div className="mt-0.5 text-neutral-500">Cloud Connected</div>
          </div>
        </div>

        {/* Right Content View */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-900">
          {/* Header */}
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between select-none">
            <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
              {activeTab === 'profile' && t('Pengaturan Profil', 'Profile Settings')}
              {activeTab === 'data' && t('Manajemen Data & Cadangan', 'Data & Backup Management')}
            </h3>
            
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Content Wrapper */}
          <div className="flex-1 p-5 overflow-y-auto">
            
            {/* 1. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div className="flex items-center gap-4 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800 p-4 rounded-xl">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-800 select-none shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-lg select-none">
                      {profileName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-neutral-950 dark:text-white truncate">
                      {user?.displayName || profileName}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                      {user?.email || 'offline@ruangtsaqif.local'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 select-none">
                      {t('Nama Ruang / Profil', 'Workspace / Profile Name')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-700 transition-shadow text-neutral-900 dark:text-white"
                        placeholder="Contoh: Tsaqif"
                      />
                      <button
                        type="submit"
                        disabled={isUpdatingProfile || !profileName.trim()}
                        className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        {isUpdatingProfile ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          t('Simpan', 'Save')
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {profileSuccessMsg && (
                  <div className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Languages className="w-4 h-4 text-neutral-400" />
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider select-none">
                      {t('Pengaturan Bahasa', 'Language Settings')}
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      id="btn-lang-en"
                      onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
                      className={`flex-1 flex items-center justify-between px-4 py-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        settings.language === 'en'
                          ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-950 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🇺🇸</span>
                        <span>English (US)</span>
                      </div>
                      {settings.language === 'en' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>

                    <button
                      type="button"
                      id="btn-lang-id"
                      onClick={() => onUpdateSettings({ ...settings, language: 'id' })}
                      className={`flex-1 flex items-center justify-between px-4 py-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        settings.language === 'id'
                          ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-950 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🇮🇩</span>
                        <span>Bahasa Indonesia</span>
                      </div>
                      {settings.language === 'id' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  </div>
                </div>
              </div>
            )}



            {/* 3. DATA TAB */}
            {activeTab === 'data' && (
              <div className="space-y-5">
                {/* Export & Import Panel */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Export Box */}
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-3 bg-neutral-50/50 dark:bg-neutral-950/20">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{t('Ekspor Data', 'Export Workspace')}</span>
                      </h4>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                        {t('Unduh semua data halaman, kebiasaan, catatan, aktivitas harian, dan preferensi dalam berkas JSON tunggal.', 'Download all pages, habits, tracking logs, and layout preferences into a single portable JSON file.')}
                      </p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center"
                    >
                      {t('Unduh Cadangan', 'Download Backup')}
                    </button>
                  </div>

                  {/* Import Box */}
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-3 bg-neutral-50/50 dark:bg-neutral-950/20">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t('Impor Data', 'Import Workspace')}</span>
                      </h4>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                        {t('Unggah kembali berkas cadangan JSON Anda untuk memulihkan seluruh riwayat atau berpindah perangkat.', 'Upload your previously exported JSON file to restore logs or migrate records seamlessly.')}
                      </p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center"
                    >
                      {t('Pilih Berkas JSON', 'Select JSON File')}
                    </button>
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center space-y-2 ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10' 
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-950/10'
                  }`}
                >
                  <Upload className={`w-6 h-6 ${isDragging ? 'text-indigo-500 animate-bounce' : 'text-neutral-400'}`} />
                  <div>
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {t('Seret & lepas berkas JSON di sini atau klik', 'Drag & drop JSON backup file here, or click to browse')}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {t('Hanya mendukung format ekspor resmi dari Ruang Tsaqif', 'Supports official exported formats only')}
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {importError && (
                  <div className="text-xs bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30">
                    {importError}
                  </div>
                )}

                {importSuccess && (
                  <div className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('Data berhasil diimpor! Halaman akan dimuat ulang...', 'Data imported successfully! Reloading page...')}</span>
                  </div>
                )}

                <hr className="border-t border-neutral-100 dark:border-neutral-800" />

                {/* Danger Zone */}
                <div className="border border-red-100 dark:border-red-900/40 rounded-xl p-4 bg-red-50/20 dark:bg-red-950/5 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-red-700 dark:text-red-400">
                        {t('Zona Bahaya: Reset Seluruh Data', 'Danger Zone: Reset All Data')}
                      </h4>
                      <p className="text-[10px] text-red-600/80 dark:text-red-400/70 mt-1 leading-relaxed">
                        {t('Tindakan ini akan menghapus permanen seluruh halaman catatan, riwayat kebiasaan, entri waktu, dan tabel kerja Anda baik di cloud maupun di peramban ini. Pastikan Anda telah mencadangkan data penting.', 'This will permanently wipe all logs, pages, habit histories, and board rows from cloud and client store. This cannot be undone!')}
                      </p>
                    </div>
                  </div>

                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('Hapus Seluruh Data Saya', 'Delete All My Data')}</span>
                    </button>
                  ) : (
                    <div className="bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/50 p-3 rounded-lg space-y-2.5">
                      <p className="text-xs font-bold text-red-700 dark:text-red-400">
                        {t('Apakah Anda sangat yakin? Tindakan ini permanen!', 'Are you absolutely sure? This cannot be undone!')}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleResetData}
                          disabled={isDeleting}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          {isDeleting ? t('Menghapus...', 'Deleting...') : t('Ya, Hapus Sekarang', 'Yes, Delete Now')}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white rounded-md text-xs font-semibold cursor-pointer"
                        >
                          {t('Batal', 'Cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
