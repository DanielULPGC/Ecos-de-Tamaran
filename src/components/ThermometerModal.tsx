import React from 'react';
import { Heart, X } from 'lucide-react';
import {
  RoomData,
  RoomEmotionCheck,
  ThermometerMoodId,
} from '../types/game';
import { THERMOMETER_MOODS } from '../data/enrichmentData';
import { soundEngine } from '../utils/audio';

interface ThermometerModalProps {
  room: RoomData;
  moment: 'before' | 'after';
  currentCheck?: RoomEmotionCheck;
  onSelectMood: (moment: 'before' | 'after', mood: ThermometerMoodId) => void;
  onClose: () => void;
}

export const ThermometerModal: React.FC<ThermometerModalProps> = ({
  room,
  moment,
  currentCheck,
  onSelectMood,
  onClose,
}) => {
  const selectedBefore = currentCheck?.before;
  const selectedAfter = currentCheck?.after;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="thermometer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/82 p-4"
    >
      <div className="w-full max-w-xl rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8A5410]">
              <Heart className="h-4 w-4 text-[#C67D1E]" aria-hidden="true" />
              <span>Termómetro Emocional · EMOCREA</span>
              <span aria-hidden="true">·</span>
              <span>Sala {room.number}</span>
            </div>
            <h2
              id="thermometer-modal-title"
              className="mt-1 font-display text-xl font-bold text-[#171B21]"
            >
              {moment === 'before'
                ? '¿Cómo te sientes al empezar esta sala?'
                : '¿Cómo te sientes al terminar esta sala?'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar termómetro emocional"
            className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Before check-in */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-[#526071]">
              Al empezar {room.title}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {THERMOMETER_MOODS.map((mood) => {
                const active = selectedBefore === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playDiscover();
                      onSelectMood('before', mood.id);
                    }}
                    className={`flex flex-col items-center rounded-xl border-2 p-3 text-center transition-transform duration-150 active:scale-95 cursor-pointer ${
                      active
                        ? 'border-[#1D4E89] bg-[#E8F0FA] text-[#171B21]'
                        : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#1D4E89]'
                    }`}
                  >
                    <span className="text-2xl leading-none" aria-hidden="true">
                      {mood.emoji}
                    </span>
                    <span className="mt-1.5 text-xs font-bold">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* After check-in */}
          <div className="space-y-2.5 border-t border-[#232A34]/10 pt-4">
            <div className="text-xs font-bold text-[#526071]">
              Al terminar o avanzar en {room.title}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {THERMOMETER_MOODS.map((mood) => {
                const active = selectedAfter === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playDiscover();
                      onSelectMood('after', mood.id);
                    }}
                    className={`flex flex-col items-center rounded-xl border-2 p-3 text-center transition-transform duration-150 active:scale-95 cursor-pointer ${
                      active
                        ? 'border-[#2A6F4E] bg-[#E1EFE8] text-[#171B21]'
                        : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#2A6F4E]'
                    }`}
                  >
                    <span className="text-2xl leading-none" aria-hidden="true">
                      {mood.emoji}
                    </span>
                    <span className="mt-1.5 text-xs font-bold">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {(selectedBefore || selectedAfter) && (
            <p className="rounded-xl border border-[#232A34]/12 bg-white px-4 py-2.5 text-xs font-medium text-[#3E4856]">
              Todas las emociones son válidas. Reconocer cómo te sientes antes y después de un reto te ayuda a conocerte mejor.
            </p>
          )}
        </div>

        <div className="flex justify-end border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#1D4E89] px-5 py-2 text-sm font-bold text-white hover:bg-[#153A68] cursor-pointer"
          >
            ¡Listo!
          </button>
        </div>
      </div>
    </div>
  );
};
