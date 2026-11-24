import React, { useState } from 'react';
import { Check, Pencil, StickyNote as StickyNoteIcon, Trash2, X } from 'lucide-react';
import { RoomId, StickyNote, StickyNoteColor } from '../types/game';
import { soundEngine } from '../utils/audio';

export const STICKY_EMOJIS: { emoji: string; label: string }[] = [
  { emoji: '🤝', label: 'Empatía' },
  { emoji: '😊', label: 'Alegría' },
  { emoji: '😌', label: 'Calma' },
  { emoji: '💪', label: 'Valentía' },
  { emoji: '😮', label: 'Asombro' },
  { emoji: '😟', label: 'Preocupación' },
  { emoji: '🥹', label: 'Añoranza' },
  { emoji: '❤️', label: 'Cariño' },
];

export const STICKY_COLORS: {
  id: StickyNoteColor;
  label: string;
  bg: string;
  border: string;
  text: string;
  fold: string;
  swatch: string;
}[] = [
  {
    id: 'ochre',
    label: 'Sol canario',
    bg: 'bg-[#FFF3C4]',
    border: 'border-[#DFB94C]',
    text: 'text-[#473307]',
    fold: '#EBD077',
    swatch: '#F7D774',
  },
  {
    id: 'laurel',
    label: 'Laurisilva',
    bg: 'bg-[#DCF2E5]',
    border: 'border-[#73B58E]',
    text: 'text-[#15402A]',
    fold: '#A5D6B9',
    swatch: '#93CFA9',
  },
  {
    id: 'sky',
    label: 'Atlántico',
    bg: 'bg-[#DFEEFB]',
    border: 'border-[#74A7D6]',
    text: 'text-[#153658]',
    fold: '#A9CEE9',
    swatch: '#97C4E8',
  },
  {
    id: 'coral',
    label: 'Tierra roja',
    bg: 'bg-[#FBE2DA]',
    border: 'border-[#DC937B]',
    text: 'text-[#5A2315]',
    fold: '#EDB5A3',
    swatch: '#EDAA94',
  },
];

const ROOM_WORD_SUGGESTIONS: Record<RoomId, string[]> = {
  aborigenes: ['Compartir', 'Justicia', 'Equipo', 'Cuidar', 'Unión'],
  conquista: ['Respeto', 'Escuchar', 'Paz', 'Diálogo', 'Verdad'],
  pirateria: ['Calma', 'Valentía', 'Ayuda', 'Cuidado', 'Confianza'],
  sigloXX: ['Acogida', 'Memoria', 'Amistad', 'Agua', 'Hogar'],
};

export function getStickyTheme(color: StickyNoteColor) {
  return STICKY_COLORS.find((c) => c.id === color) ?? STICKY_COLORS[0];
}

export function sanitizeSingleWord(raw: string): string {
  // Keep only the first contiguous word (letters, accents, hyphens allowed inside a word)
  const trimmed = raw.trimStart();
  const firstToken = trimmed.split(/\s+/)[0] ?? '';
  return firstToken.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ-]/g, '').slice(0, 18);
}

interface StickyNoteCardProps {
  note: StickyNote;
  compact?: boolean;
  onEdit?: () => void;
  roomLabel?: string;
}

