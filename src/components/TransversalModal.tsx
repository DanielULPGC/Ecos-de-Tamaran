import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Globe2, Sparkles, Volume2, X } from 'lucide-react';
import {
  CharacterReactionId,
  CycleId,
  ExplorerProfile,
  TransversalMission,
} from '../types/game';
import { CHARACTER_REACTION_META } from '../data/characterReactions';
import { ExplorerReactionAvatar } from './ExplorerReactionAvatar';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface TransversalModalProps {
  mission: TransversalMission;
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

export const TransversalModal: React.FC<TransversalModalProps> = ({
  mission,
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
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(dialogRef, true);
  const speechAvailable = isSpeechSupported();
  const [selectedId, setSelectedId] = useState<string>(() =>
    alreadySolved
      ? mission.options.find((o) => o.isBest)?.id ?? ''
      : ''
  );
  const [solved, setSolved] = useState<boolean>(alreadySolved);
  const [avatarReaction, setAvatarReaction] = useState<CharacterReactionId>(
    alreadySolved ? 'alegria' : 'concentrado'
  );
  const [reactionPulse, setReactionPulse] = useState<number>(0);

  const triggerReaction = (next: CharacterReactionId) => {
    setAvatarReaction(next);
    setReactionPulse((k) => k + 1);
    onReaction?.(next);
  };

  useEffect(() => {
    if (voiceAuto && !alreadySolved) {
      speakText(
        `Misión transversal: ${mission.title}. ${mission.story[cycle]} ${mission.question}`,
        muted
      );
    }
    return () => stopSpeaking();
  }, [mission, cycle, muted, voiceAuto, alreadySolved]);

  const handlePickOption = (optionId: string, isBest: boolean) => {
    setSelectedId(optionId);
    if (isBest) {
      triggerReaction('alegria');
      if (!solved) {
        setSolved(true);
        soundEngine.playSuccess();
        onSolved();
      } else {
        soundEngine.playDiscover();
      }
    } else {
      soundEngine.playGentleError();
      triggerReaction('animo');
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transversal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/84 p-3 sm:p-5"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#E1EFE8] px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <ExplorerReactionAvatar
              explorerId={explorer.id}
              explorerName={explorer.name}
              reaction={avatarReaction}
              pulseKey={reactionPulse}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#1D543A]">
                <Globe2 className="h-4 w-4" aria-hidden="true" />
                <span>{mission.axis}</span>
                <span aria-hidden="true">·</span>
                <span>{mission.odsTag}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    CHARACTER_REACTION_META[avatarReaction].lightTextClass
                  }
                >
                  {explorer.name}: {CHARACTER_REACTION_META[avatarReaction].label}
                </span>
              </div>
              <h2
                id="transversal-modal-title"
                className="mt-1 font-display text-xl font-bold text-[#171B21] sm:text-2xl"
              >
                {mission.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {speechAvailable && (
              <button
                type="button"
                onClick={() =>
                  speakText(
                    `${mission.title}. ${mission.story[cycle]} ${mission.question}`,
                    muted
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#2A6F4E]/35 bg-white px-2.5 py-1.5 text-xs font-bold text-[#1D543A] hover:bg-[#F4F8F6] cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Escuchar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar misión transversal"
              className="rounded-lg p-2 text-[#333D4B] hover:bg-[#232A34]/10 cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {pictograms && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2A6F4E]/25 bg-white px-4 py-2.5 text-xs font-bold text-[#1D543A]">
              <span>👀 Lee o escucha</span>
              <span aria-hidden="true">→</span>
              <span>💡 Conecta pasado y hoy</span>
              <span aria-hidden="true">→</span>
              <span>✅ Elige la acción justa</span>
            </div>
          )}

          <p className="text-[15px] leading-relaxed text-[#232A34] rounded-xl border border-[#232A34]/12 bg-white p-4">
            {mission.story[cycle]}
          </p>

          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-[#171B21]">
              {mission.question}
            </h3>

            {mission.options.map((opt) => {
              const active = selectedId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePickOption(opt.id, opt.isBest)}
                  className={`w-full rounded-xl border-2 p-3.5 text-left transition-colors cursor-pointer ${
                    active
                      ? opt.isBest
                        ? 'border-[#2A6F4E] bg-[#E1EFE8] text-[#171B21]'
                        : 'border-[#C67D1E] bg-[#F6EAD7] text-[#171B21]'
                      : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#1D4E89]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 text-sm font-semibold">
                    <span>{opt.label}</span>
                    {active && opt.isBest && (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-[#2A6F4E] mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  {active && (
                    <p
                      className={`mt-1.5 text-xs font-semibold ${
                        opt.isBest ? 'text-[#1D543A]' : 'text-[#7A490C]'
                      }`}
                    >
                      {opt.feedback}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {solved && (
            <div className="rounded-xl border border-[#C67D1E]/40 bg-[#FAF4E8] p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8A5410]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>Misión transversal completada · Acción para el aula</span>
              </div>
              <p className="text-sm font-medium text-[#232A34]">
                {mission.actionTip}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#232A34] px-5 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] cursor-pointer"
          >
            {solved ? '¡Volver a la sala!' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
