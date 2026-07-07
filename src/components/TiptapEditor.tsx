import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Heading1 as H1Icon,
  Heading2 as H2Icon,
  Heading3 as H3Icon,
  List as BulletListIcon,
  ListOrdered as OrderedListIcon,
  ListTodo as ChecklistIcon,
  Quote as BlockquoteIcon,
  Code as CodeBlockIcon,
  Minus as DividerIcon,
  Type as TypeIcon,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';

// Convert Markdown to HTML helper for backwards-compatibility migration
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // Check if it's already HTML to avoid double processing
  if (/<[a-z][\s\S]*>/i.test(markdown)) {
    return markdown;
  }

  const lines = markdown.split('\n');
  let inList = false;
  let inNumList = false;
  let inBlockquote = false;
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check list transitions
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      const content = trimmed.substring(2);
      processedLines.push(`<li>${parseInlineMarkdown(content)}</li>`);
      continue;
    } else if (inList && !trimmed.startsWith('- ') && !trimmed.startsWith('* ')) {
      processedLines.push('</ul>');
      inList = false;
    }

    // Numbered list
    const numListMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numListMatch) {
      if (!inNumList) {
        processedLines.push('<ol>');
        inNumList = true;
      }
      const content = numListMatch[2];
      processedLines.push(`<li>${parseInlineMarkdown(content)}</li>`);
      continue;
    } else if (inNumList && !numListMatch) {
      processedLines.push('</ol>');
      inNumList = false;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      if (!inBlockquote) {
        processedLines.push('<blockquote>');
        inBlockquote = true;
      }
      const content = trimmed.substring(2);
      processedLines.push(`<p>${parseInlineMarkdown(content)}</p>`);
      continue;
    } else if (inBlockquote && !trimmed.startsWith('> ')) {
      processedLines.push('</blockquote>');
      inBlockquote = false;
    }

    // Horizontal divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      processedLines.push('<hr />');
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      processedLines.push(`<h1>${parseInlineMarkdown(trimmed.substring(2))}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      processedLines.push(`<h2>${parseInlineMarkdown(trimmed.substring(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      processedLines.push(`<h3>${parseInlineMarkdown(trimmed.substring(4))}</h3>`);
      continue;
    }

    // Regular paragraph
    if (trimmed === '') {
      processedLines.push('<p></p>');
    } else {
      processedLines.push(`<p>${parseInlineMarkdown(line)}</p>`);
    }
  }

  // Close any open lists/blocks at the end
  if (inList) processedLines.push('</ul>');
  if (inNumList) processedLines.push('</ol>');
  if (inBlockquote) processedLines.push('</blockquote>');

  return processedLines.join('');
}

function parseInlineMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text** or __text__)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  
  // Italic (*text* or _text_)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Code block `text`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  return html;
}

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value,
  onChange,
  placeholder = 'Catatan...'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        codeBlock: {}
      }),
      UnderlineExtension,
      TaskList,
      TaskItem.configure({
        nested: true,
      })
    ],
    content: convertMarkdownToHtml(value),
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-hidden min-h-[220px] max-h-[50vh] overflow-y-auto px-1 py-1 font-sans text-neutral-700 leading-relaxed text-xs break-words'
      }
    }
  });

  // Sync value changes from outside (e.g. date switch or cloud load)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const cleanIncomingHtml = convertMarkdownToHtml(value);
    
    // Simple normalization of empty contents to avoid infinite loops
    const isIncomingEmpty = !cleanIncomingHtml || cleanIncomingHtml === '<p></p>';
    const isCurrentEmpty = !currentHtml || currentHtml === '<p></p>';
    
    if (isIncomingEmpty && isCurrentEmpty) return;

    if (cleanIncomingHtml !== currentHtml) {
      editor.commands.setContent(cleanIncomingHtml);
    }
  }, [value, editor]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-xs text-neutral-400">
        Memuat editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Embedded Floating Rich WYSIWYG Format Popover (At the TOP to open downwards) */}
      <div className="flex justify-start w-full mb-3 select-none relative z-55" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium shadow-xs transition-all duration-150 cursor-pointer ${
            isDropdownOpen
              ? 'bg-neutral-950 border-neutral-950 text-white'
              : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
          }`}
          title="Format teks"
        >
          <TypeIcon className="w-3.5 h-3.5" />
          <span>Format</span>
          <ChevronDownIcon className={`w-3 h-3 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full mt-1.5 left-0 z-55 w-60 bg-white border border-neutral-200 shadow-lg rounded-xl py-1 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[300px] overflow-y-auto">
            {/* Group 1: Typography styles */}
            <div className="px-2.5 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider select-none">
              Judul & Teks
            </div>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('paragraph') && !editor.isActive('heading') ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <TypeIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Teks Biasa</span>
              </div>
              {editor.isActive('paragraph') && !editor.isActive('heading') && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('heading', { level: 1 }) ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <H1Icon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Judul Utama H1</span>
              </div>
              {editor.isActive('heading', { level: 1 }) && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('heading', { level: 2 }) ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <H2Icon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Judul H2</span>
              </div>
              {editor.isActive('heading', { level: 2 }) && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('heading', { level: 3 }) ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <H3Icon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Judul Kecil H3</span>
              </div>
              {editor.isActive('heading', { level: 3 }) && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <div className="h-px bg-neutral-100 my-1" />

            {/* Group 2: Inline formatting */}
            <div className="px-2.5 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider select-none">
              Gaya Tulisan
            </div>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleBold().run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('bold') ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <BoldIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-bold">Tebal</span>
              </div>
              {editor.isActive('bold') && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleItalic().run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('italic') ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <ItalicIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span className="italic">Miring</span>
              </div>
              {editor.isActive('italic') && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleUnderline().run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('underline') ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <UnderlineIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span className="underline">Garis Bawah</span>
              </div>
              {editor.isActive('underline') && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <div className="h-px bg-neutral-100 my-1" />

            {/* Group 3: Lists & Blocks */}
            <div className="px-2.5 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider select-none">
              Daftar & Blok
            </div>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleBulletList().run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('bulletList') ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <BulletListIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Daftar Bulatan</span>
              </div>
              {editor.isActive('bulletList') && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleOrderedList().run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('orderedList') ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <OrderedListIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Daftar Angka</span>
              </div>
              {editor.isActive('orderedList') && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleTaskList().run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('taskList') ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <ChecklistIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Checklist</span>
              </div>
              {editor.isActive('taskList') && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleBlockquote().run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('blockquote') ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <BlockquoteIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Kutipan (Blockquote)</span>
              </div>
              {editor.isActive('blockquote') && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().toggleCodeBlock().run();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${
                editor.isActive('codeBlock') ? 'text-neutral-900 font-medium bg-neutral-50/50' : 'text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <CodeBlockIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Blok Kode</span>
              </div>
              {editor.isActive('codeBlock') && (
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
              )}
            </button>

            <div className="h-px bg-neutral-100 my-1" />

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().setHorizontalRule().run();
                setIsDropdownOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <DividerIcon className="w-3.5 h-3.5 text-neutral-400" />
              <span>Garis Batas (Divider)</span>
            </button>
          </div>
        )}
      </div>

      {/* Editor Content Area (Placed below the formatting toolbar so popover drops downwards over it) */}
      <div className="flex-1 overflow-y-auto mt-1 min-h-[220px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