export const StickyNoteCard: React.FC<StickyNoteCardProps> = ({
  note,
  compact = false,
  onEdit,
  roomLabel,
}) => {
  const theme = getStickyTheme(note.color);

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center rounded-sm border shadow-md transition-transform duration-150 -rotate-1 hover:rotate-0 ${theme.bg} ${theme.border} ${theme.text} ${
        compact ? 'min-w-[112px] px-3 py-2.5' : 'min-w-[144px] px-4 py-3.5'
      }`}
    >
      {/* Subtle archival masking tape strip at top */}
      <span
        aria-hidden="true"
        className="absolute -top-2 left-1/2 h-3.5 w-10 -translate-x-1/2 rounded-[2px] bg-[#F5F3EE]/80 border border-[#232A34]/12 shadow-xs"
      />

      {roomLabel && (
        <span className="text-[10px] font-mono opacity-75 mb-0.5 truncate max-w-[120px]">
          {roomLabel}
        </span>
      )}

      <span
        className={compact ? 'text-2xl leading-none' : 'text-3xl leading-none'}
        role="img"
        aria-label={`Emoción: ${note.emoji}`}
      >
        {note.emoji}
      </span>

      <span
        className={`mt-1.5 font-display font-bold tracking-tight text-center break-words ${
          compact ? 'text-sm' : 'text-base'
        }`}
      >
        {note.word}
      </span>

      {/* Subtle folded paper corner */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-3.5 w-3.5"
        style={{
          background: `linear-gradient(135deg, ${theme.fold} 50%, rgba(0,0,0,0.06) 50%)`,
        }}
      />

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Editar pega-nota"
          title="Editar pega-nota"
          className="no-print absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-[#232A34]/20 bg-white text-[#232A34] shadow-sm transition-colors hover:bg-[#1D4E89] hover:text-white cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

interface StickyNoteEditorProps {
  roomId: RoomId;
  initialNote?: StickyNote;
  onSave: (note: StickyNote) => void;
  onRemove?: () => void;
  onCancel?: () => void;
  compactMode?: boolean;
}

export const StickyNoteEditor: React.FC<StickyNoteEditorProps> = ({
  roomId,
  initialNote,
  onSave,
  onRemove,
  onCancel,
  compactMode = false,
}) => {
  const [word, setWord] = useState<string>(initialNote?.word ?? '');
  const [emoji, setEmoji] = useState<string>(initialNote?.emoji ?? '🤝');
  const [color, setColor] = useState<StickyNoteColor>(
    initialNote?.color ?? 'ochre'
  );
  const [error, setError] = useState<string | null>(null);

  const suggestions = ROOM_WORD_SUGGESTIONS[roomId] ?? ROOM_WORD_SUGGESTIONS.aborigenes;

  const handleWordChange = (value: string) => {
    setError(null);
    if (value.includes(' ')) {
      setError('La pega-nota resume tu reflexión en una sola palabra (sin espacios).');
    }
    setWord(sanitizeSingleWord(value));
  };

  const handleSubmit = () => {
    const clean = sanitizeSingleWord(word);
    if (clean.length < 2) {
      soundEngine.playGentleError();
      setError('Escribe o toca una palabra para tu pega-nota.');
      return;
    }
    soundEngine.playDiscover();
    onSave({
      word: clean.charAt(0).toUpperCase() + clean.slice(1),
      emoji,
      color,
    });
  };

  return (
    <div className="rounded-xl border border-[#232A34]/15 bg-[#FAF8F4] p-4 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#171B21]">
          <StickyNoteIcon className="h-4 w-4 text-[#C67D1E]" aria-hidden="true" />
          <span>Pega-nota digital (1 palabra + emoji de emoción)</span>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancelar edición de pega-nota"
            className="rounded-md p-1 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div
        className={`grid gap-4 items-center ${
          compactMode ? 'sm:grid-cols-[1fr_auto]' : 'md:grid-cols-[1fr_auto]'
        }`}
      >
        <div className="space-y-3">
          {/* 1. Emoji picker */}
          <div>
            <span className="block text-xs font-semibold text-[#526071] mb-1.5">
              1. Elige el emoji de la emoción que sentiste
            </span>
            <div className="flex flex-wrap gap-1.5">
              {STICKY_EMOJIS.map((item) => {
                const active = emoji === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => {
                      soundEngine.playStep();
                      setEmoji(item.emoji);
                    }}
                    aria-pressed={active}
                    title={item.label}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-transform duration-150 active:scale-95 cursor-pointer ${
                      active
                        ? 'border-[#1D4E89] bg-[#E8F0FA] text-[#171B21]'
                        : 'border-[#232A34]/15 bg-white text-[#3E4856] hover:border-[#1D4E89]'
                    }`}
                  >
                    <span className="text-base leading-none">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Single word input + quick 1-word chips */}
          <div>
            <label
              htmlFor={`sticky-word-${roomId}`}
              className="block text-xs font-semibold text-[#526071] mb-1.5"
            >
              2. Resume tu reflexión en una sola palabra
            </label>
            <input
              id={`sticky-word-${roomId}`}
              type="text"
              maxLength={18}
              value={word}
              onChange={(e) => handleWordChange(e.target.value)}
              placeholder="Ej. Respeto, Calma, Justicia..."
              className="w-full rounded-lg border border-[#232A34]/20 bg-white px-3 py-2 text-sm font-semibold text-[#171B21] placeholder:font-normal placeholder:text-[#7D8794] focus:border-[#1D4E89]"
            />

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[#6B7482]">Ideas rápidas:</span>
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setWord(sug);
                    setError(null);
                  }}
                  className="rounded-md border border-[#232A34]/15 bg-white px-2.5 py-1 text-xs font-medium text-[#232A34] hover:border-[#C67D1E] hover:bg-[#FAF4E8] cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Paper color picker */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#526071]">
              3. Color del papel:
            </span>
            {STICKY_COLORS.map((c) => {
              const active = color === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setColor(c.id);
                  }}
                  aria-label={`Color ${c.label}`}
                  aria-pressed={active}
                  className={`flex h-7 w-7 items-center justify-center rounded-md border-2 transition-transform cursor-pointer ${
                    active
                      ? 'border-[#171B21] scale-110'
                      : 'border-[#232A34]/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.swatch }}
                >
                  {active && (
                    <Check className="h-3.5 w-3.5 text-[#171B21]" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Post-it Preview */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#232A34]/18 bg-[#EFECE4]/60 px-5 py-4">
          <span className="text-[11px] font-mono text-[#526071] mb-3">
            Vista previa
          </span>
          <StickyNoteCard
            note={{
              word: word || 'Tu palabra',
              emoji,
              color,
            }}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs font-semibold text-[#9C3B2B]">
          {error}
        </p>
      )}

      {/* Save / Remove actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#232A34]/10 pt-3">
        <div>
          {initialNote && onRemove && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onRemove();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#8A3B1E] hover:bg-[#F8E5E2] cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Quitar pega-nota</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[#232A34]/20 bg-white px-3.5 py-2 text-xs font-semibold text-[#3E4856] hover:bg-[#EAE6DC] cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4E89] px-4 py-2 text-xs font-bold text-white hover:bg-[#153A68] whitespace-nowrap cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Pegar en el diario</span>
          </button>
        </div>
      </div>
    </div>
  );
};
