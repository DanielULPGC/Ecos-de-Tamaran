import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Heart, LockOpen, Sparkles } from 'lucide-react';
import {
  ExplorerProfile,
  RoomData,
  RoomEmotionCheck,
  ThermometerMoodId,
} from '../types/game';
import { THERMOMETER_MOODS } from '../data/enrichmentData';
import { formatEscapeTime } from '../data/escapeLocks';
import { soundEngine } from '../utils/audio';

interface RoomTransitionProps {
  completedRoom: RoomData;
  nextRoom: RoomData;
  explorer: ExplorerProfile;
  completedEmotion?: RoomEmotionCheck;
  elapsedSeconds?: number;
  showEscapeTimer?: boolean;
  onSelectAfterMood: (mood: ThermometerMoodId) => void;
  onContinue: () => void;
}

export const RoomTransition: React.FC<RoomTransitionProps> = ({
  completedRoom,
  nextRoom,
  explorer,
  completedEmotion,
  elapsedSeconds = 0,
  showEscapeTimer = true,
  onSelectAfterMood,
  onContinue,
}) => {
  const afterMood = completedEmotion?.after;

  return (
    <main className="flex min-h-screen w-screen items-center justify-center bg-[#171B21] p-4 sm:p-6 text-[#F5F3EE]">
      <div className="w-full max-w-2xl rounded-2xl border border-[#F5F3EE]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-7 py-5">
          <img
            src={explorer.portraitPath}
            alt={explorer.name}
            referrerPolicy="no-referrer"
            className="h-16 w-16 rounded-2xl border-2 border-[#C67D1E] object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-bold text-[#2A6F4E]">
              <span className="inline-flex items-center gap-1">
                <LockOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>¡Has escapado de la Sala {completedRoom.number}!</span>
              </span>
              <span aria-hidden="true" className="text-[#8F97A3]">·</span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{completedRoom.mapZoneLabel} iluminada</span>
              </span>
              {showEscapeTimer && elapsedSeconds > 0 && (
                <>
                  <span aria-hidden="true" className="text-[#8F97A3]">·</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[#1D4E89] tabular-nums">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{formatEscapeTime(elapsedSeconds)}</span>
                  </span>
                </>
              )}
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold text-[#171B21] sm:text-3xl">
              ¡Puerta abierta hacia {nextRoom.years}!
            </h1>
          </div>
        </div>

        <div className="space-y-4 px-7 py-6">
          <p className="text-[15px] font-medium leading-relaxed text-[#2F3845]">
            {completedRoom.transitionSummary}
          </p>

          {/* Inline 1-tap EMOCREA Emotional Thermometer ("Después") */}
          <div className="rounded-xl border border-[#C67D1E]/35 bg-[#FAF4E8] p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8A5410]">
              <Heart className="h-3.5 w-3.5 text-[#C67D1E]" aria-hidden="true" />
              <span>
                Termómetro EMOCREA · ¿Cómo te sientes al terminar Sala {completedRoom.number}?
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {THERMOMETER_MOODS.map((mood) => {
                const active = afterMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playDiscover();
                      onSelectAfterMood(mood.id);
                    }}
                    className={`flex flex-col items-center rounded-xl border-2 px-2 py-2.5 text-center transition-transform duration-150 active:scale-95 cursor-pointer ${
                      active
                        ? 'border-[#2A6F4E] bg-[#E1EFE8] text-[#171B21]'
                        : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#2A6F4E]'
                    }`}
                  >
                    <span className="text-xl leading-none" aria-hidden="true">
                      {mood.emoji}
                    </span>
                    <span className="mt-1 text-[11px] font-bold">
                      {mood.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-[#232A34]/12 bg-white p-5">
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#1D4E89] tabular-nums">
                <Sparkles className="h-3.5 w-3.5 text-[#C67D1E]" />
                <span>Siguiente parada · Sala {nextRoom.number}/4</span>
              </div>
              <h2 className="mt-1 font-display text-xl font-bold text-[#171B21]">
                {nextRoom.title}
              </h2>
              <p className="mt-0.5 text-xs text-[#526071]">
                {nextRoom.location}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#232A34]/12 bg-[#EFECE4] px-7 py-4">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1D4E89] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#153A68] cursor-pointer"
          >
            <span>¡Viajar a {nextRoom.mapZoneLabel}!</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </main>
  );
};
