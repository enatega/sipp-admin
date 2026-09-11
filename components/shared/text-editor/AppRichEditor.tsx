'use client';

import { useEffect, useRef } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const toolbarButtonClass =
  'rounded-lg border bg-white p-2 transition hover:bg-gray-100';

export default function RichTextEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    if (editor.innerHTML !== value) {
      editor.innerHTML = value || '';
    }
  }, [value]);

  const syncContent = () => {
    onChange(editorRef.current?.innerHTML ?? '');
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    syncContent();
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter URL');

    if (!url) {
      return;
    }

    runCommand('createLink', url);
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 border-b bg-gray-50 p-3">
        <button
          type="button"
          onClick={() => runCommand('bold')}
          className={toolbarButtonClass}
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('italic')}
          className={toolbarButtonClass}
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('insertUnorderedList')}
          className={toolbarButtonClass}
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('insertOrderedList')}
          className={toolbarButtonClass}
        >
          <ListOrdered size={16} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('justifyLeft')}
          className={toolbarButtonClass}
        >
          <AlignLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('justifyCenter')}
          className={toolbarButtonClass}
        >
          <AlignCenter size={16} />
        </button>

        <button
          type="button"
          onClick={() => runCommand('justifyRight')}
          className={toolbarButtonClass}
        >
          <AlignRight size={16} />
        </button>

        <button
          type="button"
          onClick={handleInsertLink}
          className={toolbarButtonClass}
        >
          <LinkIcon size={16} />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-40 w-full p-4 outline-none"
        onInput={syncContent}
      />
    </div>
  );
}
