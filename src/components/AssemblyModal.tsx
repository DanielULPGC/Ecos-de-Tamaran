import React, { useState } from 'react';
import {
  MessageCircle,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import { RoomData } from '../types/game';
import {
  ASSEMBLY_FLASH_QUESTIONS,
  COOPERATIVE_ROLES,
} from '../data/enrichmentData';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText } from '../utils/speech';

interface AssemblyModalProps {
  room: RoomData;
  muted: boolean;
  onClose: () => void;
}

export const AssemblyModal: React.FC<AssemblyModalProps> = ({
  room,
  muted,
  onClose,
}) => {
  const speechAvailable = isSpeechSupported();
  const [roleOffset, setRoleOffset] = useState(0);
  const [studentNames, setStudentNames] = useState<string[]>(['', '', '', '']);
  const [votes, setVotes] = useState<[number, number]>([0, 0]);
  const [questionIdx, setQuestionIdx] = useState(0);

  const questions = ASSEMBLY_FLASH_QUESTIONS[room.id] ?? [];
  const activeQuestion = questions[questionIdx % questions.length] ?? '';

  const totalVotes = votes[0] + votes[1];
  const pctA = totalVotes > 0 ? Math.round((votes[0] / totalVotes) * 100) : 0;
  const pctB = totalVotes > 0 ? Math.round((votes[1] / totalVotes) * 100) : 0;

  const handleSpinRoles = () => {
    soundEngine.playPowerUp();
    setRoleOffset((prev) => (prev + 1) % COOPERATIVE_ROLES.length);
  };

  const adjustVote = (idx: 0 | 1, delta: 1 | -1) => {
    soundEngine.playStep();
    setVotes((prev) => {
      const next: [number, number] = [...prev];
      next[idx] = Math.max(0, next[idx] + delta);
      return next;
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assembly-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/84 p-3 sm:p-5"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1D4E89]">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>Modo Asamblea · Pizarra Digital Cooperativa</span>
              <span aria-hidden="true">·</span>
              <span>Sala {room.number}</span>
            </div>
            <h2
              id="assembly-modal-title"
              className="mt-1 font-display text-xl font-bold text-[#171B21] sm:text-2xl"
            >
              Dinamización de Gran Grupo · {room.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modo asamblea"
            className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* 1. Flash Debate Question */}
          <section className="rounded-2xl border border-[#1D4E89]/25 bg-[#E8F0FA] p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1D4E89]">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>Pregunta relámpago para debatir en clase</span>
              </div>
              <div className="flex items-center gap-2">
                {speechAvailable && (
                  <button
                    type="button"
                    onClick={() => speakText(activeQuestion, muted)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#1D4E89]/30 bg-white px-2.5 py-1.5 text-xs font-bold text-[#1D4E89] hover:bg-[#F5F3EE] cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Leer en voz alta</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setQuestionIdx((prev) => prev + 1);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#1D4E89] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#153A68] cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Otra pregunta</span>
                </button>
              </div>
            </div>

            <p className="font-display text-lg font-bold text-[#171B21] sm:text-xl leading-snug">
              «{activeQuestion}»
            </p>
          </section>

          {/* 2. Live Classroom Vote for the Room's Empathy Dilemma */}
          <section className="rounded-2xl border border-[#232A34]/15 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold text-[#171B21]">
                  Votación de clase · {room.empathy.title}
                </h3>
                <p className="text-xs text-[#526071]">
                  Cuenta las manos alzadas para decidir juntos en la pizarra digital.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setVotes([0, 0]);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-[#232A34]/18 px-3 py-1.5 text-xs font-semibold text-[#3E4856] hover:bg-[#EAE6DC] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Poner a 0</span>
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {room.empathy.decisionChoices.map((choice, idx) => {
                const voteIdx = idx as 0 | 1;
                const count = votes[voteIdx];
                const pct = voteIdx === 0 ? pctA : pctB;
                return (
                  <div
                    key={choice.id}
                    className="rounded-xl border border-[#232A34]/15 bg-[#FAF8F4] p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-[#171B21]">
                        Opción {idx === 0 ? 'A' : 'B'}: {choice.label}
                      </span>
                    </div>

                    {/* Visual bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-mono text-xs font-bold text-[#1D4E89] tabular-nums">
                        <span>{count} votos</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#E3DED3]">
                        <div
                          className={`h-full rounded-full transition-transform duration-200 origin-left ${
                            idx === 0 ? 'bg-[#1D4E89]' : 'bg-[#2A6F4E]'
                          }`}
                          style={{ transform: `scaleX(${pct / 100})` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustVote(voteIdx, -1)}
                        aria-label={`Restar voto opción ${idx === 0 ? 'A' : 'B'}`}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#232A34]/20 bg-white text-[#232A34] hover:bg-[#EAE6DC] cursor-pointer"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustVote(voteIdx, 1)}
                        className="flex flex-1 h-10 items-center justify-center gap-1.5 rounded-lg bg-[#1D4E89] px-3 text-xs font-bold text-white hover:bg-[#153A68] cursor-pointer"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        <span>Sumar voto</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Cooperative Classroom Roles Spinner */}
          <section className="rounded-2xl border border-[#232A34]/15 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold text-[#171B21]">
                  Ruleta de Roles Cooperativos
                </h3>
                <p className="text-xs text-[#526071]">
                  Escribe 4 nombres (o equipos) y gira los roles al cambiar de sala.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSpinRoles}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C67D1E] px-4 py-2 text-xs font-bold text-[#14181F] hover:bg-[#D98E2B] cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Rotar roles del equipo</span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {COOPERATIVE_ROLES.map((role, idx) => {
                const nameIndex = (idx + roleOffset) % studentNames.length;
                return (
                  <div
                    key={role.id}
                    className="rounded-xl border border-[#232A34]/15 bg-[#FAF8F4] p-3.5 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">
                        {role.emoji}
                      </span>
                      <span className="text-xs font-bold text-[#171B21]">
                        {role.title}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug text-[#4A5564]">
                      {role.task}
                    </p>
                    <input
                      type="text"
                      maxLength={24}
                      value={studentNames[nameIndex]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStudentNames((prev) =>
                          prev.map((n, i) => (i === nameIndex ? val : n))
                        );
                      }}
                      placeholder={`Alumno/a ${nameIndex + 1}`}
                      className="w-full rounded-lg border border-[#232A34]/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#171B21] placeholder:font-normal placeholder:text-[#88919E]"
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="flex justify-end border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#232A34] px-5 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] cursor-pointer"
          >
            Volver al escenario
          </button>
        </div>
      </div>
    </div>
  );
};
