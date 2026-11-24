import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  GripVertical,
  Lightbulb,
  RotateCcw,
  Shapes,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  CharacterReactionId,
  CycleId,
  ExplorerProfile,
  RoomData,
} from '../types/game';
import {
  ArtifactIconKey,
  RoomShadowChallenge,
  ShadowArtifact,
} from '../data/shadowMatchData';
import { getDifficultyProfile } from '../data/difficultyConfig';
import { CHARACTER_REACTION_META } from '../data/characterReactions';
import { ArtifactSvg } from './ArtifactSvg';
import { ExplorerReactionAvatar } from './ExplorerReactionAvatar';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface ShadowMatchModalProps {
  room: RoomData;
  challenge: RoomShadowChallenge;
  cycle: CycleId;
  explorer: ExplorerProfile;
  muted: boolean;
  voiceAuto: boolean;
  pictograms: boolean;
  alreadySolved: boolean;
  onReaction?: (reaction: CharacterReactionId, line?: string) => void;
  onSolved: () => void;
  onClose: () => void;
}

function buildDerangedOrder(items: ShadowArtifact[]): ShadowArtifact[] {
  const n = items.length;
  if (n <= 1) return [...items];
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const samePositions = arr.filter((item, idx) => item.id === items[idx].id).length;
  if (samePositions > 0) {
    // Clean cyclic shift guarantees zero items align with their starting slot
    return [...items.slice(1), items[0]];
  }
  return arr;
}

