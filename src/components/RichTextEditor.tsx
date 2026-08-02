import React, { useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, RemoveFormatting, Link as LinkIcon
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  theme?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = '', className = '' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html === '<br>' ? '' : html);
    }
  };

  const executeCommand = (command: string, commandValue: string | undefined = undefined) => {
    document.execCommand(command, false, commandValue);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-slate-50 border-b border-slate-200 p-1.5 text-slate-700 select-none">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('strikeThrough')}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={handleLink}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition"
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className="p-3 outline-none min-h-[120px] max-h-[300px] overflow-y-auto text-slate-800 text-sm leading-relaxed"
      />
    </div>
  );
}
