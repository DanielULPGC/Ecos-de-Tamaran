import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  PenLine,
  Plus,
  Scale,
  Sparkles,
  StickyNote as StickyNoteIcon,
  Volume2,
  X,
} from 'lucide-react';
import {
  CharacterReactionId,
  CycleId,
  EmpathyDilemma,
  ExplorerProfile,
  JournalEntry,
  RoomData,
  StickyNote,
} from '../types/game';
import { CHARACTER_REACTION_META } from '../data/characterReactions';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';
import { EmotionFaceSvg } from './EmotionFaceSvg';
import { ExplorerReactionAvatar } from './ExplorerReactionAvatar';
import { StickyNoteCard, StickyNoteEditor } from './StickyNoteWidget';

interface EmpathyModalProps {
  room: RoomData;
  dilemma: EmpathyDilemma;
  cycle: CycleId;
  explorer: ExplorerProfile;
  muted: boolean;
  voiceAuto: boolean;
  existingEntry?: JournalEntry;
  onReaction?: (reaction: CharacterReactionId, line?: string) => void;
  onComplete: (entry: JournalEntry) => void;
  onClose: () => void;
}

export const EmpathyModal: React.FC<EmpathyModalProps> = ({
  room,
  dilemma,
  cycle,
  explorer,
  muted,
  voiceAuto,
  existingEntry,
  onReaction,
  onComplete,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(dialogRef, true);
  const speechAvailable = isSpeechSupported();
  const activeCriticalChoices =
    cycle === 'ciclo3' && dilemma.criticalChoicesCiclo3
      ? dilemma.criticalChoicesCiclo3
      : dilemma.criticalChoices;
  const [step, setStep] = useState<1 | 2 | 3>(existingEntry ? 3 : 1);
  const [avatarReaction, setAvatarReaction] = useState<CharacterReactionId>(
    existingEntry ? 'alegria' : 'concentrado'
  );
  const [reactionPulse, setReactionPulse] = useState<number>(0);

  const triggerReaction = (next: CharacterReactionId) => {
    setAvatarReaction(next);
    setReactionPulse((k) => k + 1);
    onReaction?.(next);
  };
  const [adayCompassOn, setAdayCompassOn] = useState<boolean>(
    explorer.id === 'aday'
  );

  const [emotionId, setEmotionId] = useState<string>(() => {
    if (existingEntry) {
      const found = dilemma.emotionChoices.find(
        (e) => e.label === existingEntry.emotionSelected
      );
      return found ? found.id : dilemma.emotionChoices[0].id;
    }
    return '';
  });
  const [criticalId, setCriticalId] = useState<string>(() => {
    if (existingEntry) {
      const found = activeCriticalChoices.find((c) => c.isBest);
      return found ? found.id : '';
    }
    return '';
  });
  const [decisionId, setDecisionId] = useState<string>(() => {
    if (existingEntry) {
      const found = dilemma.decisionChoices.find(
        (d) => d.label === existingEntry.decisionLabel
      );
      return found ? found.id : dilemma.decisionChoices[0].id;
    }
    return '';
  });
  const [reflectionText, setReflectionText] = useState<string>(
    existingEntry?.reflectionText ?? ''
  );
  const [stickyNote, setStickyNote] = useState<StickyNote | undefined>(
    existingEntry?.stickyNote
  );
  const [showStickyEditor, setShowStickyEditor] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (voiceAuto) {
      if (step === 1) {
        const v1 = dilemma.voices[0];
        const v2 = dilemma.voices[1];
        speakText(
          `${dilemma.title}. ${v1.name} dice: ${v1.quote[cycle]}. ${v2.name} dice: ${v2.quote[cycle]}`,
          muted
        );
      } else if (step === 2) {
        speakText(
          `${dilemma.emotionPrompt} ${dilemma.criticalQuestion[cycle]}`,
          muted
        );
      } else {
        speakText(dilemma.decisionPrompt, muted);
      }
    }
    return () => stopSpeaking();
  }, [step, dilemma, cycle, muted, voiceAuto]);

  const selectedEmotion = dilemma.emotionChoices.find((e) => e.id === emotionId);
  const selectedCritical = activeCriticalChoices.find(
    (c) => c.id === criticalId
  );
  const selectedDecision = dilemma.decisionChoices.find(
    (d) => d.id === decisionId
  );

  const handleGoToStep3 = () => {
    if (!emotionId || !criticalId) {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setNotice('Toca una cara de emoción y una respuesta antes de continuar.');
      return;
    }
    if (!selectedCritical?.isBest) {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setNotice('Lee la pista de abajo y prueba la opción que mejor combina datos y respeto.');
      return;
    }
    setNotice(null);
    soundEngine.playStep();
    triggerReaction('sorpresa');
    setStep(3);
  };

  const handleSaveJournal = () => {
    if (!selectedDecision) {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setNotice('Elige una propuesta para resolver este dilema.');
      return;
    }
    const trimmed = reflectionText.trim();
    if (trimmed.length < 8) {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setNotice(
        'Toca una ficha rápida de reflexión o escribe una frase corta para sellar el diario.'
      );
      return;
    }

    soundEngine.playSuccess();
    triggerReaction('alegria');
    onComplete({
      roomId: room.id,
      roomTitle: room.title,
      epoch: room.epoch,
      emotionSelected: selectedEmotion?.label ?? dilemma.emotionChoices[0].label,
      criticalTakeaway: selectedCritical?.label ?? '',
      decisionLabel: selectedDecision.label,
      reflectionText: trimmed,
      completedAt: new Date().toLocaleDateString('es-ES'),
      stickyNote,
    });
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="empathy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/84 p-3 sm:p-5"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <ExplorerReactionAvatar
              explorerId={explorer.id}
              explorerName={explorer.name}
              reaction={avatarReaction}
              pulseKey={reactionPulse}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#526071]">
                <HeartHandshake className="h-4 w-4 text-[#C67D1E]" />
                <span className="font-bold text-[#8A5410]">
                  {dilemma.sealTitle}
                </span>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-bold ${CHARACTER_REACTION_META[avatarReaction].lightTextClass}`}
                >
                  {explorer.name}: {CHARACTER_REACTION_META[avatarReaction].label}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">Paso {step}/3</span>
              </div>
              <h2
                id="empathy-modal-title"
                className="mt-0.5 font-display text-xl font-bold text-[#171B21] sm:text-2xl"
              >
                {dilemma.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar dilema empático"
            className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Step Bar */}
        <div className="grid grid-cols-3 border-b border-[#232A34]/10 bg-[#EFECE4] text-xs font-semibold">
          {[
            { num: 1, label: '1. Cómic de voces' },
            { num: 2, label: '2. Emoción y reto' },
            { num: 3, label: '3. Acuerdo y diario' },
          ].map((tab) => (
            <div
              key={tab.num}
              className={`px-3 py-2.5 text-center border-b-2 ${
                step === tab.num
                  ? 'border-[#C67D1E] text-[#171B21] bg-[#F5F3EE]'
                  : step > tab.num
                  ? 'border-[#2A6F4E] text-[#2A6F4E]'
                  : 'border-transparent text-[#6B7482]'
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* STEP 1: SHORT COMIC STRIP DIALOGUE */}
          {step === 1 && (
            <>
              <p className="text-sm font-medium text-[#3E4856]">
                {dilemma.setting}
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {dilemma.voices.map((voice, idx) => (
                  <article
                    key={voice.name}
                    className="flex flex-col justify-between rounded-2xl border-2 border-[#232A34]/15 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-lg font-bold text-white ${
                              idx === 0 ? 'bg-[#1D4E89]' : 'bg-[#C67D1E]'
                            }`}
                          >
                            {voice.name.charAt(0)}
                          </span>
                          <div>
                            <h3 className="font-display text-base font-bold text-[#171B21]">
                              {voice.name}
                            </h3>
                            <div className="text-xs text-[#526071]">
                              {voice.role}
                            </div>
                          </div>
                        </div>

                        {speechAvailable && (
                          <button
                            type="button"
                            onClick={() =>
                              speakText(
                                `${voice.name} dice: ${voice.quote[cycle]}`,
                                muted
                              )
                            }
                            aria-label={`Escuchar a ${voice.name}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#1D4E89]/25 bg-[#F5F3EE] px-2.5 py-1.5 text-xs font-semibold text-[#1D4E89] hover:bg-[#E8F0FA] cursor-pointer"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>Oír</span>
                          </button>
                        )}
                      </div>

                      {/* Comic speech bubble */}
                      <div className="mt-3.5 rounded-xl border border-[#232A34]/12 bg-[#FAF8F4] p-3.5 text-[15px] font-medium leading-snug text-[#171B21]">
                        {voice.quote[cycle]}
                      </div>
                    </div>

                    <p
                      className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${
                        adayCompassOn
                          ? 'bg-[#F6EAD7] text-[#6E420B]'
                          : 'bg-[#F5F3EE] text-[#526071]'
                      }`}
                    >
                      {adayCompassOn ? '★ Brújula de Aday: ' : 'Pista visual: '}
                      {voice.feelingClue}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* STEP 2: VISUAL EMOTION FACES + CRITICAL QUESTION */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Visual Emotion Expression Cards */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#171B21]">
                    <HeartHandshake className="h-4 w-4 text-[#C67D1E]" />
                    <span>{dilemma.emotionPrompt}</span>
                  </div>
                  {explorer.id === 'aday' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A5410]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Brújula de Aday activa
                    </span>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {dilemma.emotionChoices.map((choice) => {
                    const active = emotionId === choice.id;
                    const highlightAday =
                      adayCompassOn && Boolean(choice.isRecommended);
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => {
                          setEmotionId(choice.id);
                          setNotice(null);
                          soundEngine.playStep();
                        }}
                        className={`flex flex-col items-center rounded-2xl border-2 p-4 text-center transition-transform duration-150 active:scale-[0.98] cursor-pointer ${
                          active
                            ? 'border-[#1D4E89] bg-[#E8F0FA] text-[#171B21]'
                            : highlightAday
                            ? 'border-[#C67D1E] bg-[#FAF4E8] text-[#171B21]'
                            : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#1D4E89]'
                        }`}
                      >
                        <EmotionFaceSvg
                          face={choice.face}
                          className="h-16 w-16"
                        />
                        <span className="mt-2.5 text-base font-bold text-[#171B21]">
                          {choice.shortLabel}
                        </span>
                        <span className="mt-1 text-xs leading-snug text-[#4A5564]">
                          {choice.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Critical Thinking Quick Choice */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#171B21]">
                    <Scale className="h-4 w-4 text-[#1D4E89]" />
                    <span>{dilemma.criticalQuestion[cycle]}</span>
                  </div>
                  {speechAvailable && (
                    <button
                      type="button"
                      onClick={() =>
                        speakText(dilemma.criticalQuestion[cycle], muted)
                      }
                      aria-label="Escuchar pregunta crítica"
                      className="inline-flex items-center gap-1 rounded-lg border border-[#1D4E89]/25 bg-white px-2.5 py-1 text-xs font-semibold text-[#1D4E89] hover:bg-[#E8F0FA] cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Oír</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {activeCriticalChoices.map((choice) => {
                    const active = criticalId === choice.id;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => {
                          setCriticalId(choice.id);
                          setNotice(null);
                          if (choice.isBest) {
                            soundEngine.playDiscover();
                          } else {
                            soundEngine.playGentleError();
                          }
                        }}
                        className={`w-full rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                          active
                            ? choice.isBest
                              ? 'border-[#2A6F4E] bg-[#E1EFE8] text-[#171B21]'
                              : 'border-[#C67D1E] bg-[#F6EAD7] text-[#171B21]'
                            : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#1D4E89]'
                        }`}
                      >
                        <div className="text-sm font-semibold">
                          {choice.label}
                        </div>
                        {active && (
                          <p
                            className={`mt-1.5 text-xs font-semibold ${
                              choice.isBest
                                ? 'text-[#1D543A]'
                                : 'text-[#7A490C]'
                            }`}
                          >
                            {choice.feedback}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: QUICK AGREEMENT + TAP-TO-BUILD REFLECTION */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-bold text-[#171B21]">
                  {dilemma.decisionPrompt}
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {dilemma.decisionChoices.map((opt) => {
                    const active = decisionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setDecisionId(opt.id);
                          setNotice(null);
                          soundEngine.playStep();
                        }}
                        className={`rounded-xl border-2 p-3.5 text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-[#2A6F4E] bg-[#E1EFE8] text-[#171B21]'
                            : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#2A6F4E]'
                        }`}
                      >
                        <div className="text-sm font-bold">{opt.label}</div>
                        {active && (
                          <p className="mt-1.5 text-xs font-medium text-[#1D543A]">
                            {opt.feedback}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fast Tap-to-Build Reflection Journal */}
              <div className="rounded-xl border border-[#232A34]/15 bg-white p-4 space-y-3">
                <label
                  htmlFor="journal-reflection-input"
                  className="flex items-center gap-2 text-sm font-bold text-[#171B21]"
                >
                  <PenLine className="h-4 w-4 text-[#1D4E89]" />
                  <span>Diario de Reflexión (1 toque o escribe tu frase)</span>
                </label>
                <p className="text-xs text-[#4A5564]">
                  {dilemma.reflectionPrompt[cycle]}
                </p>

                <div className="flex flex-wrap gap-2">
                  {dilemma.guidedStarters.map((starter, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setReflectionText(starter);
                        setNotice(null);
                      }}
                      className="rounded-lg border border-[#1D4E89]/30 bg-[#F5F3EE] px-3 py-2 text-left text-xs font-semibold text-[#171B21] hover:border-[#1D4E89] hover:bg-[#E8F0FA] cursor-pointer"
                    >
                      + {starter}
                    </button>
                  ))}
                </div>

                <textarea
                  id="journal-reflection-input"
                  rows={3}
                  value={reflectionText}
                  onChange={(e) => {
                    setReflectionText(e.target.value);
                    setNotice(null);
                  }}
                  placeholder="Pulsa una tarjeta de arriba o escribe aquí tu idea..."
                  className="w-full rounded-lg border border-[#232A34]/20 bg-[#FAF8F4] p-3 text-sm text-[#171B21] placeholder:text-[#7D8794] focus:border-[#1D4E89]"
                />
              </div>

              {/* Optional Digital Post-it right in Step 3 */}
              <div className="rounded-xl border border-[#232A34]/15 bg-white p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#171B21]">
                    <StickyNoteIcon className="h-4 w-4 text-[#C67D1E]" />
                    <span>Pega-nota resumen (1 palabra + emoji)</span>
                  </div>
                  {!showStickyEditor && !stickyNote && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setShowStickyEditor(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#C67D1E]/60 bg-[#FFF8E1] px-3 py-1.5 text-xs font-bold text-[#6E420B] hover:bg-[#FFF0C2] cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Añadir pega-nota</span>
                    </button>
                  )}
                </div>

                {stickyNote && !showStickyEditor && (
                  <div className="flex items-center gap-4 pt-1">
                    <StickyNoteCard
                      note={stickyNote}
                      compact
                      onEdit={() => {
                        soundEngine.playClick();
                        setShowStickyEditor(true);
                      }}
                    />
                    <p className="text-xs text-[#4A5564]">
                      ¡Tu pega-nota se guardará en el diario y podrás editarla cuando quieras!
                    </p>
                  </div>
                )}

                {showStickyEditor && (
                  <StickyNoteEditor
                    roomId={room.id}
                    initialNote={stickyNote}
                    compactMode
                    onSave={(note) => {
                      setStickyNote(note);
                      setShowStickyEditor(false);
                    }}
                    onRemove={
                      stickyNote
                        ? () => {
                            setStickyNote(undefined);
                            setShowStickyEditor(false);
                          }
                        : undefined
                    }
                    onCancel={() => setShowStickyEditor(false)}
                  />
                )}
              </div>
            </div>
          )}

          {notice && (
            <div
              role="alert"
              className="rounded-xl border border-[#C67D1E]/45 bg-[#F6EAD7] px-4 py-2.5 text-sm font-medium text-[#6E420B]"
            >
              {notice}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setNotice(null);
                  setStep((prev) => (prev === 3 ? 2 : 1));
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#232A34]/20 bg-white px-4 py-2 text-sm font-semibold text-[#232A34] hover:bg-[#EAE6DC] cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Atrás</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!adayCompassOn) {
                    setAdayCompassOn(true);
                    soundEngine.playPowerUp();
                  } else {
                    onClose();
                  }
                }}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#526071] hover:text-[#171B21] cursor-pointer"
              >
                {!adayCompassOn ? 'Ver pista emocional' : 'Volver a la sala'}
              </button>
            )}
          </div>

          <div>
            {step === 1 && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playStep();
                  setStep(2);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1D4E89] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#153A68] cursor-pointer"
              >
                <span>Elegir emoción</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleGoToStep3}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1D4E89] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#153A68] cursor-pointer"
              >
                <span>Ir al acuerdo final</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleSaveJournal}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2A6F4E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#225B40] cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>¡Guardar y conseguir sello!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
