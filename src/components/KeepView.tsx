import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Type, 
  CheckSquare, 
  Heading1, 
  Heading2, 
  List, 
  AlertCircle, 
  Quote, 
  Minus, 
  Palette, 
  X, 
  ArrowLeft, 
  Search, 
  Indent, 
  Outdent,
  Bold,
  Italic,
  Underline
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Block, Page, KeepNote } from '../types';

// Helpers for inline Rich Text
export const isHtmlEmpty = (html: string) => {
  if (!html) return true;
  const clean = html.replace(/<[^>]*>/g, '').trim();
  return clean === '';
};

export const formatBlockContent = (content: string) => {
  if (!content) return '';
  let html = content;
  // Convert markdown bold to HTML <b> for backward compatibility
  html = html.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  // Convert markdown italic to HTML <i> for backward compatibility
  html = html.replace(/\*([^*]+)\*/g, '<i>$1</i>');
  // Convert markdown underline to HTML <u> for backward compatibility
  html = html.replace(/__([^_]+)__/g, '<u>$1</u>');
  return html;
};

interface ContentEditableBlockProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

export const ContentEditableBlock: React.FC<ContentEditableBlockProps> = ({
  id,
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  placeholder,
  className
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      const currentHTML = ref.current.innerHTML;
      if (value === '' && (currentHTML === '<br>' || currentHTML === '<div><br></div>' || currentHTML === '<p><br></p>')) {
        return;
      }
      ref.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (ref.current) {
      let html = ref.current.innerHTML;
      if (html === '<br>' || html === '<div><br></div>' || html === '<p><br></p>') {
        html = '';
      }
      onChange(html);
    }
  };

  return (
    <div
      ref={ref}
      id={id}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`${className} outline-hidden focus:outline-hidden min-h-[1.5em] empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400 empty:before:pointer-events-none empty:before:opacity-60`}
      data-placeholder={placeholder}
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    />
  );
};

interface KeepViewProps {
  page: Page;
  onUpdateKeepNotes: (keepNotes: KeepNote[]) => void;
  pages: Page[];
}

// Preset pastel color definitions for Keep notes
const COLOR_PRESETS = [
  { id: 'default', bg: 'bg-white dark:bg-neutral-900', border: 'border-neutral-200 dark:border-neutral-800', name: 'Default', dot: 'bg-neutral-300 dark:bg-neutral-700' },
  { id: 'rose', bg: 'bg-rose-50/90 dark:bg-rose-950/25', border: 'border-rose-200 dark:border-rose-900/60', name: 'Coral', dot: 'bg-rose-400' },
  { id: 'amber', bg: 'bg-amber-50/90 dark:bg-amber-950/25', border: 'border-amber-200 dark:border-amber-900/60', name: 'Orange', dot: 'bg-amber-400' },
  { id: 'yellow', bg: 'bg-yellow-50/90 dark:bg-yellow-950/25', border: 'border-yellow-200 dark:border-yellow-900/60', name: 'Kuning', dot: 'bg-yellow-400' },
  { id: 'emerald', bg: 'bg-emerald-50/90 dark:bg-emerald-950/25', border: 'border-emerald-200 dark:border-emerald-900/60', name: 'Hijau', dot: 'bg-emerald-400' },
  { id: 'teal', bg: 'bg-teal-50/90 dark:bg-teal-950/25', border: 'border-teal-200 dark:border-teal-900/60', name: 'Teal', dot: 'bg-teal-400' },
  { id: 'sky', bg: 'bg-sky-50/90 dark:bg-sky-950/25', border: 'border-sky-200 dark:border-sky-900/60', name: 'Biru', dot: 'bg-sky-400' },
  { id: 'indigo', bg: 'bg-indigo-50/90 dark:bg-indigo-950/25', border: 'border-indigo-200 dark:border-indigo-900/60', name: 'Ungu', dot: 'bg-indigo-400' },
  { id: 'pink', bg: 'bg-fuchsia-50/90 dark:bg-fuchsia-950/25', border: 'border-fuchsia-200 dark:border-fuchsia-900/60', name: 'Pink', dot: 'bg-fuchsia-400' },
];

