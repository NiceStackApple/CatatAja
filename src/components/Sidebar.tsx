import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Search, 
  Settings, 
  Plus, 
  Trash2, 
  Menu, 
  X, 
  Check, 
  Folder, 
  FileText,
  Calendar,
  BarChart4,
  CheckSquare,
  Sparkles,
  User,
  Github,
  ChevronsLeft,
  ChevronsUpDown,
  Mail,
  UserPlus,
  ArrowUpCircle,
  LogOut,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page, PageType, AppSettings } from '../types';
import PageIcon, { getPageIconAccentColor } from './PageIcon';
import Logo from './Logo';

interface SidebarProps {
  pages: Page[];
  currentPageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: (type: PageType) => void;
  onDeletePage: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  user?: any;
  onLogout?: () => void;
  settings?: AppSettings;
  onOpenSettings?: () => void;
}

export default function Sidebar({
  pages,
  currentPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onToggleFavorite,
  isCollapsed,
  setIsCollapsed,
  user,
  onLogout,
  settings,
  onOpenSettings,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const t = (idText: string, enText: string) => {
    return settings?.language === 'id' ? idText : enText;
  };
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [deleteConfirmPageId, setDeleteConfirmPageId] = useState<string | null>(null);
  const [deleteConfirmPageTitle, setDeleteConfirmPageTitle] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getPageIcon = (type: PageType) => {
    switch (type) {
      case 'tracker': return '📔';
      case 'calendar': return '📅';
      case 'analytics': return '📊';
      case 'database': return '🗂️';
      case 'notes': return '📝';
      case 'blank': return '✨';
      default: return '📄';
    }
  };

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favorites = filteredPages.filter(p => p.isFavorite);
  const regularPages = filteredPages.filter(p => !p.isFavorite);

  const addNewPageClick = (type: PageType) => {
    onAddPage(type);
    setShowAddMenu(false);
  };

  const handleRequestPageDelete = (id: string, title: string, shiftKey: boolean) => {
    if (shiftKey) {
      onDeletePage(id);
    } else {
      setDeleteConfirmPageId(id);
      setDeleteConfirmPageTitle(title || 'Halaman Tanpa Judul');
    }
  };

  return (
    <>
      {/* Mobile Toggle Button (Visible only on mobile/hidden if sidebar is open) */}
      {isCollapsed && (
        <button
          id="btn-sidebar-open"
          onClick={() => setIsCollapsed(false)}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 z-40 p-2 rounded-lg border border-notion-border bg-white text-notion-text hover:bg-neutral-50 transition-all shadow-md flex items-center justify-center cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Backdrop overlay for mobile when sidebar is open */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsCollapsed(true)}
            className="fixed inset-0 bg-black z-20 md:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Sidebar main body */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.aside
            initial={{ x: isMobile ? -256 : 0, width: isMobile ? 256 : 0, opacity: 0 }}
            animate={{ x: 0, width: 256, opacity: 1 }}
            exit={{ x: isMobile ? -256 : 0, width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: -256, right: 0 }}
            dragElastic={{ left: 0.1, right: 0 }}
            dragMomentum={false}
            onDragEnd={(event, info) => {
              if (info.offset.x < -50 || info.velocity.x < -200) {
                setIsCollapsed(true);
              }
            }}
            className="fixed inset-y-0 left-0 md:relative z-30 h-full bg-notion-sidebar border-r border-notion-border flex flex-col select-none shrink-0 overflow-hidden touch-pan-y"
          >
            {/* Header / Workspace Switcher */}
            <div className="p-3 flex items-center justify-between gap-1 mb-1 relative group/header">
              <div 
                id="workspace-switcher"
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="flex items-center gap-1.5 p-1 rounded-md hover:bg-notion-hover cursor-pointer transition-colors overflow-hidden flex-1 active:scale-[0.98]"
              >
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    className="w-5.5 h-5.5 rounded-full object-cover shrink-0 select-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Logo size="sm" className="w-5.5 h-5.5 rounded-md" />
                )}
                <div className="text-left overflow-hidden flex-1 flex items-center gap-1">
                  <p className="text-[13px] font-semibold truncate leading-none text-[#37352F]">
                    {settings?.profileName ? `Ruang ${settings.profileName.split(' ')[0]}` : user?.displayName ? `Ruang ${user.displayName.split(' ')[0]}` : 'Ruang Tsaqif'}
                  </p>
                  <ChevronsUpDown className="w-3 h-3 text-[#787774]/80 shrink-0" />
                </div>
              </div>

              {/* Collapsible toggle / "<<" placed precisely as sibling to avoid overlap */}
              <button
                id="btn-sidebar-collapse"
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-md text-[#787774] md:opacity-0 md:group-hover/header:opacity-100 hover:bg-notion-hover hover:text-[#37352F] transition-all cursor-pointer shrink-0"
                title="Sembunyikan sidebar"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Workspace drop-down menu redesigned after Notion reference */}
              <AnimatePresence>
                {showWorkspaceMenu && (
                  <>
                    {/* Backdrop to close menu when clicked outside */}
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setShowWorkspaceMenu(false)} 
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-12 left-2 w-[240px] bg-white border border-[#EBEBEB] rounded-lg shadow-[0_8px_24px_rgba(15,15,15,0.1)] py-1.5 z-50 text-[11px] text-[#37352F]"
                    >
                      {/* Section 1: Workspace Header Profile */}
                      <div className="px-3.5 py-1.5 flex items-center gap-2">
                        {user?.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName || "User"} 
                            className="w-8 h-8 rounded-full object-cover shrink-0 select-none"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Logo size="sm" className="w-8 h-8 rounded-lg" />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-[12px] text-[#37352F] leading-tight truncate">
                            {settings?.profileName ? `${settings.profileName}'s workspace` : user?.displayName ? `${user.displayName}'s workspace` : 'Tsaqif\'s workspace'}
                          </span>
                          <span className="text-[9px] text-[#787774] mt-0.5">Cloud Database · Active</span>
                        </div>
                      </div>

                      {/* Section 2: Account Actions */}
                      <div className="px-1 py-1">
                        <button 
                          onClick={() => alert("You are already connected to the Cloud Database!")}
                          className="w-full text-left px-2.5 py-1 rounded hover:bg-[#F7F7F5] flex items-center gap-2 text-[#2383E2] font-medium transition-colors"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5 text-[#2383E2]" />
                          <span>Cloud Active</span>
                        </button>
                        <button 
                          onClick={() => {
                            setShowWorkspaceMenu(false);
                            if (onOpenSettings) onOpenSettings();
                          }}
                          className="w-full text-left px-2.5 py-1 rounded hover:bg-[#F7F7F5] flex items-center gap-2 text-[#4F4F4F] transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Settings</span>
                        </button>
                      </div>

                      <div className="my-1 border-t border-[#EBEBEB]" />

                      {/* Section 3: User Workspaces */}
                      <div className="px-3.5 py-1 text-[10px] text-[#787774] font-medium truncate">
                        {user?.email || "tsaqifnico@gmail.com"}
                      </div>

                      <div className="px-1 py-0.5 space-y-0.5">
                        {/* Ruang Tsaqif row */}
                        <div 
                          className="px-2.5 py-1.5 rounded hover:bg-[#F7F7F5] flex items-center justify-between cursor-pointer transition-colors font-medium bg-[#F7F7F5]"
                          onClick={() => setShowWorkspaceMenu(false)}
                        >
                          <span className="flex items-center gap-2">
                            <GripVertical className="w-3 h-3 text-[#787774]/40" />
                            {user?.photoURL ? (
                              <img 
                                src={user.photoURL} 
                                alt="Workspace" 
                                className="w-4 h-4 rounded-full object-cover shrink-0 select-none"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Logo size="sm" className="w-4 h-4 rounded-sm" />
                            )}
                            <span className="text-[#37352F]">
                              {settings?.profileName ? `Ruang ${settings.profileName.split(' ')[0]}` : user?.displayName ? `Ruang ${user.displayName.split(' ')[0]}` : 'Ruang Tsaqif'}
                            </span>
                          </span>
                          <Check className="w-3.5 h-3.5 text-[#0D7A5E] shrink-0" />
                        </div>

                        {/* Demo Sandbox row */}
                        <div 
                          className="px-2.5 py-1.5 rounded hover:bg-[#F7F7F5] flex items-center justify-between cursor-pointer transition-colors"
                          onClick={() => {
                            alert("You are connected in real-time to the cloud database!");
                            setShowWorkspaceMenu(false);
                          }}
                        >
                          <span className="flex items-center gap-2 text-[#787774]">
                            <div className="w-3 h-3" /> {/* spacing to align with check layout grip icon */}
                            <span className="w-4 h-4 flex items-center justify-center text-[11px] shrink-0 font-bold">✨</span>
                            <span>Cloud Sync Active</span>
                          </span>
                        </div>
                      </div>

                      <div className="my-1 border-t border-[#EBEBEB]" />

                      {/* Section 4: Exit Actions */}
                      <div className="px-1 py-0.5">
                        <button 
                          onClick={() => {
                            setShowWorkspaceMenu(false);
                            if (onLogout) onLogout();
                          }}
                          className="w-full text-left px-2.5 py-1 rounded hover:bg-[#F7F7F5] flex items-center gap-2 text-[#787774] hover:text-[#EB5757] transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 shrink-0" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Controls & Search */}
            <div className="px-1.5 mb-1.5">
              <div className="relative flex items-center rounded bg-white border border-[#EBEBEB] text-xs px-2.5 py-1 shadow-sm">
                <Search className="w-3.5 h-3.5 text-notion-gray mr-2 shrink-0" />
                <input
                  id="sidebar-search-input"
                  type="text"
                  placeholder={t('Cari...', 'Search...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-notion-text placeholder-notion-gray/60 outline-hidden text-xs"
                />
              </div>
            </div>

            {/* Quick Actions - Removed as requested, Settings is accessible inside workspace switcher */}

            {/* Content Scrolling */}
            <div className="flex-1 overflow-y-auto px-1 gap-1">
              {/* Favorites Segment */}
              {favorites.length > 0 && (
                <div className="mb-4">
                  <p className="px-2 text-[11px] font-bold text-[#37352F] opacity-40 uppercase tracking-wider mb-2">{t('Favorit', 'Favorites')}</p>
                  <div className="space-y-0.5 mt-1">
                    {favorites.map((page) => (
                      <SidebarItem
                        key={page.id}
                        page={page}
                        currentPageId={currentPageId}
                        onSelectPage={onSelectPage}
                        onDeletePage={onDeletePage}
                        onToggleFavorite={onToggleFavorite}
                        onRequestDelete={handleRequestPageDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Private Pages Segment */}
              <div>
                <div className="px-2 text-[11px] font-bold text-[#37352F] uppercase tracking-wider mb-2 flex items-center justify-between select-none">
                  <span className="opacity-40">{t('Halaman Saya', 'My Pages')}</span>
                  <div className="relative">
                    <button
                      id="btn-add-page-plus"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddMenu(!showAddMenu);
                      }}
                      className="p-1 rounded-md text-[#787774] hover:bg-[#EBEBEB] hover:text-[#37352F] cursor-pointer transition-colors"
                      title={t('Tambah Halaman Baru', 'Add New Page')}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick choice dropdown - fully opaque and prominent */}
                    <AnimatePresence>
                      {showAddMenu && (
                        <>
                          {/* Invisible backdrop to dismiss dropdown cleanly */}
                          <div 
                            className="fixed inset-0 z-40 bg-transparent cursor-default" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddMenu(false);
                            }} 
                          />
                          
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 top-6 bg-white border border-[#EBEBEB] rounded-lg shadow-[0_4px_16px_rgba(15,15,15,0.08)] py-1.5 w-48 z-50 text-[11px] text-[#37352F] font-normal lowercase tracking-normal"
                          >
                            <div className="px-3 py-1.5 text-[9px] font-bold text-[#787774] uppercase tracking-wider border-b border-[#F1F1F0] mb-1">
                              {t('Pilih Tipe Halaman:', 'Choose Page Type:')}
                            </div>
                            <button
                              onClick={() => {
                                addNewPageClick('tracker');
                                setShowAddMenu(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#F7F7F5] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <PageIcon type="tracker" className="w-3.5 h-3.5 shrink-0 text-[#0D7A5E]" /> 
                              <span className="capitalize">Daily Tracker</span>
                            </button>
                            <button
                              onClick={() => {
                                addNewPageClick('calendar');
                                setShowAddMenu(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#F7F7F5] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <PageIcon type="calendar" className="w-3.5 h-3.5 shrink-0 text-[#2383E2]" /> 
                              <span className="capitalize">Tracking Calendar</span>
                            </button>
                            <button
                              onClick={() => {
                                addNewPageClick('analytics');
                                setShowAddMenu(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#F7F7F5] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <PageIcon type="analytics" className="w-3.5 h-3.5 shrink-0 text-[#6931E3]" /> 
                              <span className="capitalize">Productivity Charts</span>
                            </button>
                            <button
                              onClick={() => {
                                addNewPageClick('database');
                                setShowAddMenu(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#F7F7F5] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <PageIcon type="database" className="w-3.5 h-3.5 shrink-0 text-[#D97706]" />
                              <span className="capitalize">Todo</span>
                            </button>
                            <button
                              onClick={() => {
                                addNewPageClick('notes');
                                setShowAddMenu(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#F7F7F5] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <PageIcon type="notes" className="w-3.5 h-3.5 shrink-0 text-[#787774]" /> 
                              <span className="capitalize">Brain Dump / Notes</span>
                            </button>
                            <button
                              onClick={() => {
                                addNewPageClick('recap');
                                setShowAddMenu(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#F7F7F5] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <PageIcon type="recap" className="w-3.5 h-3.5 shrink-0 text-[#10B981]" /> 
                              <span className="capitalize">Activity Recap</span>
                            </button>
                            <button
                              onClick={() => {
                                addNewPageClick('whatsapp');
                                setShowAddMenu(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#F7F7F5] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <PageIcon type="whatsapp" className="w-3.5 h-3.5 shrink-0 text-[#16A34A]" /> 
                              <span className="capitalize">WhatsApp Bot Agent</span>
                            </button>
                            <button
                              onClick={() => {
                                addNewPageClick('blank');
                                setShowAddMenu(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-[#FDF2F8] flex items-center gap-2 cursor-pointer border-t border-[#F1F1F0] pt-2 mt-1 transition-colors group"
                            >
                              <PageIcon type="blank" className="w-3.5 h-3.5 shrink-0 text-[#EC4899] group-hover:scale-110 transition-transform" /> 
                              <span className="font-semibold text-[#EC4899]">{t('Halaman Kosong / Blank', 'Blank Page')}</span>
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div className="space-y-0.5 mt-1">
                  {regularPages.length === 0 ? (
                    <div className="px-2 py-3 text-center text-xs text-notion-gray italic">
                      {t('Tidak ada halaman. Buat baru!', 'No pages. Create one!')}
                    </div>
                  ) : (
                    regularPages.map((page) => (
                      <SidebarItem
                        key={page.id}
                        page={page}
                        currentPageId={currentPageId}
                        onSelectPage={onSelectPage}
                        onDeletePage={onDeletePage}
                        onToggleFavorite={onToggleFavorite}
                        onRequestDelete={handleRequestPageDelete}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-notion-border text-xs text-notion-gray flex flex-col gap-1.5 bg-neutral-50">
              <div className="flex items-center gap-2 text-neutral-600 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>{t('Catat Aja v1.2', 'LogIt v1.2')}</span>
              </div>
              <p className="text-[10px] text-notion-gray leading-tight">
                {t('Dilengkapi Kalender Pelacak, Grafik Produktivitas, dan Catatan Kreatif.', 'Equipped with Habit Tracker, Productivity Charts, and Creative Notes.')}
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Page Delete Custom Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmPageId && (
          <div className="fixed inset-0 bg-black/45 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg border border-[#EBEBEB] p-5 max-w-sm w-full shadow-xl space-y-4 text-xs font-sans text-[#37352F]"
            >
              <div className="flex items-start gap-3 text-left">
                <span className="p-2 bg-rose-50 text-rose-500 rounded-full shrink-0">
                  <Trash2 className="w-5 h-5" />
                </span>
                <div className="space-y-1">
                  <h3 className="font-bold text-[13px] text-[#37352F]">{t('Hapus Halaman?', 'Delete Page?')}</h3>
                  <p className="text-[#787774] leading-normal">
                    {t('Apakah Anda yakin ingin menghapus halaman', 'Are you sure you want to delete the page')} <strong className="text-[#37352F]">"{deleteConfirmPageTitle}"</strong>? {t('Tindakan ini akan menghapus seluruh isi catatan atau data di dalamnya secara permanen.', 'This will permanently delete all contents, notes, and records inside it.')}
                  </p>
                  <div className="text-[10px] text-emerald-800 bg-emerald-50/50 p-1.5 rounded border border-emerald-100 flex items-center gap-1.5 mt-1 font-medium select-none">
                    <span>💡 Tip:</span> {t('Tahan tombol', 'Hold')} <kbd className="font-mono bg-white border border-emerald-200/60 px-1 rounded shadow-3xs font-bold text-[9px] cursor-help">Shift</kbd> {t('saat klik ikon Hapus untuk menghapus langsung tanpa konfirmasi ini.', 'when clicking Delete to delete instantly without this confirmation.')}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 text-[11px] font-semibold pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmPageId(null)}
                  className="px-3.5 py-1.5 rounded border border-[#EBEBEB] text-[#37352F] hover:bg-[#F7F7F5] cursor-pointer transition-colors"
                >
                  {t('Batal', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeletePage(deleteConfirmPageId);
                    setDeleteConfirmPageId(null);
                  }}
                  className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors"
                >
                  {t('Hapus Halaman', 'Delete Page')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

interface SidebarItemProps {
  key?: string;
  page: Page;
  currentPageId: string;
  onSelectPage: (id: string) => void;
  onDeletePage: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRequestDelete: (id: string, title: string, shiftKey: boolean) => void;
}

function SidebarItem({
  page,
  currentPageId,
  onSelectPage,
  onDeletePage,
  onToggleFavorite,
  onRequestDelete,
}: SidebarItemProps) {
  const isSelected = page.id === currentPageId;

  return (
    <div
      onClick={() => onSelectPage(page.id)}
      className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-sm select-none transition-all ${
        isSelected 
          ? 'bg-[#EDEDED] text-[#37352F] font-semibold' 
          : 'text-[#37352F]/90 hover:bg-[#EBEBEB]'
      }`}
    >
      <div className="flex items-center gap-2 truncate flex-1 mr-2">
        <PageIcon 
          type={page.type} 
          className={`w-3.5 h-3.5 shrink-0 ${
            isSelected 
              ? 'text-[#0D7A5E]' 
              : 'text-[#787774] group-hover:text-[#37352F] transition-colors'
          }`} 
        />
        <span className="truncate">{page.title}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {/* Favorite Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(page.id);
          }}
          className={`p-0.5 rounded hover:bg-neutral-200 ${page.isFavorite ? 'text-amber-500' : 'text-neutral-400'}`}
          title={page.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          ★
        </button>
        {/* Delete button - with Shift-click support */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete(page.id, page.title, e.shiftKey);
          }}
          className="p-0.5 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
          title="Delete Page (Hold Shift to delete instantly)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