export const ShadowMatchModal: React.FC<ShadowMatchModalProps> = ({
  room,
  challenge,
  cycle,
  explorer,
  muted,
  voiceAuto,
  pictograms,
  alreadySolved,
  onReaction,
  onSolved,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocusTrap(dialogRef, true);

  const difficulty = getDifficultyProfile(cycle);
  const activeArtifacts = useMemo(
    () => challenge.artifacts.slice(0, difficulty.shadowPiecesCount),
    [challenge.artifacts, difficulty.shadowPiecesCount]
  );

  const speechAvailable = isSpeechSupported();

  const [silhouetteOrder, setSilhouetteOrder] = useState<ShadowArtifact[]>(() =>
    buildDerangedOrder(activeArtifacts)
  );
  const [matchedIds, setMatchedIds] = useState<ArtifactIconKey[]>(() =>
    alreadySolved ? activeArtifacts.map((a) => a.id) : []
  );
  const [selectedArtifactId, setSelectedArtifactId] =
    useState<ArtifactIconKey | null>(null);
  const [draggingId, setDraggingId] = useState<ArtifactIconKey | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<ArtifactIconKey | null>(
    null
  );
  const [hintTargetId, setHintTargetId] = useState<ArtifactIconKey | null>(
    null
  );
  const [wrongSlotId, setWrongSlotId] = useState<ArtifactIconKey | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'info' | 'success' | 'error';
    text: string;
  } | null>(null);
  const [avatarReaction, setAvatarReaction] = useState<CharacterReactionId>(
    alreadySolved ? 'alegria' : 'concentrado'
  );
  const [reactionPulse, setReactionPulse] = useState<number>(0);

  const triggerReaction = (next: CharacterReactionId) => {
    setAvatarReaction(next);
    setReactionPulse((k) => k + 1);
    onReaction?.(next);
  };

  const allMatched = matchedIds.length === activeArtifacts.length;

  useEffect(() => {
    if (voiceAuto && !alreadySolved) {
      speakText(
        `${challenge.title}. ${challenge.subtitle} (${activeArtifacts.length} piezas) para desbloquear una pista adicional de Gran Canaria.`,
        muted
      );
    }
    return () => stopSpeaking();
  }, [challenge, activeArtifacts.length, muted, voiceAuto, alreadySolved]);

  const remainingArtifacts = useMemo(
    () => activeArtifacts.filter((a) => !matchedIds.includes(a.id)),
    [activeArtifacts, matchedIds]
  );

  const attemptMatch = (
    artifactId: ArtifactIconKey,
    targetSlotId: ArtifactIconKey
  ) => {
    if (matchedIds.includes(targetSlotId)) return;

    if (artifactId === targetSlotId) {
      const matchedItem = activeArtifacts.find((a) => a.id === artifactId)!;
      const nextMatched = [...matchedIds, artifactId];
      setMatchedIds(nextMatched);
      setSelectedArtifactId(null);
      setDraggingId(null);
      setDragOverSlotId(null);
      setHintTargetId(null);
      setWrongSlotId(null);

      if (nextMatched.length === activeArtifacts.length) {
        soundEngine.playSuccess();
        triggerReaction('alegria');
        setFeedback({
          type: 'success',
          text: `¡Encaje perfecto! Has completado las ${activeArtifacts.length} siluetas y desbloqueado la pista adicional de ${room.title}.`,
        });
        onSolved();
      } else {
        soundEngine.playDiscover();
        triggerReaction('sorpresa');
        setFeedback({
          type: 'success',
          text: `¡Muy bien! ${matchedItem.name}: ${matchedItem.shortFact}`,
        });
      }
    } else {
      const targetItem = activeArtifacts.find((a) => a.id === targetSlotId);
      soundEngine.playGentleError();
      triggerReaction('animo');
      setWrongSlotId(targetSlotId);
      setDragOverSlotId(null);
      setFeedback({
        type: 'error',
        text: difficulty.shadowShowCardCue
          ? `Esa silueta no coincide todavía. Observa bien su forma: ${
              targetItem?.silhouetteCue ?? 'compara los bordes con calma.'
            }`
          : 'Esa silueta no coincide todavía. Compara bien el contorno exterior de los artefactos.',
      });
      window.setTimeout(() => {
        setWrongSlotId((curr) => (curr === targetSlotId ? null : curr));
      }, 650);
    }
  };

  const handleVisualHint = () => {
    const nextUnmatched = remainingArtifacts[0];
    if (!nextUnmatched) return;
    soundEngine.playPowerUp();
    triggerReaction('sorpresa');
    setSelectedArtifactId(nextUnmatched.id);
    setHintTargetId(nextUnmatched.id);
    setFeedback({
      type: 'info',
      text: `Pista visual: observa «${nextUnmatched.name}» (${nextUnmatched.silhouetteCue.toLowerCase()}) y llévalo a la silueta iluminada en dorado.`,
    });
  };

  const handleReplay = () => {
    soundEngine.playClick();
    triggerReaction('concentrado');
    setSilhouetteOrder(buildDerangedOrder(activeArtifacts));
    setMatchedIds([]);
    setSelectedArtifactId(null);
    setDraggingId(null);
    setDragOverSlotId(null);
    setHintTargetId(null);
    setWrongSlotId(null);
    setFeedback(null);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shadow-match-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/88 p-3 sm:p-5"
    >
      <div className="flex max-h-[93vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Archival Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <ExplorerReactionAvatar
              explorerId={explorer.id}
              explorerName={explorer.name}
              reaction={avatarReaction}
              pulseKey={reactionPulse}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-[#526071]">
                <span className="inline-flex items-center gap-1.5 font-bold text-[#8A5410]">
                  <Shapes className="h-3.5 w-3.5 text-[#C67D1E]" aria-hidden="true" />
                  <span>Juego de Sombras · Sala {room.number}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-bold ${CHARACTER_REACTION_META[avatarReaction].lightTextClass}`}
                >
                  {explorer.name}: {CHARACTER_REACTION_META[avatarReaction].label}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#1D4E89] tabular-nums">
                  {matchedIds.length}/{activeArtifacts.length} piezas ·{' '}
                  {difficulty.levelName}
                </span>
              </div>
              <h2
                id="shadow-match-title"
                className="mt-0.5 font-display text-xl font-bold text-[#171B21] sm:text-2xl"
              >
                {challenge.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {speechAvailable && (
              <button
                type="button"
                onClick={() =>
                  speakText(
                    allMatched
                      ? `${challenge.unlockedClueTitle}. ${challenge.unlockedClueText[cycle]}`
                      : `${challenge.title}. ${challenge.subtitle}. Arrastra o toca cada artefacto histórico y colócalo sobre su sombra correspondiente.`,
                    muted
                  )
                }
                title="Escuchar en voz alta"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#232A34]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#1D4E89] hover:border-[#1D4E89] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Escuchar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar Juego de Sombras"
              className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] shrink-0 cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Instruction & Helper Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#232A34]/12 bg-[#EFECE4] px-5 py-2.5 sm:px-6 text-xs">
          <p className="text-[#333D4B]">
            {pictograms && (
              <span className="mr-2 font-semibold text-[#1D4E89]">
                👀 Observa la sombra → ✋ Arrastra o toca el objeto → ✨ Desbloquea pista
              </span>
            )}
            {!pictograms && (
              <span>
                <strong>Arrastra</strong> cada artefacto histórico hasta su
                silueta exacta (o <strong>tócalo</strong> y luego toca su
                sombra) para revelar una pista adicional de Gran Canaria.
              </span>
            )}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            {!allMatched && (
              <button
                type="button"
                onClick={handleVisualHint}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#C67D1E]/55 bg-[#FAF4E8] px-3 py-1.5 text-xs font-bold text-[#8A5410] hover:bg-[#F5E8CC] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Pista visual</span>
              </button>
            )}
            {allMatched && (
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#232A34]/15 bg-white px-3 py-1.5 text-xs font-bold text-[#333D4B] hover:border-[#232A34] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Jugar de nuevo</span>
              </button>
            )}
          </div>
        </div>

        {/* Playable Workspace */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-5">
          {/* Unlocked Extra Historical Clue Card (appears prominently once all 4 shadows match) */}
          {allMatched && (
            <section
              aria-live="polite"
              className="rounded-xl border border-[#C67D1E]/65 bg-[#FAF4E8] p-5 shadow-xs space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8A5410]">
                  <Sparkles className="h-4 w-4 text-[#C67D1E]" aria-hidden="true" />
                  <span>¡Pista adicional de Gran Canaria desbloqueada!</span>
                </div>
                {speechAvailable && (
                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        `${challenge.unlockedClueTitle}. ${challenge.unlockedClueText[cycle]} ${challenge.historicalConnection}`,
                        muted
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-[#C67D1E]/45 bg-white px-2.5 py-1 text-xs font-bold text-[#8A5410] hover:bg-[#F5E8CC] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Escuchar pista</span>
                  </button>
                )}
              </div>

              <h3 className="font-display text-lg font-bold text-[#171B21]">
                {challenge.unlockedClueTitle}
              </h3>
              <p className="text-sm leading-relaxed text-[#232A34]">
                {challenge.unlockedClueText[cycle]}
              </p>
              <p className="border-t border-[#C67D1E]/20 pt-2 text-xs leading-relaxed text-[#526071]">
                <strong>Conexión con tu isla hoy:</strong>{' '}
                {challenge.historicalConnection}
              </p>
            </section>
          )}

          {/* Feedback line */}
          {feedback && !allMatched && (
            <div
              role="status"
              className={`rounded-xl border px-4 py-2.5 text-xs font-medium ${
                feedback.type === 'success'
                  ? 'border-[#2A6F4E]/45 bg-[#E8F3EC] text-[#1D543A]'
                  : feedback.type === 'error'
                  ? 'border-[#A43D2F]/35 bg-[#F8E5E2] text-[#7D2B20]'
                  : 'border-[#1D4E89]/35 bg-[#E8F0FA] text-[#153A68]'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Two-Zone Matching Stage: Draggable Artifacts + Shadow Silhouettes */}
          <div className="grid gap-5 lg:grid-cols-12 items-start">
            {/* Left Zone: Artifact Tray */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex items-baseline justify-between text-xs">
                <h3 className="font-bold text-[#171B21]">
                  1. Artefactos históricos
                </h3>
                <span className="font-mono text-[#526071] tabular-nums">
                  {remainingArtifacts.length} por colocar
                </span>
              </div>

              {remainingArtifacts.length === 0 ? (
                <div className="rounded-xl border border-[#2A6F4E]/40 bg-[#E8F3EC] p-5 text-center space-y-1.5">
                  <CheckCircle2
                    className="mx-auto h-7 w-7 text-[#2A6F4E]"
                    aria-hidden="true"
                  />
                  <div className="text-sm font-bold text-[#1D543A]">
                    ¡Todos los artefactos colocados!
                  </div>
                  <p className="text-xs text-[#3D4754]">
                    Puedes revisar cada ficha en el tablero de siluetas o volver
                    a jugar cuando quieras.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {remainingArtifacts.map((artifact) => {
                    const isSelected = selectedArtifactId === artifact.id;
                    const isDragging = draggingId === artifact.id;
                    const isHinted = hintTargetId === artifact.id;
                    return (
                      <button
                        key={artifact.id}
                        type="button"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', artifact.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggingId(artifact.id);
                          setSelectedArtifactId(artifact.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDragOverSlotId(null);
                        }}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedArtifactId((prev) =>
                            prev === artifact.id ? null : artifact.id
                          );
                        }}
                        aria-pressed={isSelected}
                        className={`group flex flex-col items-center rounded-xl border p-3.5 text-center transition-transform duration-150 cursor-grab active:cursor-grabbing ${
                          isSelected || isHinted
                            ? 'border-[#C67D1E] bg-[#FAF4E8] ring-2 ring-[#C67D1E]/45 -translate-y-0.5'
                            : 'border-[#232A34]/15 bg-white hover:border-[#1D4E89] hover:-translate-y-0.5'
                        } ${isDragging ? 'opacity-55 scale-95' : ''}`}
                      >
                        <div className="flex w-full items-center justify-between text-[10px] text-[#6B7482]">
                          <span className="font-mono">
                            {isSelected ? 'Seleccionado' : 'Arrastra'}
                          </span>
                          <GripVertical
                            className="h-3.5 w-3.5 text-[#9AA3B0]"
                            aria-hidden="true"
                          />
                        </div>
                        <ArtifactSvg
                          artifactId={artifact.id}
                          silhouette={false}
                          className="my-1.5 h-20 w-20 transition-transform duration-150 group-hover:scale-105"
                        />
                        <span className="text-xs font-bold text-[#171B21] leading-snug">
                          {artifact.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Zone: Shadow Silhouettes Board */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="flex items-baseline justify-between text-xs">
                <h3 className="font-bold text-[#171B21]">
                  2. Tablero de siluetas
                </h3>
                <span className="text-[#526071]">
                  {selectedArtifactId
                    ? 'Toca la sombra que encaja con tu pieza seleccionada'
                    : 'Suelta aquí cada artefacto en su sombra'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {silhouetteOrder.map((slot) => {
                  const isMatched = matchedIds.includes(slot.id);
                  const isDragHover = dragOverSlotId === slot.id && !isMatched;
                  const isHinted = hintTargetId === slot.id && !isMatched;
                  const isWrong = wrongSlotId === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isMatched}
                      onDragOver={(e) => {
                        if (isMatched) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverSlotId !== slot.id) {
                          setDragOverSlotId(slot.id);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverSlotId === slot.id) {
                          setDragOverSlotId(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const droppedId = (e.dataTransfer.getData('text/plain') ||
                          draggingId ||
                          selectedArtifactId) as ArtifactIconKey | '';
                        if (droppedId) {
                          attemptMatch(droppedId, slot.id);
                        }
                      }}
                      onClick={() => {
                        if (isMatched) return;
                        if (selectedArtifactId) {
                          attemptMatch(selectedArtifactId, slot.id);
                        } else {
                          soundEngine.playClick();
                          setFeedback({
                            type: 'info',
                            text: `Primero selecciona o arrastra un artefacto de la izquierda. Pista de esta silueta: ${slot.silhouetteCue}`,
                          });
                        }
                      }}
                      aria-label={
                        isMatched
                          ? `${slot.name} encajado correctamente`
                          : `Silueta misteriosa: ${slot.silhouetteCue}`
                      }
                      className={`relative flex flex-col items-center justify-between rounded-xl border-2 p-4 text-center transition-all duration-150 min-h-[178px] ${
                        isMatched
                          ? 'border-[#2A6F4E]/60 bg-[#E8F3EC] cursor-default'
                          : isWrong
                          ? 'border-[#A43D2F] bg-[#F8E5E2] scale-[0.98]'
                          : isDragHover || isHinted
                          ? 'border-dashed border-[#C67D1E] bg-[#FAF4E8] scale-[1.02] cursor-pointer'
                          : selectedArtifactId
                          ? 'border-dashed border-[#1D4E89]/60 bg-white hover:border-[#C67D1E] hover:bg-[#FAF4E8] cursor-pointer'
                          : 'border-dashed border-[#232A34]/28 bg-[#EAE6DC]/75 cursor-pointer'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between text-[11px]">
                        <span
                          className={`font-mono font-semibold ${
                            isMatched
                              ? 'text-[#1D543A]'
                              : isHinted
                              ? 'text-[#8A5410]'
                              : 'text-[#526071]'
                          }`}
                        >
                          {isMatched
                            ? 'Encajado ✓'
                            : isHinted
                            ? '¡Aquí encaja!'
                            : 'Silueta'}
                        </span>
                        {isMatched && (
                          <CheckCircle2
                            className="h-4 w-4 text-[#2A6F4E]"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <ArtifactSvg
                        artifactId={slot.id}
                        silhouette={!isMatched}
                        className={`my-1.5 h-22 w-22 transition-transform duration-200 ${
                          isDragHover ? 'scale-108' : ''
                        }`}
                      />

                      {isMatched ? (
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-[#171B21]">
                            {slot.name}
                          </div>
                          <p className="text-[11px] leading-snug text-[#2D4739]">
                            {slot.shortFact}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] leading-snug text-[#526071]">
                          {isDragHover
                            ? 'Suelta para comprobar'
                            : difficulty.shadowShowCardCue
                            ? slot.silhouetteCue
                            : 'Observa el contorno y arrastra aquí la pieza'}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-5 py-3 sm:px-6">
          <span className="text-xs text-[#526071]">
            {allMatched
              ? 'Pista adicional guardada en esta sala.'
              : `Completa las ${activeArtifacts.length} siluetas (${difficulty.cycleLabel}) para revelar una pista histórica extra.`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#232A34] px-5 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Volver a la sala
          </button>
        </div>
      </div>
    </div>
  );
};
