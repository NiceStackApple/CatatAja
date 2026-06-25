import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckSquare, 
  Type, 
  Heading1, 
  Heading2, 
  Quote, 
  HelpCircle, 
  Minus, 
  AlertCircle,
  Hash,
  List,
  MessageSquare,
  GripVertical,
  Table as TableIcon,
  BarChart4,
  Link2,
  ChevronRight,
  Settings,
  ArrowRight,
  Sparkles,
  Columns
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Block, Page, Habit, TrackingDay, DatabaseRow } from '../types';

interface BlockEditorProps {
  blocks: Block[];
  onChangeBlocks: (blocks: Block[]) => void;
  pages?: Page[];
  habits?: Habit[];
  trackingDays?: TrackingDay[];
  databaseRows?: DatabaseRow[];
  onNavigatePage?: (pageId: string) => void;
}

export default function BlockEditor({ 
  blocks, 
  onChangeBlocks,
  pages = [],
  habits = [],
  trackingDays = [],
  databaseRows = [],
  onNavigatePage
}: BlockEditorProps) {
  const [activeMenuBlockId, setActiveMenuBlockId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [canDragBlockId, setCanDragBlockId] = useState<string | null>(null);
  const [deleteConfirmBlockId, setDeleteConfirmBlockId] = useState<string | null>(null);
  const [deleteConfirmBlockType, setDeleteConfirmBlockType] = useState<string>('');
  const [settingsBlockId, setSettingsBlockId] = useState<string | null>(null);

  // Close block menu popover when clicking anywhere outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (activeMenuBlockId) {
        const target = event.target as HTMLElement;
        if (!target.closest('.block-menu-popover') && !target.closest('.block-menu-trigger')) {
          setActiveMenuBlockId(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeMenuBlockId]);

  // Update text content / generic payload of a block
  const handleBlockChange = (id: string, updatedFields: Partial<Block>) => {
    const updatedBlocks = blocks.map(b => b.id === id ? { ...b, ...updatedFields } as Block : b);
    onChangeBlocks(updatedBlocks);
  };

  // Toggle todo check state
  const handleTodoToggle = (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      handleBlockChange(id, { isCompleted: !block.isCompleted });
    }
  };

  // Add a new block below another block (or at the end)
  const addBlock = (type: Block['type'], index?: number) => {
    let tableData;
    let chartData;
    let bridgeData;

    // Default structure values
    if (type === 'table') {
      tableData = {
        headers: ['Target', 'Metrik', 'Status'],
        rows: [
          { 'Target': 'Mulai Rutinitas', 'Metrik': '100%', 'Status': 'Selesai' },
          { 'Target': 'Review Progress', 'Metrik': '80%', 'Status': 'Berjalan' }
        ]
      };
    } else if (type === 'chart') {
      chartData = {
        title: 'Manajer Produktivitas',
        chartType: 'bar' as const,
        metrics: [
          { label: 'Sen', value: 20 },
          { label: 'Sel', value: 45 },
          { label: 'Rab', value: 28 },
          { label: 'Kam', value: 80 },
          { label: 'Jum', value: 35 }
        ]
      };
    } else if (type === 'bridge') {
      const otherPage = pages.find(p => p.type !== 'notes' && p.type !== 'blank');
      bridgeData = {
        targetPageId: otherPage?.id || pages[0]?.id || '',
        displayMode: 'summary' as const
      };
    }

    const newBlock: Block = {
      id: `blk-${Date.now()}`,
      type,
      content: getPlaceholderFor(type),
      isCompleted: false,
      icon: type === 'callout' ? '💡' : undefined,
      tableData,
      chartData,
      bridgeData
    };

    let updatedBlocks: Block[];
    if (typeof index === 'number') {
      updatedBlocks = [...blocks];
      updatedBlocks.splice(index + 1, 0, newBlock);
    } else {
      updatedBlocks = [...blocks, newBlock];
    }
    onChangeBlocks(updatedBlocks);
    setActiveMenuBlockId(null);
  };

  // Delete block
  const deleteBlock = (id: string) => {
    const updatedBlocks = blocks.filter(b => b.id !== id);
    // Always keep at least one block
    if (updatedBlocks.length === 0) {
      updatedBlocks.push({
        id: `blk-${Date.now()}`,
        type: 'paragraph',
        content: ''
      });
    }
    onChangeBlocks(updatedBlocks);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      const updatedBlocks = [...blocks];
      const [draggedBlock] = updatedBlocks.splice(sourceIndex, 1);
      updatedBlocks.splice(targetIndex, 0, draggedBlock);
      onChangeBlocks(updatedBlocks);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setCanDragBlockId(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setCanDragBlockId(null);
  };

  const getPlaceholderFor = (type: Block['type']): string => {
    switch (type) {
      case 'h1': return 'Judul Utama Baru';
      case 'h2': return 'Sub-Judul Baru';
      case 'h3': return 'Sub-judul Kecil';
      case 'todo': return 'Tulis tugas harian...';
      case 'bullet': return 'Poin diskusi...';
      case 'callout': return 'Catatan informasi penting atau tips produktivitas harian.';
      case 'quote': return 'Tulis kutipan yang menginspirasimu hari ini...';
      case 'divider': return '';
      case 'table': return 'Tabel Kustom Baru';
      case 'chart': return 'Indikator Grafik Baru';
      case 'bridge': return 'Jembatan Informasi';
      default: return 'Ketik teks di sini...';
    }
  };

  // Dynamic counter metrics from other pages
  const getBridgedPageStats = (pageId: string) => {
    const target = pages.find(p => p.id === pageId);
    if (!target) return { label: 'Halaman Tidak Ditemukan', value: '', desc: 'Hubungkan dengan halaman lain.' };

    switch (target.type) {
      case 'tracker': {
        const todayStr = '2026-06-22';
        const todayData = trackingDays.find(d => d.date === todayStr) || { habitsCompleted: [] };
        const total = habits.length || 1;
        const current = todayData.habitsCompleted.length;
        const percent = Math.round((current / total) * 100);
        return {
          label: 'Kemajuan Habit Hari Ini',
          value: `${percent}%`,
          desc: `Menyelesaikan ${current} dari ${total} target kebiasaan harian.`
        };
      }
      case 'calendar': {
        const totalTracked = trackingDays.length;
        return {
          label: 'Total Riwayat Log',
          value: `${totalTracked} Hari`,
          desc: 'Jumlah hari yang didokumentasikan di kalender.'
        };
      }
      case 'analytics': {
        const avgFocus = trackingDays.length > 0 
          ? (trackingDays.reduce((sum, d) => sum + (d.productiveHours || 0), 0) / trackingDays.length).toFixed(1)
          : '0';
        return {
          label: 'Rata-rata Fokus Harian',
          value: `${avgFocus} Jam`,
          desc: 'Rata-rata durasi jam kerja produktif.'
        };
      }
      case 'database': {
        const totalTasks = databaseRows.length;
        const pending = databaseRows.filter(r => r.status !== 'Completed').length;
        return {
          label: 'Tugas Belum Selesai',
          value: `${pending} Tugas`,
          desc: `Menyimpan total ${totalTasks} tugas pada papan database.`
        };
      }
      case 'notes': {
        const totalBlocks = target.blocks?.length || 0;
        return {
          label: 'Jumlah Blok Catatan',
          value: `${totalBlocks} Blok`,
          desc: 'Pemikiran kreatif & ide penting.'
        };
      }
      case 'blank': {
        const totalBlocks = target.blocks?.length || 0;
        return {
          label: 'Blok Elemen Terpasang',
          value: `${totalBlocks} Elemen`,
          desc: 'Komponen kustom yang dirancang di halaman kosong.'
        };
      }
      default:
        return { label: 'Brosur Informasi', value: 'Terhubung', desc: 'Halaman ini telah sukses ditautkan.' };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 space-y-4">
      {/* Dynamic List of Editor Nodes */}
      <div className="space-y-1">
        {blocks.map((block, index) => {
          const isLast = index === blocks.length - 1;
          const isSettingsOpen = settingsBlockId === block.id;

          return (
            <div 
              id={`block-wrapper-${block.id}`}
              key={block.id} 
              draggable={canDragBlockId === block.id}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative flex flex-col pl-1 pr-1.5 py-1 rounded hover:bg-[#F7F7F5] transition-colors ${
                draggedIndex === index ? 'opacity-30' : ''
              }`}
            >
              {/* Drop place indicator line */}
              {dragOverIndex === index && (
                <div 
                  className={`absolute left-0 right-0 h-0.5 bg-[#337EA9] z-10 pointer-events-none rounded ${
                    index < (draggedIndex ?? 0) ? '-top-0.5' : '-bottom-0.5'
                  }`}
                />
              )}

              {/* Main row layout */}
              <div className="flex items-start gap-1">
                {/* Left Action Gutter (Drag Handle and Plus Insert button) */}
                <div className="flex items-center gap-0.5 shrink-0 w-14 justify-end opacity-0 group-hover:opacity-100 transition-opacity self-center mr-1 pb-0.5">
                  {/* Drag Handle */}
                  <div
                    id={`btn-block-drag-handle-${block.id}`}
                    className="p-1 rounded text-[#787774] hover:text-[#37352F] hover:bg-[#EDEDED] cursor-grab active:cursor-grabbing shrink-0"
                    title="Seret untuk memindahkan"
                    onMouseEnter={() => setCanDragBlockId(block.id)}
                    onMouseLeave={() => {
                      if (draggedIndex === null) {
                        setCanDragBlockId(null);
                      }
                    }}
                    onMouseDown={() => setCanDragBlockId(block.id)}
                    onMouseUp={() => {
                      if (draggedIndex === null) {
                        setCanDragBlockId(null);
                      }
                    }}
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  {/* Insertion triggers */}
                  <button
                    id={`btn-block-add-menu-${block.id}`}
                    onClick={() => setActiveMenuBlockId(activeMenuBlockId === block.id ? null : block.id)}
                    className="block-menu-trigger p-1 rounded text-[#787774] hover:text-[#37352F] hover:bg-[#EDEDED] cursor-pointer"
                    title="Tambah Blok Setelah Ini"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Specific Block Layouts (Middle Column) */}
                <div className="flex-1 min-w-0">
                  {block.type === 'h1' && (
                    <input
                      id={`block-input-h1-${block.id}`}
                      type="text"
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                      placeholder={getPlaceholderFor('h1')}
                      className="w-full text-xl font-bold font-sans text-[#37352F] tracking-tight py-1 bg-transparent border-none outline-hidden"
                    />
                  )}

                  {block.type === 'h2' && (
                    <input
                      id={`block-input-h2-${block.id}`}
                      type="text"
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                      placeholder={getPlaceholderFor('h2')}
                      className="w-full text-lg font-semibold font-sans text-[#37352F] tracking-tight py-1 bg-transparent border-none outline-hidden"
                    />
                  )}

                  {block.type === 'h3' && (
                    <input
                      id={`block-input-h3-${block.id}`}
                      type="text"
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                      placeholder={getPlaceholderFor('h3')}
                      className="w-full text-base font-medium font-sans text-[#37352F] py-0.5 bg-transparent border-none outline-hidden"
                    />
                  )}

                  {block.type === 'paragraph' && (
                    <textarea
                      id={`block-input-p-${block.id}`}
                      value={block.content}
                      onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                      placeholder={getPlaceholderFor('paragraph')}
                      rows={1}
                      className="w-full py-0.5 text-sm text-[#37352F] bg-transparent border-none outline-hidden resize-none leading-relaxed"
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                      onFocus={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                  )}

                  {block.type === 'todo' && (
                    <div className="flex items-start gap-2 py-0.5">
                      <button
                        id={`btn-todo-checkbox-${block.id}`}
                        onClick={() => handleTodoToggle(block.id)}
                        className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer ${
                          block.isCompleted 
                            ? 'bg-[#337EA9] border-[#337EA9] text-white' 
                            : 'border-[#EBEBEB] hover:border-[#337EA9] bg-white'
                        }`}
                      >
                        {block.isCompleted && <span className="text-[10px] leading-none font-bold">✓</span>}
                      </button>
                      <input
                        id={`block-input-todo-${block.id}`}
                        type="text"
                        value={block.content}
                        onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                        placeholder={getPlaceholderFor('todo')}
                        className={`w-full text-sm text-[#37352F] bg-transparent border-none outline-hidden ${
                          block.isCompleted ? 'line-through text-[#787774]' : ''
                        }`}
                      />
                    </div>
                  )}

                  {block.type === 'bullet' && (
                    <div className="flex items-start gap-2 py-0.5">
                      <span className="text-[#787774] select-none mr-1.5 mt-0.5 shrink-0">•</span>
                      <input
                        id={`block-input-bullet-${block.id}`}
                        type="text"
                        value={block.content}
                        onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                        placeholder={getPlaceholderFor('bullet')}
                        className="w-full text-sm text-[#37352F] bg-transparent border-none outline-hidden"
                      />
                    </div>
                  )}

                  {block.type === 'callout' && (
                    <div className="flex items-start gap-2.5 bg-[#F1F1EF] border border-[#EBEBEB] p-3 rounded my-1">
                      <div className="text-base shrink-0 select-none">{block.icon}</div>
                      <textarea
                        id={`block-input-callout-${block.id}`}
                        value={block.content}
                        onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                        placeholder={getPlaceholderFor('callout')}
                        rows={1}
                        className="w-full text-sm text-[#37352F] bg-transparent border-none outline-hidden resize-none leading-relaxed"
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }}
                      />
                    </div>
                  )}

                  {block.type === 'quote' && (
                    <div className="border-l-3 border-[#37352F] pl-3 py-0.5 my-1">
                      <textarea
                        id={`block-input-quote-${block.id}`}
                        value={block.content}
                        onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                        placeholder={getPlaceholderFor('quote')}
                        rows={1}
                        className="w-full text-sm font-medium italic text-[#787774] bg-transparent border-none outline-hidden resize-none leading-relaxed"
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }}
                      />
                    </div>
                  )}

                  {block.type === 'divider' && (
                    <div className="py-2">
                      <hr className="border-t border-[#EBEBEB]" />
                    </div>
                  )}

                  {/* INTERACTIVE block type: TABLE */}
                  {block.type === 'table' && block.tableData && (
                    <div className="my-3 space-y-2.5 font-sans">
                      <div className="flex items-center gap-1">
                        <span className="p-1 bg-[#F1F1EF] text-blue-600 rounded">
                          <TableIcon className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                          className="font-bold text-xs text-neutral-700 bg-transparent border-none outline-hidden focus:bg-[#EBEBEB] px-1 rounded-sm w-fit"
                          placeholder="Nama Tabel..."
                        />
                        <button
                          onClick={() => setSettingsBlockId(isSettingsOpen ? null : block.id)}
                          className={`p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-150 transition-colors ml-auto ${isSettingsOpen ? 'bg-neutral-100 text-neutral-700' : ''}`}
                          title="Pengaturan Tabel"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Display table */}
                      <div className="overflow-x-auto border border-neutral-150 rounded-lg bg-white max-h-56">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-150 font-mono text-[10px] text-neutral-500 font-bold">
                              {block.tableData.headers.map((hdr, hIdx) => (
                                <th key={hIdx} className="p-2 border-r last:border-r-0">
                                  <div className="flex items-center gap-1 group/th relative">
                                    <input
                                      type="text"
                                      value={hdr}
                                      onChange={(e) => {
                                        const newHeaders = [...block.tableData!.headers];
                                        newHeaders[hIdx] = e.target.value;
                                        // Update rows key
                                        const oldKey = hdr;
                                        const newKey = e.target.value;
                                        const newRows = block.tableData!.rows.map(row => {
                                          const copy = { ...row };
                                          copy[newKey] = copy[oldKey] || '-';
                                          if (oldKey !== newKey) delete copy[oldKey];
                                          return copy;
                                        });
                                        handleBlockChange(block.id, {
                                          tableData: { headers: newHeaders, rows: newRows }
                                        });
                                      }}
                                      className="bg-transparent font-bold border-none p-0 focus:bg-white text-[10.5px] uppercase tracking-wide text-neutral-600 focus:outline-hidden w-20"
                                    />
                                    {block.tableData!.headers.length > 1 && (
                                      <button
                                        onClick={() => {
                                          const headers = block.tableData!.headers.filter(h => h !== hdr);
                                          const rows = block.tableData!.rows.map(row => {
                                            const copy = { ...row };
                                            delete copy[hdr];
                                            return copy;
                                          });
                                          handleBlockChange(block.id, { tableData: { headers, rows } });
                                        }}
                                        className="text-red-400 hover:text-red-600 font-bold text-xs pointer-events-auto shrink-0 leading-none ml-1 opacity-0 group-hover/th:opacity-100 transition-opacity"
                                        title="Hapus Kolom"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                </th>
                              ))}
                              <th className="w-8"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-150">
                            {block.tableData.rows.length === 0 ? (
                              <tr>
                                <td colSpan={block.tableData.headers.length + 1} className="p-3 text-center text-neutral-400 italic text-[11px]">
                                  Tabel kosong, tekan tombol "Tambah Baris" di bawah!
                                </td>
                              </tr>
                            ) : (
                              block.tableData.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-neutral-50/50 group/row">
                                  {block.tableData!.headers.map((hdr, hIdx) => (
                                    <td key={hIdx} className="p-2 border-r last:border-r-0">
                                      <input
                                        type="text"
                                        value={row[hdr] || ''}
                                        onChange={(e) => {
                                          const newRows = [...block.tableData!.rows];
                                          newRows[rIdx] = { ...row, [hdr]: e.target.value };
                                          handleBlockChange(block.id, {
                                            tableData: { ...block.tableData!, rows: newRows }
                                          });
                                        }}
                                        className="w-full bg-transparent border-none p-0 focus:bg-white text-[11.5px] text-neutral-700 focus:outline-[1px] focus:outline-blue-200"
                                      />
                                    </td>
                                  ))}
                                  <td className="p-2 text-center">
                                    <button
                                      onClick={() => {
                                        const newRows = block.tableData!.rows.filter((_, idx) => idx !== rIdx);
                                        handleBlockChange(block.id, {
                                          tableData: { ...block.tableData!, rows: newRows }
                                        });
                                      }}
                                      className="text-neutral-400 hover:text-red-500 font-bold opacity-0 group-hover/row:opacity-100 transition-opacity"
                                      title="Hapus Baris"
                                    >
                                      ×
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Row and Col Adds */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newRow: Record<string, string> = {};
                            block.tableData!.headers.forEach(h => {
                              newRow[h] = '-';
                            });
                            handleBlockChange(block.id, {
                              tableData: {
                                ...block.tableData!,
                                rows: [...block.tableData!.rows, newRow]
                              }
                            });
                          }}
                          className="py-1 px-3 text-[10.5px] border border-dashed border-neutral-200 hover:border-blue-400 font-bold text-neutral-500 hover:text-blue-600 rounded-lg transition flex items-center gap-1 cursor-pointer w-fit"
                        >
                          + Tambah Baris
                        </button>
                        <button
                          onClick={() => {
                            const newColName = `Kolom ${block.tableData!.headers.length + 1}`;
                            const headers = [...block.tableData!.headers, newColName];
                            const rows = block.tableData!.rows.map(r => ({ ...r, [newColName]: '-' }));
                            handleBlockChange(block.id, { tableData: { headers, rows } });
                          }}
                          className="py-1 px-3 text-[10.5px] border border-dashed border-neutral-200 hover:border-purple-400 font-bold text-neutral-500 hover:text-purple-600 rounded-lg transition flex items-center gap-1 cursor-pointer w-fit"
                        >
                          + Kolom Baru
                        </button>
                      </div>
                    </div>
                  )}

                  {/* INTERACTIVE block type: CHART */}
                  {block.type === 'chart' && block.chartData && (
                    <div className="my-3 space-y-3 font-sans">
                      <div className="flex items-center gap-1">
                        <span className="p-1 bg-[#F1F1EF] text-purple-600 rounded">
                          <BarChart4 className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                          className="font-bold text-xs text-neutral-700 bg-transparent border-none outline-hidden focus:bg-[#EBEBEB] px-1 rounded-sm w-fit"
                          placeholder="Nama Grafik..."
                        />
                        <button
                          onClick={() => setSettingsBlockId(isSettingsOpen ? null : block.id)}
                          className={`p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-150 ml-auto transition-colors ${isSettingsOpen ? 'bg-neutral-100 text-neutral-700' : ''}`}
                          title="Pengaturan Grafik"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Display static responsive beautiful SVG bar / line / area chart */}
                      <div className="p-1 bg-white border border-neutral-150 rounded-xl">
                        <div className="p-2.5 flex justify-between items-end text-[10.5px] text-neutral-400 font-mono uppercase tracking-wider">
                          <span>{block.chartData.title}</span>
                          <span className="font-bold text-purple-600 capitalize">{block.chartData.chartType} visualizer</span>
                        </div>

                        {/* Chart Area */}
                        <div className="h-28 flex items-end gap-3.5 pt-3 border-b border-l border-neutral-100 px-3 select-none">
                          {block.chartData.metrics.map((met, mIdx) => {
                            const maxVal = Math.max(...block.chartData!.metrics.map(v => v.value), 10);
                            const percentage = Math.min(Math.round((met.value / maxVal) * 100), 100);

                            return (
                              <div key={mIdx} className="flex-1 flex flex-col justify-end items-center h-full group/bar relative">
                                <div className="absolute -top-6 bg-neutral-900 border border-neutral-700 text-white font-extrabold font-mono text-[9px] rounded px-1.5 py-0.5 opacity-0 group-hover/bar:opacity-100 scale-95 group-hover/bar:scale-100 transition duration-150 shadow-md pointer-events-none z-10 whitespace-nowrap">
                                  {met.value} Pts
                                </div>

                                {block.chartData!.chartType === 'bar' && (
                                  <div 
                                    className="w-full bg-gradient-to-t from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 rounded-t-xs transition-all duration-300 relative"
                                    style={{ height: `${percentage}%` }}
                                  />
                                )}

                                {block.chartData!.chartType === 'area' && (
                                  <div 
                                    className="w-full bg-purple-100 hover:bg-purple-200 border-t-2 border-purple-500 hover:border-purple-600 transition-all duration-300"
                                    style={{ height: `${percentage}%` }}
                                  />
                                )}

                                {block.chartData!.chartType === 'line' && (
                                  <div className="w-full flex justify-center flex-col items-center" style={{ height: `${percentage}%` }}>
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-600 border-2 border-white group-hover/bar:scale-125 transition shadow-xs" />
                                    <div className="w-0.5 bg-purple-300 flex-1" />
                                  </div>
                                )}

                                <span className="block text-[10px] font-bold text-neutral-500 truncate max-w-full font-mono mt-1 w-full text-center">
                                  {met.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INTERACTIVE block type: BRIDGE */}
                  {block.type === 'bridge' && block.bridgeData && (
                    <div className="my-3 space-y-2.5 font-sans">
                      <div className="flex items-center gap-1 pb-1">
                        <span className="p-1 bg-[#F1F1EF] text-pink-600 rounded">
                          <Link2 className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => handleBlockChange(block.id, { content: e.target.value })}
                          className="font-bold text-xs text-neutral-700 bg-transparent border-none outline-hidden focus:bg-[#EBEBEB] px-1 rounded-sm w-fit"
                          placeholder="Judul Jembatan..."
                        />
                        <button
                          onClick={() => setSettingsBlockId(isSettingsOpen ? null : block.id)}
                          className={`p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-150 ml-auto transition-colors ${isSettingsOpen ? 'bg-neutral-100 text-neutral-700' : ''}`}
                          title="Pengaturan Jembatan"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {(() => {
                        const targetPage = pages.find(p => p.id === block.bridgeData!.targetPageId);
                        if (!targetPage) {
                          return (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-600 flex items-center justify-between">
                              <span>Jembatan belum dikonfigurasi. Silakan klik tombol gerigi untuk menyambungkan halaman target.</span>
                              <ChevronRight className="w-4 h-4 shrink-0 animate-pulse" />
                            </div>
                          );
                        }

                        const dataNode = getBridgedPageStats(block.bridgeData!.targetPageId);

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
                            <div className="p-3.5 rounded-xl border border-pink-100 bg-pink-50/20 col-span-1 md:col-span-2 space-y-2 relative">
                              <span className="absolute top-2 right-2 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span className="text-sm shrink-0">{targetPage.icon}</span>
                                <div className="text-left">
                                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block leading-none">
                                    Siaran Jembatan
                                  </span>
                                  <span className="text-xs font-bold text-neutral-700 leading-normal">{targetPage.title}</span>
                                </div>
                              </div>

                              {block.bridgeData!.displayMode === 'link' ? (
                                <div className="text-[11px] text-neutral-500 font-sans flex items-center gap-1.5 pt-1">
                                  <span>Tautan cepat terpasang untuk melihat log penuh dokumen terkait.</span>
                                </div>
                              ) : (
                                <div className="space-y-1 select-none">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-lg font-black text-neutral-800 tracking-tight leading-none">
                                      {dataNode.value}
                                    </span>
                                    <span className="text-[9px] font-bold text-pink-600 bg-pink-50 border border-pink-100 p-0.5 px-1.5 rounded leading-none">
                                      {dataNode.label}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-neutral-500 leading-normal">
                                    {dataNode.desc}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Navigation trigger button */}
                            <button
                              onClick={() => onNavigatePage?.(targetPage.id)}
                              className="p-3 bg-neutral-900 duration-150 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex flex-col justify-center items-center gap-1.5 transition-all text-center select-none shadow-xs group/link cursor-pointer"
                            >
                              <span>Kunjungi Dokumen</span>
                              <div className="flex items-center gap-1 text-[11px] font-medium text-pink-300">
                                <span className="truncate max-w-28">{targetPage.title}</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                              </div>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Inline Configurations Panel (renders toggled per-block) */}
                  <AnimatePresence>
                    {isSettingsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[#F7F7F5] border border-neutral-150 p-3 rounded-lg text-xs space-y-3.5 my-2 overflow-hidden"
                      >
                        <div className="font-mono text-[9px] text-neutral-400 font-bold uppercase tracking-wider pb-1 border-b border-neutral-200">
                          Panel Konfigurasi Blok ({block.type.toUpperCase()})
                        </div>

                        {block.type === 'chart' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="block text-[10px] font-semibold text-neutral-500 mb-1">Tipe Grafik:</span>
                                <div className="flex bg-white rounded border p-0.5 w-fit">
                                  {['bar', 'line', 'area'].map(cType => (
                                    <button
                                      key={cType}
                                      onClick={() => {
                                        handleBlockChange(block.id, {
                                          chartData: { ...block.chartData!, chartType: cType as any }
                                        });
                                      }}
                                      className={`px-2 py-1 text-[10px] font-bold rounded capitalize transition duration-150 cursor-pointer ${
                                        block.chartData?.chartType === cType 
                                          ? 'bg-purple-100 text-purple-700' 
                                          : 'hover:bg-neutral-100 text-neutral-600'
                                      }`}
                                    >
                                      {cType}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <span className="block text-[10px] font-semibold text-neutral-500 mb-1">Label Grafik:</span>
                                <input
                                  type="text"
                                  value={block.chartData.title}
                                  onChange={(e) => {
                                    handleBlockChange(block.id, {
                                      chartData: { ...block.chartData!, title: e.target.value }
                                    });
                                  }}
                                  className="p-1 px-2 border rounded bg-white w-full text-xs"
                                  placeholder="Nama sumbu..."
                                />
                              </div>
                            </div>

                            {/* Metrics lists */}
                            <div className="space-y-1.5">
                              <span className="block text-[10px] font-semibold text-neutral-500">Kelola Data Metrik (Maksimal 6):</span>
                              <div className="grid grid-cols-2 sm:grid-cols-6 gap-1 w-full p-2 bg-white rounded border">
                                {block.chartData.metrics.map((met, mIdx) => (
                                  <div key={mIdx} className="p-1 text-center bg-neutral-50 border rounded relative group/mitem flex flex-col gap-1">
                                    <input
                                      type="text"
                                      value={met.label}
                                      onChange={(e) => {
                                        const newMetrics = [...block.chartData!.metrics];
                                        newMetrics[mIdx] = { ...met, label: e.target.value };
                                        handleBlockChange(block.id, { chartData: { ...block.chartData!, metrics: newMetrics } });
                                      }}
                                      className="font-bold text-[10px] text-neutral-700 p-0 text-center bg-transparent border-none focus:bg-white focus:outline-hidden"
                                    />
                                    <input
                                      type="number"
                                      value={met.value}
                                      onChange={(e) => {
                                        const newMetrics = [...block.chartData!.metrics];
                                        newMetrics[mIdx] = { ...met, value: Number(e.target.value) || 0 };
                                        handleBlockChange(block.id, { chartData: { ...block.chartData!, metrics: newMetrics } });
                                      }}
                                      className="font-bold font-mono text-[11px] text-purple-600 p-0 text-center bg-transparent border-none focus:bg-white focus:outline-hidden"
                                    />
                                    {block.chartData!.metrics.length > 1 && (
                                      <button
                                        onClick={() => {
                                          const newMetrics = block.chartData!.metrics.filter((_, i) => i !== mIdx);
                                          handleBlockChange(block.id, { chartData: { ...block.chartData!, metrics: newMetrics } });
                                        }}
                                        className="absolute -top-1 -right-1 bg-red-100 hover:bg-red-200 text-red-600 text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold opacity-0 group-hover/mitem:opacity-100 transition-opacity"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}

                                {block.chartData.metrics.length < 6 && (
                                  <button
                                    onClick={() => {
                                      const label = `Dat-${block.chartData!.metrics.length + 1}`;
                                      const metrics = [...block.chartData!.metrics, { label, value: 30 }];
                                      handleBlockChange(block.id, { chartData: { ...block.chartData!, metrics } });
                                    }}
                                    className="border border-dashed font-bold text-xs text-neutral-400 hover:text-purple-600 hover:border-purple-300 rounded p-1 transition"
                                  >
                                    + Baru
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === 'bridge' && (
                          <div className="grid grid-cols-2 gap-3.5">
                            <div>
                              <span className="block text-[10px] font-semibold text-neutral-500 mb-1">Hubungkan Halaman Data:</span>
                              <select
                                value={block.bridgeData.targetPageId}
                                onChange={(e) => {
                                  handleBlockChange(block.id, {
                                    bridgeData: { ...block.bridgeData!, targetPageId: e.target.value }
                                  });
                                }}
                                className="w-full p-1 border text-xs bg-white rounded outline-hidden cursor-pointer font-bold text-neutral-700"
                              >
                                <option value="">-- Pilihlah Halaman --</option>
                                {pages.map(pg => (
                                  <option key={pg.id} value={pg.id}>
                                    {pg.icon} {pg.title}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <span className="block text-[10px] font-semibold text-neutral-500 mb-1">Opsi Tampilan Informasi:</span>
                              <div className="flex bg-white rounded border p-0.5">
                                {['summary', 'stats', 'link'].map(mode => (
                                  <button
                                    key={mode}
                                    onClick={() => {
                                      handleBlockChange(block.id, {
                                        bridgeData: { ...block.bridgeData!, displayMode: mode as any }
                                      });
                                    }}
                                    className={`px-2 py-1 text-[10px] font-extrabold rounded capitalize flex-1 text-center transition cursor-pointer ${
                                      block.bridgeData?.displayMode === mode 
                                        ? 'bg-pink-100 text-pink-700' 
                                        : 'hover:bg-neutral-100 text-neutral-600'
                                    }`}
                                  >
                                    {mode}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === 'table' && (
                          <span className="text-neutral-400 italic block">Anda dapat mengedit judul kolom dan mengisi baris tabel secara langsung pada tabel di internet. Tetap efisien!</span>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => setSettingsBlockId(null)}
                            className="bg-neutral-800 hover:bg-neutral-900 text-white font-extrabold text-[10px] px-3.5 py-1 rounded"
                          >
                            Tutup Panel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right Action Gutter (Delete Button) */}
                <div className="flex items-center shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity ml-1 pl-1">
                  <button
                    id={`btn-block-delete-${block.id}`}
                    onClick={(e) => {
                      if (e.shiftKey) {
                        deleteBlock(block.id);
                      } else {
                        setDeleteConfirmBlockId(block.id);
                        setDeleteConfirmBlockType(block.type);
                      }
                    }}
                    className="p-1 rounded text-[#787774] hover:text-[#EB5757] hover:bg-[#FBEEEE] cursor-pointer"
                    title="Hapus Blok (Tahan Shift untuk langsung menghapus)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Inline Block Addition Menu Popover */}
              <AnimatePresence>
                {activeMenuBlockId === block.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="block-menu-popover absolute left-10 top-9 z-30 bg-white border border-[#EBEBEB] rounded-lg shadow-xl p-1.5 w-72 text-xs text-[#37352F]"
                  >
                      {/* DASAR MENU */}
                      <div className="px-2 py-1 text-[9px] font-bold text-[#787774] uppercase tracking-wider border-b border-[#EBEBEB]">
                        Blok Umum (Teks & List)
                      </div>
                      <div className="grid grid-cols-2 gap-1 py-1">
                        <button
                          onClick={() => addBlock('paragraph', index)}
                          className="flex items-center gap-2 p-1.5 hover:bg-[#F7F7F5] rounded text-left cursor-pointer transition-colors"
                        >
                          <Type className="w-3.5 h-3.5 text-slate-500" /> Paragraf
                        </button>
                        <button
                          onClick={() => addBlock('todo', index)}
                          className="flex items-center gap-2 p-1.5 hover:bg-[#F7F7F5] rounded text-left cursor-pointer transition-colors"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-blue-500" /> Tugas (To-Do)
                        </button>
                        <button
                          onClick={() => addBlock('h1', index)}
                          className="flex items-center gap-2 p-1.5 hover:bg-[#F7F7F5] rounded text-left cursor-pointer transition-colors"
                        >
                          <Heading1 className="w-3.5 h-3.5 text-neutral-800" /> Judul Utama
                        </button>
                        <button
                          onClick={() => addBlock('h2', index)}
                          className="flex items-center gap-2 p-1.5 hover:bg-[#F7F7F5] rounded text-left cursor-pointer transition-colors"
                        >
                          <Heading2 className="w-3.5 h-3.5 text-neutral-800" /> Subjudul
                        </button>
                        <button
                          onClick={() => addBlock('bullet', index)}
                          className="flex items-center gap-2 p-1.5 hover:bg-[#F7F7F5] rounded text-left cursor-pointer transition-colors"
                        >
                          <List className="w-3.5 h-3.5 text-yellow-600" /> Poin Bulatan
                        </button>
                        <button
                          onClick={() => addBlock('callout', index)}
                          className="flex items-center gap-2 p-1.5 hover:bg-[#F7F7F5] rounded text-left cursor-pointer transition-colors"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-emerald-500" /> Kotak Info
                        </button>
                        <button
                          onClick={() => addBlock('quote', index)}
                          className="flex items-center gap-2 p-1.5 hover:bg-[#F7F7F5] rounded text-left cursor-pointer transition-colors"
                        >
                          <Quote className="w-3.5 h-3.5 text-indigo-500" /> Kutipan
                        </button>
                        <button
                          onClick={() => addBlock('divider', index)}
                          className="flex items-center gap-2 p-1.5 hover:bg-[#F7F7F5] rounded text-left cursor-pointer transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-400" /> Garis Pemisah
                        </button>
                      </div>

                      {/* ADD-ONS INTERAKTIF MENU */}
                      <div className="px-2 py-1 mt-1 text-[9px] font-bold text-pink-600 uppercase tracking-widest border-t border-b border-pink-50 bg-pink-50/20">
                        ✨ Add-ons / Elemen Kustom
                      </div>
                      <div className="grid grid-cols-1 gap-1 py-1">
                        <button
                          onClick={() => addBlock('table', index)}
                          className="flex items-center gap-2 p-1.5 hover:bg-pink-50/50 rounded text-left text-neutral-800 font-bold tracking-tight cursor-pointer transition-colors"
                        >
                          <TableIcon className="w-4 h-4 text-blue-500" /> Tabel Dinamis
                        </button>
                      </div>

                      <div className="text-[10px] text-center text-neutral-400 pt-1.5 border-t select-none">
                        Klik di luar untuk menutup menu ini
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Simple single Add trigger at bottom to keep layout clean */}
      <div className="pt-4 border-t border-dashed border-[#EBEBEB] flex justify-center">
        <button
          id="btn-block-add-bottom"
          onClick={() => addBlock('paragraph')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#787774] hover:text-[#37352F] hover:bg-[#F7F7F5] bg-white rounded-lg border border-[#EBEBEB] cursor-pointer transition-colors shadow-2xs"
          title="Tambah Paragraf Baru"
        >
          <Plus className="w-4 h-4 text-neutral-500" />
          <span>Tambah Blok Baru</span>
        </button>
      </div>

      {/* Block Delete Custom Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmBlockId && (
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
                  <h3 className="font-bold text-[13px] text-[#37352F]">Hapus Blok Konten?</h3>
                  <p className="text-[#787774] leading-normal">
                    Apakah Anda yakin ingin menghapus blok <strong className="text-[#37352F] uppercase">"{deleteConfirmBlockType}"</strong> ini dari halaman?
                  </p>
                  <div className="text-[10px] text-emerald-800 bg-emerald-50/50 p-1.5 rounded border border-emerald-100 flex items-center gap-1.5 mt-1 font-medium select-none">
                    <span>💡 Tip:</span> Tahan tombol <kbd className="font-mono bg-white border border-emerald-200/60 px-1 rounded shadow-3xs font-bold text-[9px] cursor-help">Shift</kbd> saat klik ikon Hapus untuk menghapus langsung tanpa konfirmasi ini.
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 text-[11px] font-semibold pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmBlockId(null)}
                  className="px-3.5 py-1.5 rounded border border-[#EBEBEB] text-[#37352F] hover:bg-[#F7F7F5] cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteBlock(deleteConfirmBlockId);
                    setDeleteConfirmBlockId(null);
                  }}
                  className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors"
                >
                  Hapus Blok
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
