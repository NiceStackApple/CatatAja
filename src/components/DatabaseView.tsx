import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  AlertTriangle, 
  Check, 
  Settings2,
  ListFilter,
  Kanban,
  Table as TableIcon,
  ChevronsUpDown,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DatabaseRow } from '../types';

interface DatabaseViewProps {
  rows: DatabaseRow[];
  onUpdateRows: (rows: DatabaseRow[]) => void;
}

const STATUSES: DatabaseRow['status'][] = ['Not Started', 'In Progress', 'Completed'];
const PRIORITIES: DatabaseRow['priority'][] = ['High', 'Medium', 'Low'];

const PRIORITY_THEMES = {
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-50 text-slate-600 border-slate-200'
};

const STATUS_THEMES = {
  'Not Started': 'bg-gray-100 text-gray-700 border-gray-200',
  'In Progress': 'bg-sky-50 text-sky-700 border-sky-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

export default function DatabaseView({ rows, onUpdateRows }: DatabaseViewProps) {
  const [activeView, setActiveView] = useState<'board' | 'table'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<DatabaseRow['status'] | null>(null);
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState<string | null>(null);
  const [deleteConfirmTaskTitle, setDeleteConfirmTaskTitle] = useState<string>('');

  // Filter rows matches searching bar
  const filteredRows = rows.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Modify row
  const updateRowField = <K extends keyof DatabaseRow>(id: string, field: K, val: DatabaseRow[K]) => {
    const updated = rows.map(r => {
      if (r.id === id) {
        const updatedRow = { ...r, [field]: val };
        // Handle completedDate automatically based on status transition
        if (field === 'status') {
          if (val === 'Completed') {
            if (!r.completedDate) {
              updatedRow.completedDate = new Date().toISOString().split('T')[0];
            }
          } else {
            updatedRow.completedDate = undefined;
          }
        }
        return updatedRow;
      }
      return r;
    });
    onUpdateRows(updated);
  };

  // Add a brand new task
  const handleAddTask = (status: DatabaseRow['status'] = 'Not Started') => {
    const newRow: DatabaseRow = {
      id: `task-${Date.now()}`,
      title: 'Tugas Projek Baru',
      status,
      priority: 'Medium',
      dueDate: '2026-06-25',
      tags: ['Tugas Baru']
    };
    onUpdateRows([newRow, ...rows]);
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    onUpdateRows(rows.filter(r => r.id !== id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 space-y-4">
      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#F7F7F5] p-2 rounded-lg border border-[#EBEBEB]">
        {/* Toggle view tabs */}
        <div className="flex items-center gap-1.5 p-0.5 bg-[#EDEDED] rounded">
          <button
            id="btn-view-board"
            onClick={() => setActiveView('board')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
              activeView === 'board' 
                ? 'bg-white text-[#37352F] font-semibold border border-[#EBEBEB]' 
                : 'text-[#787774] hover:text-[#37352F] hover:bg-white/40'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Board Kanban
          </button>
          <button
            id="btn-view-table"
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
              activeView === 'table' 
                ? 'bg-white text-[#37352F] font-semibold border border-[#EBEBEB]' 
                : 'text-[#787774] hover:text-[#37352F] hover:bg-white/40'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Tabel Properti
          </button>
        </div>

        {/* Search and Action Deck */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <input
              id="db-search-input"
              type="text"
              placeholder="Cari tugas projek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-[#EBEBEB] rounded bg-white text-[#37352F] placeholder-[#787774] focus:outline-hidden focus:ring-1 focus:ring-[#337EA9]"
            />
          </div>
          <button
            id="btn-db-add-task"
            onClick={() => handleAddTask()}
            className="px-2.5 py-1.5 bg-[#448361] hover:bg-[#3f7556] text-white text-xs font-semibold rounded flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Kerja
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE MODE */}
      <AnimatePresence mode="wait">
        {activeView === 'board' ? (
          /* KANBAN BOARD VIEW */
          <motion.div
            key="board"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {STATUSES.map(status => {
              const statusTasks = filteredRows.filter(r => r.status === status);
              const isDragOver = dragOverStatus === status;

              return (
                <div 
                  id={`board-column-${status}`}
                  key={status} 
                  className={`border transition-all duration-200 rounded-lg p-3 flex flex-col h-[320px] md:h-[520px] ${
                    isDragOver 
                      ? 'bg-[#E7F3EF]/90 border-[#448361]/50 shadow-sm ring-1 ring-[#448361]/20' 
                      : 'bg-[#F7F7F5] border-[#EBEBEB]'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverStatus !== status) {
                      setDragOverStatus(status);
                    }
                  }}
                  onDragLeave={() => {
                    setDragOverStatus(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverStatus(null);
                    const id = e.dataTransfer.getData('text');
                    if (id) {
                      updateRowField(id, 'status', status);
                    }
                  }}
                >
                  {/* Status header lane */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 border rounded-sm ${STATUS_THEMES[status]}`}>
                      {status}
                    </span>
                    <span className="text-[10px] font-bold text-[#787774] bg-[#EDEDED] p-0.5 px-1.5 rounded-full font-mono">
                      {statusTasks.length}
                    </span>
                  </div>

                  {/* Tasks stacked under this lane */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                    {statusTasks.length === 0 ? (
                      <div className="py-8 text-center text-[10px] text-[#787774] italic border border-dashed border-[#EBEBEB] rounded">
                        Belum ada tugas
                      </div>
                    ) : (
                      statusTasks.map(task => (
                        <div
                          id={`board-card-${task.id}`}
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text', task.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          className="bg-white p-3 border border-[#EBEBEB] rounded shadow-2xs hover:border-[#787774]/35 hover:shadow-xs transition-shadow group relative flex flex-col gap-2 cursor-grab active:cursor-grabbing"
                        >
                          {/* Title block with Grip Handle */}
                          <div className="flex items-start gap-1">
                            <span 
                              className="text-[#787774] mt-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                              title="Seret tugas untuk memindahkan status"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <textarea
                              id={`task-title-input-${task.id}`}
                              value={task.title}
                              onChange={(e) => updateRowField(task.id, 'title', e.target.value)}
                              rows={1}
                              className="w-full text-xs font-semibold text-[#37352F] bg-transparent border-none outline-hidden p-0 leading-snug resize-none"
                              onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = `${target.scrollHeight}px`;
                              }}
                              ref={(el) => {
                                if (el) {
                                  el.style.height = 'auto';
                                  el.style.height = `${el.scrollHeight}px`;
                                }
                              }}
                            />
                          </div>

                          {/* Quick details */}
                          <div className="flex items-center justify-between gap-1 text-[10px] text-[#787774]">
                            <span className="flex items-center gap-1 font-mono shrink-0">
                              <Calendar className="w-2.5 h-2.5 text-[#787774]" />
                              <input
                                id={`task-date-input-${task.id}`}
                                type="date"
                                value={task.dueDate}
                                onChange={(e) => updateRowField(task.id, 'dueDate', e.target.value)}
                                className="bg-transparent border-none outline-hidden cursor-pointer w-[95px] text-[#37352F]"
                              />
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Mobile Status Picker to bypass drag-and-drop constraints */}
                              <select
                                id={`task-status-mobile-${task.id}`}
                                value={task.status}
                                onChange={(e) => updateRowField(task.id, 'status', e.target.value as any)}
                                className="md:hidden text-[9px] font-bold px-1.5 py-0.5 border border-[#EBEBEB] bg-[#F7F7F5] rounded-sm cursor-pointer outline-hidden leading-tight text-[#37352F]"
                                title="Ubah Status Kerja"
                              >
                                {STATUSES.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>

                              {/* Dropdown for Priority selection */}
                              <select
                                id={`task-pri-select-${task.id}`}
                                value={task.priority}
                                onChange={(e) => updateRowField(task.id, 'priority', e.target.value as any)}
                                className={`text-[9px] font-bold px-1.5 py-0.5 border rounded-sm cursor-pointer outline-hidden leading-tight shrink-0 ${PRIORITY_THEMES[task.priority]}`}
                              >
                                {PRIORITIES.map(p => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Completion Date Info */}
                          {task.status === 'Completed' && (
                            <div className="flex items-center gap-1 text-[9px] text-[#0D7A5E] bg-[#E7F3EF] px-1.5 py-0.5 border border-[#448361]/10 rounded-sm w-fit font-medium">
                              <Check className="w-2.5 h-2.5 shrink-0" />
                              <span className="shrink-0 font-mono">Selesai:</span>
                              <input
                                id={`task-completed-date-picker-${task.id}`}
                                type="date"
                                value={task.completedDate || ''}
                                onChange={(e) => updateRowField(task.id, 'completedDate', e.target.value)}
                                className="bg-transparent border-none outline-hidden cursor-pointer font-bold text-[9px] underline text-[#0D7A5E] w-[95px]"
                              />
                            </div>
                          )}

                          {/* Tags block */}
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {task.tags.map((tg, idx) => (
                              <span key={idx} className="bg-[#EDEDED] text-[9px] px-1.5 py-0.5 rounded text-[#37352F] font-medium">
                                #{tg}
                              </span>
                            ))}
                          </div>

                          {/* Float interactive controller (Trash ONLY) */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white pl-1 rounded">
                            {/* Delete button (with Shift support) */}
                            <button
                              id={`btn-task-delete-${task.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (e.shiftKey) {
                                  handleDeleteTask(task.id);
                                } else {
                                  setDeleteConfirmTaskId(task.id);
                                  setDeleteConfirmTaskTitle(task.title || 'Tugas Tanpa Nama');
                                }
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Hapus Tugas (Tahan Shift untuk langsung menghapus)"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add action lane trigger */}
                  <button
                    id={`btn-add-column-task-${status}`}
                    onClick={() => handleAddTask(status)}
                    className="w-full text-center py-2 text-[11px] text-[#787774] hover:text-[#37352F] bg-white hover:bg-[#F1F1F1] border border-[#EBEBEB] border-dashed rounded transition-colors mt-3 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Kerja Di Sini
                  </button>
                </div>
              );
            })}
          </motion.div>
        ) : (
          /* TABULAR TABLE VIEW */
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border border-[#EBEBEB] rounded bg-white overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#37352F]">
                <thead className="bg-[#F7F7F5] text-[10px] uppercase font-bold tracking-wider text-[#787774] border-b border-[#EBEBEB]">
                  <tr>
                    <th className="px-4 py-2.5 min-w-[200px]">Nama Kerja Projek</th>
                    <th className="px-4 py-2.5 w-40">Aliran (Status)</th>
                    <th className="px-4 py-2.5 w-32">Prioritas</th>
                    <th className="px-4 py-2.5 w-36">Tenggat Waktu</th>
                    <th className="px-4 py-2.5 w-36">Tanggal Selesai</th>
                    <th className="px-4 py-2.5 w-40">Label Tags</th>
                    <th className="px-4 py-2.5 w-16 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB]">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-[#787774] italic">
                        Tidak ada tugas terdaftar. Klik "+ Tambah Kerja" di kanan atas.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map(task => (
                      <tr 
                        id={`table-row-${task.id}`}
                        key={task.id} 
                        className="hover:bg-[#F7F7F5]/50 group"
                      >
                        {/* Title input */}
                        <td className="px-4 py-2 font-medium">
                          <input
                            id={`table-title-input-${task.id}`}
                            type="text"
                            value={task.title}
                            onChange={(e) => updateRowField(task.id, 'title', e.target.value)}
                            className="w-full bg-transparent border-none text-[#37352F] outline-hidden font-medium focus:ring-1 focus:ring-[#337EA9] rounded px-1.5 py-0.5"
                          />
                        </td>

                        {/* Status selector */}
                        <td className="px-4 py-2">
                          <select
                            id={`table-status-select-${task.id}`}
                            value={task.status}
                            onChange={(e) => updateRowField(task.id, 'status', e.target.value as any)}
                            className={`text-[10px] font-bold px-2 py-1 border rounded cursor-pointer outline-hidden leading-tight ${STATUS_THEMES[task.status]}`}
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>

                        {/* Priority Selector */}
                        <td className="px-4 py-2">
                          <select
                            id={`table-priority-select-${task.id}`}
                            value={task.priority}
                            onChange={(e) => updateRowField(task.id, 'priority', e.target.value as any)}
                            className={`text-[10px] font-bold px-2 py-1 border rounded cursor-pointer outline-hidden leading-tight ${PRIORITY_THEMES[task.priority]}`}
                          >
                            {PRIORITIES.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </td>

                        {/* Date input */}
                        <td className="px-4 py-2">
                          <span className="flex items-center gap-1.5 font-mono text-[#37352F]">
                            <Calendar className="w-3.5 h-3.5 text-[#787774] shrink-0" />
                            <input
                              id={`table-date-input-${task.id}`}
                              type="date"
                              value={task.dueDate}
                              onChange={(e) => updateRowField(task.id, 'dueDate', e.target.value)}
                              className="bg-transparent border-none outline-hidden cursor-pointer text-xs"
                            />
                          </span>
                        </td>

                        {/* Completed Date input (editable if Completed, otherwise silent) */}
                        <td className="px-4 py-2">
                          {task.status === 'Completed' ? (
                            <span className="flex items-center gap-1.5 text-[#0D7A5E] font-medium">
                              <Check className="w-3.5 h-3.5 text-[#0D7A5E] shrink-0" />
                              <input
                                id={`table-completed-date-picker-${task.id}`}
                                type="date"
                                value={task.completedDate || ''}
                                onChange={(e) => updateRowField(task.id, 'completedDate', e.target.value)}
                                className="bg-transparent border-none outline-hidden cursor-pointer text-xs font-semibold text-[#0D7A5E] p-0 w-[95px]"
                              />
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#787774]/40 italic">- Belum Selesai -</span>
                          )}
                        </td>

                        {/* Tags selector */}
                        <td className="px-4 py-2 text-[#37352F]">
                          <span className="flex items-center gap-1 flex-wrap">
                            {task.tags.map((tg, idx) => (
                              <span key={idx} className="bg-[#EDEDED] text-[10px] px-1.5 py-0.5 rounded text-[#37352F] font-medium">
                                #{tg}
                              </span>
                            ))}
                          </span>
                        </td>

                        {/* Delete row (with Shift support) */}
                        <td className="px-4 py-2 text-right">
                          <button
                            id={`btn-table-delete-${task.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (e.shiftKey) {
                                handleDeleteTask(task.id);
                              } else {
                                setDeleteConfirmTaskId(task.id);
                                setDeleteConfirmTaskTitle(task.title || 'Tugas Tanpa Nama');
                              }
                            }}
                            className="p-1 rounded text-[#787774] hover:text-[#EB5757] hover:bg-[#FBEEEE] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer inline-block"
                            title="Hapus Tugas (Tahan Shift untuk langsung menghapus)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table total summation row */}
            <div className="p-3 bg-[#F7F7F5] border-t border-[#EBEBEB] text-[11px] text-[#787774] flex justify-between font-mono">
              <span>Jumlah Item Terdaftar: {filteredRows.length} Tugas</span>
              <span>Projek Selesai: {filteredRows.filter(r => r.status === 'Completed').length}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Delete Custom Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmTaskId && (
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
                  <h3 className="font-bold text-[13px] text-[#37352F]">Hapus Tugas Projek?</h3>
                  <p className="text-[#787774] leading-normal">
                    Apakah Anda yakin ingin menghapus tugas <strong className="text-[#37352F]">"{deleteConfirmTaskTitle}"</strong> dari database projek ini?
                  </p>
                  <div className="text-[10px] text-emerald-800 bg-emerald-50/50 p-1.5 rounded border border-emerald-100 flex items-center gap-1.5 mt-1 font-medium select-none">
                    <span>💡 Tip:</span> Tahan tombol <kbd className="font-mono bg-white border border-emerald-200/60 px-1 rounded shadow-3xs font-bold text-[9px] cursor-help">Shift</kbd> saat klik ikon Hapus untuk menghapus langsung tanpa konfirmasi ini.
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 text-[11px] font-semibold pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTaskId(null)}
                  className="px-3.5 py-1.5 rounded border border-[#EBEBEB] text-[#37352F] hover:bg-[#F7F7F5] cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteTask(deleteConfirmTaskId);
                    setDeleteConfirmTaskId(null);
                  }}
                  className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors"
                >
                  Hapus Tugas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
