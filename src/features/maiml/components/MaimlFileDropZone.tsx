// MaiML / XML ファイルを drag & drop または file picker で受け取る汎用 zone。
// - MAIML_MAX_BYTES (10 MB) の size guard
// - .maiml / .xml 拡張子チェック（厳密ではなく注意喚起レベル）
// - ファイル本文（string）+ filename を親に返す

import { useRef, useState } from 'react';
import { MAIML_MAX_BYTES } from '@/services/maiml';

interface MaimlFileDropZoneProps {
  onFileLoaded: (text: string, filename: string) => void;
  onError?: (message: string) => void;
  /** placeholder 表示（例: 「.maiml または .xml をドロップ」）*/
  hint?: string;
}

export const MaimlFileDropZone = ({ onFileLoaded, onError, hint }: MaimlFileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reportError = (message: string) => {
    if (onError) onError(message);
  };

  const handleFile = async (file: File) => {
    if (file.size > MAIML_MAX_BYTES) {
      reportError(`ファイルサイズが上限 (${(MAIML_MAX_BYTES / 1024 / 1024).toFixed(0)} MB) を超えています`);
      return;
    }
    try {
      const text = await file.text();
      onFileLoaded(text, file.name);
    } catch (e) {
      reportError(`読み込みエラー: ${(e as Error).message}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      aria-label="MaiML / XML ファイルをドロップまたはクリックで選択"
      className={`flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
        isDragging
          ? 'border-[var(--accent,#2563eb)] bg-[var(--accent-dim)]'
          : 'border-[var(--border-faint)] bg-[var(--bg-raised)] hover:bg-[var(--hover)]'
      }`}
    >
      <div className="text-[14px] font-semibold">
        {hint ?? 'MaiML / XML ファイルをドロップ、またはクリックで選択'}
      </div>
      <div className="text-[11px] text-[var(--text-lo)]">
        対応拡張子: .maiml / .xml（最大 {(MAIML_MAX_BYTES / 1024 / 1024).toFixed(0)} MB）
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".maiml,.xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // 同じファイルを連続で選べるように value をリセット
          e.target.value = '';
        }}
        className="hidden"
      />
    </div>
  );
};