export default function KeepView({ page, onUpdateKeepNotes, pages }: KeepViewProps) {
  const notes = page.keepNotes || [];

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Quick note creation bar state
  const [isCreating, setIsCreating] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickBlocks, setQuickBlocks] = useState<Block[]>([]);
  const [quickColor, setQuickColor] = useState('default');
  const [quickIsPinned, setQuickIsPinned] = useState(false);
  const [showQuickColorPicker, setShowQuickColorPicker] = useState(false);

  // Active editor state (enlarged note)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<KeepNote | null>(null);
  const [deleteConfirmNoteId, setDeleteConfirmNoteId] = useState<string | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const lastKeepSelectionRef = useRef<{ start: number; end: number; blockId: string | null }>({ start: 0, end: 0, blockId: null });
  const [pendingFocusBlockId, setPendingFocusBlockId] = useState<string | null>(null);
  const [activeToolbarPanel, setActiveToolbarPanel] = useState<'type-changer' | 'add-line' | null>(null);
  const [showEditColorPicker, setShowEditColorPicker] = useState(false);

  // Mobile viewport detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Autofocus newly created block
  useEffect(() => {
    if (pendingFocusBlockId && editingNote) {
      setTimeout(() => {
        const input = document.getElementById(`keep-input-${pendingFocusBlockId}`) as HTMLElement | null;
        if (input) {
          input.focus();
          // Move selection to end of contentEditable div
          if (typeof window.getSelection !== 'undefined' && typeof document.createRange !== 'undefined') {
            const range = document.createRange();
            range.selectNodeContents(input);
            range.collapse(false);
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }
      }, 50);
      setPendingFocusBlockId(null);
    }
  }, [pendingFocusBlockId, editingNote]);

  // Language helper
  const getAppLanguage = (): 'id' | 'en' => {
    try {
      const raw = localStorage.getItem('nt_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.language) {
          return parsed.language;
        }
      }
    } catch (e) {}
    return 'en';
  };
  const isId = getAppLanguage() === 'id';
  const t = (idText: string, enText: string) => (isId ? idText : enText);

  // Filtered lists
  const filteredNotes = notes.filter(n => {
    const titleMatch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
    const blockMatch = (n.blocks || []).some(b => b.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return titleMatch || blockMatch;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  // Quick note actions
  const startQuickNote = (type: 'text' | 'checklist') => {
    setIsCreating(true);
    setQuickTitle('');
    setQuickColor('default');
    setQuickIsPinned(false);
    if (type === 'checklist') {
      setQuickBlocks([{ id: `q-${Date.now()}`, type: 'todo', content: '', isCompleted: false }]);
    } else {
      setQuickBlocks([{ id: `q-${Date.now()}`, type: 'paragraph', content: '' }]);
    }
  };

  const handleQuickAddBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: `qb-${Date.now()}`,
      type,
      content: '',
      isCompleted: false
    };
    setQuickBlocks([...quickBlocks, newBlock]);
  };

  const handleQuickBlockChange = (id: string, content: string, isCompleted?: boolean) => {
    setQuickBlocks(quickBlocks.map(b => b.id === id ? { ...b, content, isCompleted } as Block : b));
  };

  const handleQuickBlockDelete = (id: string) => {
    if (quickBlocks.length <= 1) return;
    setQuickBlocks(quickBlocks.filter(b => b.id !== id));
  };

  const saveQuickNote = () => {
    // If empty title and blocks, do nothing
    const hasContent = quickTitle.trim().length > 0 || quickBlocks.some(b => b.content.trim().length > 0);
    if (!hasContent) {
      setIsCreating(false);
      return;
    }

    const newNote: KeepNote = {
      id: `kn-${Date.now()}`,
      title: quickTitle.trim() || t('Catatan Tanpa Judul', 'Untitled Note'),
      blocks: quickBlocks.filter(b => b.content.trim().length > 0 || b.type === 'divider'),
      isPinned: quickIsPinned,
      color: quickColor,
      createdAt: new Date().toISOString()
    };

    if (newNote.blocks.length === 0) {
      newNote.blocks = [{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }];
    }

    onUpdateKeepNotes([newNote, ...notes]);
    setIsCreating(false);
    setQuickTitle('');
    setQuickBlocks([]);
    setQuickColor('default');
    setQuickIsPinned(false);
  };

  // Editing actions
  const openNoteEditor = (note: KeepNote) => {
    setEditingNoteId(note.id);
    setEditingNote(JSON.parse(JSON.stringify(note))); // deep copy
    setFocusedBlockId(null);
    setActiveToolbarPanel(null);
  };

  const saveEditingNote = () => {
    if (!editingNote) return;
    
    const updatedNotes = notes.map(n => n.id === editingNote.id ? editingNote : n);
    onUpdateKeepNotes(updatedNotes);
    setEditingNoteId(null);
    setEditingNote(null);
  };

  const deleteNote = (noteId: string, bypassConfirm: boolean = false) => {
    if (bypassConfirm) {
      onUpdateKeepNotes(notes.filter(n => n.id !== noteId));
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
        setEditingNote(null);
      }
      setDeleteConfirmNoteId(null);
    } else {
      setDeleteConfirmNoteId(noteId);
    }
  };

  const togglePinNote = (noteId: string) => {
    const updated = notes.map(n => n.id === noteId ? { ...n, isPinned: !n.isPinned } : n);
    onUpdateKeepNotes(updated);
    if (editingNote && editingNote.id === noteId) {
      setEditingNote({ ...editingNote, isPinned: !editingNote.isPinned });
    }
  };

  const setNoteColor = (noteId: string, color: string) => {
    const updated = notes.map(n => n.id === noteId ? { ...n, color } : n);
    onUpdateKeepNotes(updated);
    if (editingNote && editingNote.id === noteId) {
      setEditingNote({ ...editingNote, color });
    }
  };

  // Block manipulations within editingNote
  const editBlockChange = (id: string, updatedFields: Partial<Block>) => {
    if (!editingNote) return;
    const updatedBlocks = editingNote.blocks.map(b => b.id === id ? { ...b, ...updatedFields } as Block : b);
    setEditingNote({ ...editingNote, blocks: updatedBlocks });
  };

  const applyTextFormattingToBlock = (formatType: 'bold' | 'italic' | 'underline') => {
    document.execCommand(formatType, false);
  };

  const editBlockAddBelow = (type: Block['type'], focusBlockId: string) => {
    if (!editingNote) return;
    const index = editingNote.blocks.findIndex(b => b.id === focusBlockId);
    if (index === -1) return;

    const newBlockId = `blk-${Date.now()}`;
    const newBlock: Block = {
      id: newBlockId,
      type,
      content: '',
      isCompleted: false
    };

    const updatedBlocks = [...editingNote.blocks];
    updatedBlocks.splice(index + 1, 0, newBlock);

    setEditingNote({ ...editingNote, blocks: updatedBlocks });
    setFocusedBlockId(newBlockId);
    setPendingFocusBlockId(newBlockId);
  };

  const editBlockDelete = (id: string) => {
    if (!editingNote) return;
    if (editingNote.blocks.length <= 1) return; // Keep at least one block

    const index = editingNote.blocks.findIndex(b => b.id === id);
    const updatedBlocks = editingNote.blocks.filter(b => b.id !== id);
    
    setEditingNote({ ...editingNote, blocks: updatedBlocks });
    
    // Move focus to another block
    const newFocusIndex = Math.max(0, index - 1);
    const nextFocusedBlock = updatedBlocks[newFocusIndex];
    if (nextFocusedBlock) {
      setFocusedBlockId(nextFocusedBlock.id);
      setPendingFocusBlockId(nextFocusedBlock.id);
    } else {
      setFocusedBlockId(null);
    }
  };

  const editBlockMoveUp = (id: string) => {
    if (!editingNote) return;
    const index = editingNote.blocks.findIndex(b => b.id === id);
    if (index > 0) {
      const updatedBlocks = [...editingNote.blocks];
      const [block] = updatedBlocks.splice(index, 1);
      updatedBlocks.splice(index - 1, 0, block);
      setEditingNote({ ...editingNote, blocks: updatedBlocks });
    }
  };

  const editBlockMoveDown = (id: string) => {
    if (!editingNote) return;
    const index = editingNote.blocks.findIndex(b => b.id === id);
    if (index !== -1 && index < editingNote.blocks.length - 1) {
      const updatedBlocks = [...editingNote.blocks];
      const [block] = updatedBlocks.splice(index, 1);
      updatedBlocks.splice(index + 1, 0, block);
      setEditingNote({ ...editingNote, blocks: updatedBlocks });
    }
  };

  const editBlockIndentRight = (id: string) => {
    if (!editingNote) return;
    const updatedBlocks = editingNote.blocks.map(b => {
      if (b.id === id) {
        const currentIndent = b.indent ?? 0;
        return { ...b, indent: Math.min(currentIndent + 1, 5) };
      }
      return b;
    });
    setEditingNote({ ...editingNote, blocks: updatedBlocks });
  };

  const editBlockIndentLeft = (id: string) => {
    if (!editingNote) return;
    const updatedBlocks = editingNote.blocks.map(b => {
      if (b.id === id) {
        const currentIndent = b.indent ?? 0;
        return { ...b, indent: Math.max(currentIndent - 1, 0) };
      }
      return b;
    });
    setEditingNote({ ...editingNote, blocks: updatedBlocks });
  };

  const editBlockChangeType = (id: string, type: Block['type']) => {
    if (!editingNote) return;
    const updatedBlocks = editingNote.blocks.map(b => {
      if (b.id === id) {
        return {
          ...b,
          type,
          icon: type === 'callout' ? (b.icon || '💡') : undefined
        } as Block;
      }
      return b;
    });
    setEditingNote({ ...editingNote, blocks: updatedBlocks });
  };

  return (
    <div className="keep-workspace max-w-6xl mx-auto px-4 py-6 min-h-screen pb-32">
      
      {/* 1. TOP SEARCH & QUICK ENTRY AREA */}
      <div className="flex flex-col items-center gap-6 mb-8">
        
        {/* Search Input */}
        <div className="w-full max-w-lg relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder={t('Cari catatan...', 'Search notes...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 shadow-3xs outline-none focus:border-[#337EA9] dark:focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Note Entry Bar */}
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {!isCreating ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => startQuickNote('text')}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 shadow-3xs hover:shadow-2xs cursor-pointer flex items-center justify-between transition-shadow select-none"
              >
                <span className="text-neutral-400 dark:text-neutral-500 text-sm font-medium">
                  {t('Buat catatan...', 'Take a note...')}
                </span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => startQuickNote('checklist')}
                    className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title={t('Buat Daftar Centang', 'New List')}
                  >
                    <CheckSquare className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </button>
                  <button
                    onClick={() => startQuickNote('text')}
                    className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title={t('Buat Catatan Teks', 'New Text Note')}
                  >
                    <Type className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`w-full border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-md transition-colors flex flex-col gap-3 ${
                  quickColor !== 'default' 
                    ? COLOR_PRESETS.find(c => c.id === quickColor)?.bg 
                    : 'bg-white dark:bg-neutral-900'
                }`}
              >
                {/* Title & Pin Header */}
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder={t('Judul', 'Title')}
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="flex-1 bg-transparent border-none text-base font-bold text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setQuickIsPinned(!quickIsPinned)}
                    className={`p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
                      quickIsPinned ? 'text-amber-500' : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    ★
                  </button>
                </div>

                {/* Blocks Content inside Quick Note */}
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {quickBlocks.map((block, idx) => (
                    <div key={block.id} className="flex items-center gap-1.5 group">
                      {block.type === 'todo' ? (
                        <input
                          type="checkbox"
                          checked={block.isCompleted || false}
                          onChange={(e) => handleQuickBlockChange(block.id, block.content, e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-[#337EA9] focus:ring-[#337EA9] cursor-pointer shrink-0"
                        />
                      ) : (
                        <span className="text-neutral-400 text-xs select-none shrink-0">•</span>
                      )}
                      
                      <ContentEditableBlock
                        id={`quick-blk-input-${block.id}`}
                        value={block.content}
                        onChange={(val) => handleQuickBlockChange(block.id, val, block.isCompleted)}
                        placeholder={block.type === 'todo' ? t('Item daftar', 'List item') : t('Catatan', 'Note')}
                        className="flex-1 bg-transparent border-none text-sm text-neutral-700 dark:text-neutral-200 outline-hidden py-0.5"
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                            e.preventDefault();
                            document.execCommand('bold', false);
                          } else if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
                            e.preventDefault();
                            document.execCommand('italic', false);
                          } else if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
                            e.preventDefault();
                            document.execCommand('underline', false);
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickAddBlock(block.type);
                          } else if (e.key === 'Backspace' && isHtmlEmpty(block.content)) {
                            e.preventDefault();
                            handleQuickBlockDelete(block.id);
                          }
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => handleQuickBlockDelete(block.id)}
                        disabled={quickBlocks.length <= 1}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-0 text-neutral-400 hover:text-neutral-600 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Note bottom controls */}
                <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/60 pt-2.5 mt-1">
                  <div className="flex items-center gap-1.5 relative">
                    <button
                      type="button"
                      onClick={() => setShowQuickColorPicker(!showQuickColorPicker)}
                      className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer"
                      title={t('Ubah Warna', 'Change Color')}
                    >
                      <Palette className="w-4 h-4" />
                    </button>

                    {showQuickColorPicker && (
                      <div className="absolute left-0 bottom-8 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-1.5 flex gap-1 items-center">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setQuickColor(preset.id);
                              setShowQuickColorPicker(false);
                            }}
                            className={`w-5 h-5 rounded-full ${preset.bg} border ${
                              quickColor === preset.id ? 'border-neutral-800 dark:border-neutral-100 ring-2 ring-blue-500/30' : 'border-neutral-200 dark:border-neutral-600'
                            } cursor-pointer transition-transform hover:scale-110 flex items-center justify-center`}
                            title={preset.name}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${preset.dot}`} />
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleQuickAddBlock('todo')}
                      className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('Daftar', 'List')}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                    >
                      {t('Tutup', 'Close')}
                    </button>
                    <button
                      type="button"
                      onClick={saveQuickNote}
                      className="px-4 py-1.5 text-xs font-bold bg-[#337EA9] hover:bg-[#286080] text-white rounded-lg cursor-pointer transition-colors"
                    >
                      {t('Selesai', 'Done')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. MAIN KEEP NOTES GRID (Masonry / Responsive layout) */}
      <div className="space-y-8">
        
        {/* Pinned section */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1">
              {t('DISEMATKAN', 'PINNED')}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedNotes.map((note) => (
                <KeepNoteCard
                  key={note.id}
                  note={note}
                  onClick={() => openNoteEditor(note)}
                  onTogglePin={() => togglePinNote(note.id)}
                  onDelete={(e) => deleteNote(note.id, e?.shiftKey)}
                  onColorChange={(color) => setNoteColor(note.id, color)}
                  t={t}
                />
              ))}
            </div>
          </div>
        )}

        {/* Others section */}
        <div className="space-y-3">
          {pinnedNotes.length > 0 && otherNotes.length > 0 && (
            <h3 className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-1 pt-2">
              {t('LAINNYA', 'OTHERS')}
            </h3>
          )}

          {otherNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {otherNotes.map((note) => (
                <KeepNoteCard
                  key={note.id}
                  note={note}
                  onClick={() => openNoteEditor(note)}
                  onTogglePin={() => togglePinNote(note.id)}
                  onDelete={(e) => deleteNote(note.id, e?.shiftKey)}
                  onColorChange={(color) => setNoteColor(note.id, color)}
                  t={t}
                />
              ))}
            </div>
          ) : (
            pinnedNotes.length === 0 && (
              <div className="text-center py-16 text-neutral-400 dark:text-neutral-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t('Belum ada catatan Keep. Buat baru di atas!', 'No Keep notes yet. Take one above!')}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* 3. EXPANDED NOTE EDITOR (Mobile: Full Screen, Desktop: Dialog Overlay) */}
      <AnimatePresence>
        {editingNoteId && editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-neutral-900/40 dark:bg-neutral-950/60 backdrop-blur-3xs">
            {/* Click backdrop to close on desktop */}
            {!isMobile && (
              <div className="absolute inset-0 cursor-default" onClick={saveEditingNote} />
            )}

            <motion.div
              initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
              animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
              exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className={`w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200/50 dark:border-neutral-800/80 ${
                editingNote.color && editingNote.color !== 'default' 
                  ? COLOR_PRESETS.find(c => c.id === editingNote.color)?.bg 
                  : 'bg-white dark:bg-neutral-900'
              }`}
            >
              {/* Note Editor Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800/60 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveEditingNote}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest hidden sm:inline">
                    {t('Edit Catatan Keep', 'Edit Keep Note')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 relative">
                  {/* Pin Toggle */}
                  <button
                    onClick={() => setEditingNote({ ...editingNote, isPinned: !editingNote.isPinned })}
                    className={`p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                      editingNote.isPinned ? 'text-amber-500' : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                    title={t('Sematkan Catatan', 'Pin Note')}
                  >
                    ★
                  </button>

                  {/* Render Simpan button on mobile header */}
                  {isMobile && (
                    <button
                      onClick={saveEditingNote}
                      className="ml-2 px-3.5 py-1.5 bg-[#337EA9] hover:bg-[#286080] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {t('Simpan', 'Save')}
                    </button>
                  )}
                </div>
              </div>

              {/* Editor Content Area (Scrollable blocks) */}
              <div 
                className={`flex-1 overflow-y-auto px-6 py-4 space-y-4 ${isMobile ? 'pb-48' : 'pb-6'}`}
                onClick={(e) => {
                  // If clicking the empty space in editor, clear block focus
                  if (e.target === e.currentTarget) {
                    setFocusedBlockId(null);
                  }
                }}
              >
                {/* Editable Title */}
                <input
                  type="text"
                  placeholder={t('Judul Catatan', 'Note Title')}
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full text-xl font-extrabold bg-transparent border-none text-neutral-800 dark:text-neutral-100 placeholder-neutral-300 dark:placeholder-neutral-600 focus:outline-none py-1"
                />

                {/* Blocks list (Nested BlockEditor engine specifically optimized for Keep) */}
                <div className="space-y-1 mt-2">
                  {editingNote.blocks.map((block, index) => {
                    const isTodo = block.type === 'todo';
                    const isBullet = block.type === 'bullet';
                    const isHeading1 = block.type === 'h1';
                    const isHeading2 = block.type === 'h2';
                    const isQuote = block.type === 'quote';
                    const isCallout = block.type === 'callout';
                    const isDivider = block.type === 'divider';

                    return (
                      <div
                        key={block.id}
                        id={`keep-wrapper-${block.id}`}
                        onClick={() => setFocusedBlockId(block.id)}
                        onFocusCapture={() => setFocusedBlockId(block.id)}
                        className={`group relative flex flex-col px-1.5 py-1 rounded-lg hover:bg-neutral-800/5 transition-colors ${
                          focusedBlockId === block.id ? 'bg-neutral-800/5 dark:bg-white/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-1.5">
                          {/* Indicator Column / Gutter */}
                          <div className="flex items-center shrink-0 w-6 justify-center pt-1.5 select-none text-neutral-400">
                            {isTodo && (
                              <input
                                type="checkbox"
                                checked={block.isCompleted || false}
                                onChange={(e) => editBlockChange(block.id, { isCompleted: e.target.checked })}
                                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-[#337EA9] focus:ring-[#337EA9] cursor-pointer"
                              />
                            )}
                            {isBullet && <span className="text-base font-bold">•</span>}
                            {isHeading1 && <span className="text-xs font-bold text-neutral-300 dark:text-neutral-600">H1</span>}
                            {isHeading2 && <span className="text-xs font-bold text-neutral-300 dark:text-neutral-600">H2</span>}
                            {isQuote && <span className="text-lg font-bold">“</span>}
                            {isCallout && <span className="text-sm">{block.icon || '💡'}</span>}
                            {!isTodo && !isBullet && !isHeading1 && !isHeading2 && !isQuote && !isCallout && !isDivider && (
                              <span className="text-xs opacity-0">•</span>
                            )}
                          </div>

                          {/* Editable Main Block Column */}
                          <div 
                            className="flex-1 min-w-0"
                            style={{ paddingLeft: block.indent ? `${block.indent * 16}px` : undefined }}
                          >
                            {isDivider ? (
                              <div className="py-2 cursor-pointer" onClick={() => editBlockDelete(block.id)}>
                                <hr className="border-t border-neutral-300 dark:border-neutral-700" />
                              </div>
                            ) : (
                              <ContentEditableBlock
                                id={`keep-input-${block.id}`}
                                value={block.content}
                                onChange={(val) => editBlockChange(block.id, { content: val })}
                                onKeyDown={(e) => {
                                  if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
                                    e.preventDefault();
                                    applyTextFormattingToBlock('bold');
                                  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
                                    e.preventDefault();
                                    applyTextFormattingToBlock('italic');
                                  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
                                    e.preventDefault();
                                    applyTextFormattingToBlock('underline');
                                  } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    editBlockAddBelow(block.type, block.id);
                                  } else if (e.key === 'Backspace' && isHtmlEmpty(block.content)) {
                                    e.preventDefault();
                                    editBlockDelete(block.id);
                                  }
                                }}
                                placeholder={
                                  isHeading1 ? t('Judul Utama', 'Heading 1') :
                                  isHeading2 ? t('Subjudul', 'Heading 2') :
                                  isQuote ? t('Kutipan', 'Quote') :
                                  isCallout ? t('Info Callout', 'Callout Box') :
                                  isTodo ? t('Daftar Tugas', 'List item') :
                                  t('Ketik di sini...', 'Type here...')
                                }
                                className={`w-full bg-transparent border-none outline-hidden py-1 leading-relaxed text-neutral-800 dark:text-neutral-100 ${
                                  isHeading1 ? 'text-lg font-bold' :
                                  isHeading2 ? 'text-base font-semibold' :
                                  isQuote ? 'italic border-l-2 border-[#337EA9] pl-3 text-neutral-600 dark:text-neutral-400' :
                                  isCallout ? 'bg-neutral-50 dark:bg-neutral-850 px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800' :
                                  'text-sm'
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3.5 STATIC DESKTOP BOTTOM TOOLBAR FOOTER */}
              {!isMobile && (
                <div className="border-t border-neutral-150 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-900/50 px-4 py-2.5 flex items-center justify-between shrink-0 select-none relative">
                  <div className="flex items-center gap-1.5">
                    {/* 1. Format text / Change block type */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveToolbarPanel(activeToolbarPanel === 'type-changer' ? null : 'type-changer');
                        }}
                        className={`p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center ${
                          activeToolbarPanel === 'type-changer' ? 'bg-neutral-200/80 dark:bg-neutral-800' : ''
                        }`}
                        title="text formater"
                      >
                        <Type className="w-4.5 h-4.5" />
                      </button>
                      
                      {activeToolbarPanel === 'type-changer' && (
                        <div className="absolute left-0 bottom-11 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-1.5 flex flex-row items-center gap-1 min-w-[340px] select-none">
                          {[
                            { type: 'paragraph', icon: <Type className="w-3.5 h-3.5 text-neutral-500" />, label: t('Paragraf', 'Paragraph') },
                            { type: 'todo', icon: <CheckSquare className="w-3.5 h-3.5 text-blue-500" />, label: t('Tugas (To-Do)', 'To-Do List') },
                            { type: 'h1', icon: <Heading1 className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200 font-bold" />, label: t('Judul Utama', 'Heading 1') },
                            { type: 'h2', icon: <Heading2 className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300 font-bold" />, label: t('Subjudul', 'Heading 2') },
                            { type: 'bullet', icon: <List className="w-3.5 h-3.5 text-amber-600" />, label: t('Poin Bulatan', 'Bullet List') },
                          ].map((item) => {
                            const activeBlock = editingNote.blocks.find(b => b.id === focusedBlockId);
                            const isCurrent = activeBlock?.type === item.type;
                            return (
                              <button
                                key={item.type}
                                type="button"
                                onClick={() => {
                                  if (focusedBlockId) {
                                    editBlockChangeType(focusedBlockId, item.type as any);
                                  } else if (editingNote.blocks.length > 0) {
                                    editBlockChangeType(editingNote.blocks[editingNote.blocks.length - 1].id, item.type as any);
                                  }
                                  setActiveToolbarPanel(null);
                                }}
                                className={`p-1.5 rounded-md transition-all cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-750 flex items-center justify-center shrink-0 ${
                                  isCurrent ? 'bg-[#337EA9]/10 text-[#337EA9]' : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                                title={item.label}
                              >
                                {item.icon}
                              </button>
                            );
                          })}

                          {/* Divider line before text formats */}
                          <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-750 mx-1 shrink-0" />

                          {/* Bold, Italic, Underline buttons */}
                          <button
                            type="button"
                            onClick={() => applyTextFormattingToBlock('bold')}
                            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-750 rounded-md transition duration-150 cursor-pointer flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shrink-0"
                            title="Bold"
                          >
                            <Bold className="w-3.5 h-3.5 font-bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTextFormattingToBlock('italic')}
                            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-750 rounded-md transition duration-150 cursor-pointer flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shrink-0"
                            title="Italic"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTextFormattingToBlock('underline')}
                            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-750 rounded-md transition duration-150 cursor-pointer flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shrink-0"
                            title="Underline"
                          >
                            <Underline className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 2. Color Picker */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEditColorPicker(!showEditColorPicker)}
                        className={`p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center ${
                          showEditColorPicker ? 'bg-neutral-200/80 dark:bg-neutral-800' : ''
                        }`}
                        title={t('Ubah Warna', 'Change Color')}
                      >
                        <Palette className="w-4.5 h-4.5" />
                      </button>

                      {showEditColorPicker && (
                        <div className="absolute left-0 bottom-11 z-50 bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-1.5 flex gap-1 items-center">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                setEditingNote({ ...editingNote, color: preset.id });
                                setShowEditColorPicker(false);
                              }}
                              className={`w-5.5 h-5.5 rounded-full ${preset.bg} border ${
                                editingNote.color === preset.id ? 'border-neutral-800 dark:border-neutral-100 ring-2 ring-blue-500/30' : 'border-neutral-200 dark:border-neutral-600'
                              } cursor-pointer transition-transform hover:scale-110 flex items-center justify-center`}
                              title={preset.name}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${preset.dot}`} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. Delete Note Button */}
                    <button
                      type="button"
                      onClick={(e) => deleteNote(editingNote.id, e.shiftKey)}
                      className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 transition-colors cursor-pointer flex items-center justify-center"
                      title={t('Hapus Catatan', 'Delete Note')}
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>

                    <div className="h-5 w-[1px] bg-neutral-250 dark:bg-neutral-850 mx-1" />

                    {/* Block Action Group - Enabled when focusedBlockId is present */}
                    <div className="flex items-center gap-1">
                      {/* Indent Left */}
                      <button
                        type="button"
                        onClick={() => focusedBlockId && editBlockIndentLeft(focusedBlockId)}
                        disabled={!focusedBlockId}
                        className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center"
                        title={t('Kurangi Indentasi', 'Indent Left')}
                      >
                        <Outdent className="w-4.5 h-4.5" />
                      </button>

                      {/* Indent Right */}
                      <button
                        type="button"
                        onClick={() => focusedBlockId && editBlockIndentRight(focusedBlockId)}
                        disabled={!focusedBlockId}
                        className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center"
                        title={t('Tambah Indentasi', 'Indent Right')}
                      >
                        <Indent className="w-4.5 h-4.5" />
                      </button>

                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => focusedBlockId && editBlockMoveUp(focusedBlockId)}
                        disabled={!focusedBlockId || editingNote.blocks.findIndex(b => b.id === focusedBlockId) === 0}
                        className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center"
                        title={t('Pindahkan ke Atas', 'Move Up')}
                      >
                        <ChevronUp className="w-4.5 h-4.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => focusedBlockId && editBlockMoveDown(focusedBlockId)}
                        disabled={!focusedBlockId || editingNote.blocks.findIndex(b => b.id === focusedBlockId) === editingNote.blocks.length - 1}
                        className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center"
                        title={t('Pindahkan ke Bawah', 'Move Down')}
                      >
                        <ChevronDown className="w-4.5 h-4.5" />
                      </button>

                      {/* Add line below */}
                      <button
                        type="button"
                        onClick={() => {
                          if (focusedBlockId) {
                            editBlockAddBelow('paragraph', focusedBlockId);
                          } else if (editingNote.blocks.length > 0) {
                            editBlockAddBelow('paragraph', editingNote.blocks[editingNote.blocks.length - 1].id);
                          }
                        }}
                        className="p-2 rounded-lg text-[#337EA9] hover:bg-[#337EA9]/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                        title={t('Tambah Baris Baru', 'Add Line Below')}
                      >
                        <Plus className="w-4.5 h-4.5" />
                      </button>

                      {/* Delete block */}
                      <button
                        type="button"
                        onClick={() => focusedBlockId && editBlockDelete(focusedBlockId)}
                        disabled={!focusedBlockId || editingNote.blocks.length <= 1}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center"
                        title={t('Hapus Blok', 'Delete Block')}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Close / "Tutup" button on the right */}
                  <button
                    type="button"
                    onClick={saveEditingNote}
                    className="px-5 py-2 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    {t('Tutup', 'Close')}
                  </button>
                </div>
              )}

              {/* 3.6 STATIC MOBILE BOTTOM TOOLBAR FOOTER */}
              {isMobile && !focusedBlockId && (
                <div className="border-t border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/70 dark:bg-neutral-900/50 px-4 py-3.5 flex items-center justify-around shrink-0 select-none relative">
                  {/* 1. Format text / Focus first block */}
                  <button
                    type="button"
                    onClick={() => {
                      if (editingNote.blocks.length > 0) {
                        setFocusedBlockId(editingNote.blocks[0].id);
                      }
                    }}
                    className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center"
                    title={t('Format Teks', 'Format Text')}
                  >
                    <Type className="w-5 h-5" />
                  </button>

                  {/* 2. Color Picker */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEditColorPicker(!showEditColorPicker)}
                      className={`p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center ${
                        showEditColorPicker ? 'bg-neutral-200/80 dark:bg-neutral-800' : ''
                      }`}
                      title={t('Ubah Warna', 'Change Color')}
                    >
                      <Palette className="w-5 h-5" />
                    </button>

                    {showEditColorPicker && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-12 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg p-1.5 flex gap-1 items-center">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setEditingNote({ ...editingNote, color: preset.id });
                              setShowEditColorPicker(false);
                            }}
                            className={`w-5.5 h-5.5 rounded-full ${preset.bg} border ${
                              editingNote.color === preset.id ? 'border-neutral-800 dark:border-neutral-100 ring-2 ring-blue-500/30' : 'border-neutral-200 dark:border-neutral-600'
                            } cursor-pointer transition-transform hover:scale-110 flex items-center justify-center`}
                            title={preset.name}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${preset.dot}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Delete Note Button */}
                  <button
                    type="button"
                    onClick={(e) => deleteNote(editingNote.id, e.shiftKey)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer flex items-center justify-center"
                    title={t('Hapus Catatan', 'Delete Note')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* 4. KEYBOARD-REPLACEMENT TEXT EDITOR TOOLBAR (At bottom of card overlay - MOBILE ONLY) */}
              <AnimatePresence>
                {isMobile && focusedBlockId && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="absolute bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] px-3 py-2 flex flex-col gap-2 pb-5"
                  >
                    {activeToolbarPanel ? (
                      /* Toolbar Sub-panel (Grid layout identical to standard Block Editor) */
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-2 pb-1 border-b border-neutral-100 dark:border-neutral-800">
                          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                            {activeToolbarPanel === 'type-changer' 
                              ? t('Ubah Jenis & Format', 'Convert & Format Block') 
                              : t('Tambah Blok di Bawah', 'Insert Block Below')}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setActiveToolbarPanel(null)} 
                            className="px-2 py-0.5 text-xs text-[#337EA9] hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded font-bold cursor-pointer transition-colors"
                          >
                            {t('Batal', 'Cancel')}
                          </button>
                        </div>

                        {activeToolbarPanel === 'type-changer' && (
                          <div className="flex items-center gap-1.5 px-1 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                            <button
                              type="button"
                              onClick={() => {
                                applyTextFormattingToBlock('bold');
                                setActiveToolbarPanel(null);
                              }}
                              className="flex-1 py-2 px-3 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer border border-neutral-200/50 dark:border-neutral-800"
                            >
                              <Bold className="w-3.5 h-3.5 font-bold" />
                              <span>{t('Tebal', 'Bold')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                applyTextFormattingToBlock('italic');
                                setActiveToolbarPanel(null);
                              }}
                              className="flex-1 py-2 px-3 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg flex items-center justify-center gap-1.5 text-xs italic text-neutral-700 dark:text-neutral-300 cursor-pointer border border-neutral-200/50 dark:border-neutral-800"
                            >
                              <Italic className="w-3.5 h-3.5" />
                              <span>{t('Miring', 'Italic')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                applyTextFormattingToBlock('underline');
                                setActiveToolbarPanel(null);
                              }}
                              className="flex-1 py-2 px-3 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg flex items-center justify-center gap-1.5 text-xs underline text-neutral-700 dark:text-neutral-300 cursor-pointer border border-neutral-200/50 dark:border-neutral-800"
                            >
                              <Underline className="w-3.5 h-3.5" />
                              <span>{t('Garis', 'Underline')}</span>
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-1.5 p-1">
                          {[
                            { type: 'paragraph', icon: <Type className="w-4 h-4 text-neutral-500" />, label: t('Paragraf', 'Paragraph') },
                            { type: 'todo', icon: <CheckSquare className="w-4 h-4 text-blue-500" />, label: t('Tugas (To-Do)', 'Tugas (To-Do)') },
                            { type: 'h1', icon: <Heading1 className="w-4 h-4 text-neutral-800 dark:text-neutral-200 font-bold" />, label: t('Judul Utama', 'Judul Utama') },
                            { type: 'h2', icon: <Heading2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300 font-bold" />, label: t('Subjudul', 'Subjudul') },
                            { type: 'bullet', icon: <List className="w-4 h-4 text-amber-600" />, label: t('Poin Bulatan', 'Poin Bulatan') },
                          ].map((item) => {
                            const activeBlock = editingNote.blocks.find(b => b.id === focusedBlockId);
                            const isCurrent = activeBlock?.type === item.type;
                            return (
                              <button
                                key={item.type}
                                type="button"
                                onClick={() => {
                                  if (activeToolbarPanel === 'type-changer') {
                                    editBlockChangeType(focusedBlockId, item.type as any);
                                  } else {
                                    editBlockAddBelow(item.type as any, focusedBlockId);
                                  }
                                  setActiveToolbarPanel(null);
                                }}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                                  activeToolbarPanel === 'type-changer' && isCurrent
                                    ? 'bg-[#337EA9]/10 text-[#337EA9] border-[#337EA9]/30 font-bold'
                                    : 'bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-100 dark:border-neutral-800'
                                }`}
                              >
                                {item.icon}
                                <span className="truncate">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Icon-Only Custom Toolbar Row (Exact same 6 working tools requested) */
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 px-2 bg-neutral-50 dark:bg-neutral-900 w-full rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        
                        {/* 1. Text Format Panel Trigger */}
                        <button
                          type="button"
                          onClick={() => setActiveToolbarPanel('type-changer')}
                          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title={t('Ubah Format Blok', 'Block Format')}
                        >
                          <Type className="w-5 h-5" />
                        </button>

                        <div className="h-5 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1 shrink-0" />

                        {/* 5. Indentation Move Left */}
                        <button
                          type="button"
                          onClick={() => editBlockIndentLeft(focusedBlockId)}
                          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title={t('Kurangi Indentasi', 'Indent Left')}
                        >
                          <Outdent className="w-5 h-5" />
                        </button>

                        {/* 6. Indentation Move Right */}
                        <button
                          type="button"
                          onClick={() => editBlockIndentRight(focusedBlockId)}
                          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title={t('Tambah Indentasi', 'Indent Right')}
                        >
                          <Indent className="w-5 h-5" />
                        </button>

                        <div className="h-5 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1 shrink-0" />

                        {/* 3. Move Up */}
                        <button
                          type="button"
                          onClick={() => editBlockMoveUp(focusedBlockId)}
                          disabled={editingNote.blocks.findIndex(b => b.id === focusedBlockId) === 0}
                          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title={t('Pindahkan ke Atas', 'Move Up')}
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>

                        {/* 2. Move Down */}
                        <button
                          type="button"
                          onClick={() => editBlockMoveDown(focusedBlockId)}
                          disabled={editingNote.blocks.findIndex(b => b.id === focusedBlockId) === editingNote.blocks.length - 1}
                          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title={t('Pindahkan ke Bawah', 'Move Down')}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>

                        <div className="h-5 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1 shrink-0" />

                        {/* 4. Add Line Button */}
                        <button
                          type="button"
                          onClick={() => setActiveToolbarPanel('add-line')}
                          className="p-2 rounded-lg text-[#337EA9] hover:bg-[#337EA9]/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title={t('Tambah Baris Baru', 'Add Line Below')}
                        >
                          <Plus className="w-5 h-5" />
                        </button>

                        {/* Delete Block */}
                        <button
                          type="button"
                          onClick={() => editBlockDelete(focusedBlockId)}
                          disabled={editingNote.blocks.length <= 1}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title={t('Hapus Blok', 'Delete Block')}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        {/* Save block edits / Done */}
                        <button
                          type="button"
                          onClick={() => setFocusedBlockId(null)}
                          className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                          title={t('Selesai', 'Done')}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Note Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmNoteId && (
          <div className="fixed inset-0 bg-black/45 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 max-w-sm w-full shadow-2xl space-y-4 text-xs font-sans text-neutral-800 dark:text-neutral-200"
            >
              <div className="flex items-start gap-3 text-left">
                <span className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full shrink-0">
                  <Trash2 className="w-5 h-5" />
                </span>
                <div className="space-y-1">
                  <h3 className="font-bold text-[13px] text-neutral-800 dark:text-neutral-100">
                    {t('Hapus Catatan?', 'Delete Note?')}
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-400 leading-normal">
                    {t('Apakah Anda yakin ingin menghapus catatan', 'Are you sure you want to delete the note')}{' '}
                    <strong className="text-neutral-800 dark:text-neutral-200">
                      "{notes.find(n => n.id === deleteConfirmNoteId)?.title || t('Tanpa Judul', 'Untitled')}"
                    </strong>
                    ? {t('Tindakan ini tidak dapat dibatalkan.', 'This action cannot be undone.')}
                  </p>
                  <div className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/10 p-1.5 rounded border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-1.5 mt-2 font-medium select-none">
                    <span>💡 Tip:</span>{' '}
                    <span>
                      {t('Tahan tombol', 'Hold')}{' '}
                      <kbd className="font-mono bg-white dark:bg-neutral-800 border border-emerald-200/60 dark:border-emerald-950 px-1 rounded shadow-3xs font-bold text-[9px] cursor-help">
                        Shift
                      </kbd>{' '}
                      {t(
                        'saat klik ikon Hapus untuk menghapus langsung tanpa konfirmasi ini.',
                        'when clicking Delete to delete instantly without this confirmation.'
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 text-[11px] font-semibold pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmNoteId(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-250 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 cursor-pointer transition-colors"
                >
                  {t('Batal', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirmNoteId) {
                      onUpdateKeepNotes(notes.filter((n) => n.id !== deleteConfirmNoteId));
                      if (editingNoteId === deleteConfirmNoteId) {
                        setEditingNoteId(null);
                        setEditingNote(null);
                      }
                      setDeleteConfirmNoteId(null);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors"
                >
                  {t('Hapus Catatan', 'Delete Note')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Subcomponent: SINGLE NOTE CARD COMPONENT (Renders beautifully)
interface KeepNoteCardProps {
  note: KeepNote;
  onClick: () => void;
  onTogglePin: () => void;
  onDelete: (e?: React.MouseEvent) => void;
  onColorChange: (color: string) => void;
  t: (idText: string, enText: string) => string;
}

function KeepNoteCard({ note, onClick, onTogglePin, onDelete, onColorChange, t }: KeepNoteCardProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Check if note is orange / yellow and should display a lovely stylized pencil background accent
  const hasPencilBackground = note.color === 'yellow' || note.color === 'amber';

  return (
    <div
      onClick={onClick}
      className={`group relative min-h-48 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:shadow-xs active:scale-[0.99] transition-all overflow-hidden ${
        note.color && note.color !== 'default' 
          ? COLOR_PRESETS.find(c => c.id === note.color)?.bg 
          : 'bg-white dark:bg-neutral-900'
      } ${
        hasPencilBackground 
          ? "before:absolute before:-right-10 before:-bottom-10 before:w-36 before:h-36 before:bg-gradient-to-tr before:from-amber-400/10 before:to-yellow-500/5 before:rounded-full after:absolute after:right-6 after:bottom-6 after:w-2.5 after:h-14 after:bg-amber-400/20 after:rotate-45 after:rounded-full"
          : ""
      }`}
    >
      <div>
        {/* Card Header: Title & Pin action */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 line-clamp-2 leading-tight">
            {note.title}
          </h4>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className={`opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-neutral-800/5 transition-opacity duration-150 shrink-0 ${
              note.isPinned ? 'opacity-100 text-amber-500' : 'text-neutral-400 hover:text-neutral-600'
            }`}
            title={note.isPinned ? t('Lepas Sematan', 'Unpin Note') : t('Sematkan Catatan', 'Pin Note')}
          >
            ★
          </button>
        </div>

        {/* Card Body: Brief blocks preview (max 5 lines) */}
        <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 select-none pb-8 pr-1">
          {(note.blocks || []).slice(0, 6).map((block, idx) => {
            const isTodo = block.type === 'todo';
            return (
              <div key={block.id} className="flex items-start gap-1.5 line-clamp-1">
                {isTodo ? (
                  <span className={`w-3.5 h-3.5 rounded border border-neutral-300 dark:border-neutral-700 flex items-center justify-center shrink-0 mt-0.5 ${block.isCompleted ? 'bg-blue-500 border-blue-500' : ''}`}>
                    {block.isCompleted && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                  </span>
                ) : (
                  <span className="text-neutral-400 font-bold shrink-0">•</span>
                )}
                <span 
                  className={`truncate leading-relaxed flex-1 ${block.isCompleted ? 'line-through text-neutral-400 dark:text-neutral-600' : ''}`}
                  dangerouslySetInnerHTML={{ __html: formatBlockContent(block.content) || '...' }}
                />
              </div>
            );
          })}
          {(note.blocks || []).length > 6 && (
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium pl-1 mt-1">
              + {(note.blocks || []).length - 6} {t('item lainnya', 'more items')}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Action Strip (visible on hover) */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-transparent"
      >
        <div className="flex items-center gap-1 relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-1.5 rounded-lg hover:bg-neutral-800/5 text-neutral-500 hover:text-neutral-700 cursor-pointer"
            title={t('Ubah Warna', 'Change Color')}
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {showColorPicker && (
            <div className="absolute left-0 bottom-7 z-30 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-1 flex gap-1 items-center">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onColorChange(preset.id);
                    setShowColorPicker(false);
                  }}
                  className={`w-4.5 h-4.5 rounded-full ${preset.bg} border ${
                    note.color === preset.id ? 'border-neutral-800 dark:border-neutral-100' : 'border-neutral-200 dark:border-neutral-600'
                  } cursor-pointer hover:scale-110 flex items-center justify-center`}
                  title={preset.name}
                >
                  <span className={`w-1 h-1 rounded-full ${preset.dot}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 cursor-pointer"
          title={t('Hapus Catatan', 'Delete Note')}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
