import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  Flashlight,
  KeyRound,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { CycleId, RoomId } from '../types/game';
import {
  getRoomInscriptions,
  SceneInscription,
} from '../data/metaVaultData';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';

interface SceneInspectorOverlayProps {
  roomId: RoomId;
  cycle: CycleId;
  discoveredIds: string[];
  muted: boolean;
  onDiscoverInscription: (inscription: SceneInscription) => void;
  onOpenMetaVault: () => void;
  onClose: () => void;
}

export const SceneInspectorOverlay: React.FC<SceneInspectorOverlayProps> = ({
  roomId,
  cycle,
  discoveredIds,
  muted,
  onDiscoverInscription,
  onOpenMetaVault,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [beamPos, setBeamPos] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  });
  const [activeCard, setActiveCard] = useState<SceneInscription | null>(null);

  const inscriptions = getRoomInscriptions(roomId);
  const discoveredCount = inscriptions.filter((ins) =>
    discoveredIds.includes(ins.id)
  ).length;
  const speechAvailable = isSpeechSupported();

  useEffect(() => {
    setActiveCard(null);
    setBeamPos({ x: 50, y: 50 });
  }, [roomId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        stopSpeaking();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  const updateBeamFromPointer = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setBeamPos({ x, y });
  };

  const handleSelectInscription = (ins: SceneInscription) => {
    setBeamPos({ x: ins.x, y: ins.y });
    if (!discoveredIds.includes(ins.id)) {
      soundEngine.playDiscover();
      onDiscoverInscription(ins);
    } else {
      soundEngine.playClick();
    }
    setActiveCard(ins);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={(e) => updateBeamFromPointer(e.clientX, e.clientY)}
      onPointerDown={(e) => updateBeamFromPointer(e.clientX, e.clientY)}
      className="absolute inset-0 z-20 select-none touch-none cursor-crosshair"
    >
      {/* Atmospheric inspection shadow mask with warm UV-amber spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-[background] duration-75"
        style={{
          background: `radial-gradient(circle 132px at ${beamPos.x}% ${beamPos.y}%, rgba(250, 214, 130, 0.14) 0%, rgba(230, 169, 79, 0.08) 42%, rgba(9, 13, 20, 0.72) 74%, rgba(9, 13, 20, 0.84) 100%)`,
        }}
      />

      {/* Crisp circular brass-lens ring around the active spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#E6A94F]/80 shadow-[0_0_28px_rgba(230,169,79,0.45)]"
        style={{
          left: `${beamPos.x}%`,
          top: `${beamPos.y}%`,
          width: '210px',
          height: '210px',
        }}
      >
        <span className="absolute inset-2 rounded-full border border-dashed border-[#FAF4E8]/35" />
      </div>

      {/* Top instruction bar */}
      <div className="pointer-events-auto absolute left-3 right-3 top-3 z-30 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 rounded-xl border border-[#E6A94F]/55 bg-[#14181F]/92 px-3 py-2 text-xs text-[#F5F3EE] shadow-xl">
          <Flashlight
            className="h-4 w-4 text-[#F3C876] shrink-0"
            aria-hidden="true"
          />
          <span className="font-bold text-[#F3C876]">
            Linterna de inspección activa
          </span>
          <span aria-hidden="true" className="text-[#6F7885]">
            ·
          </span>
          <span className="hidden sm:inline text-[#D6D0C4]">
            Mueve el foco por la sala para revelar grabados ocultos
          </span>
          <span className="font-mono text-[#74C69D] tabular-nums">
            {discoveredCount}/{inscriptions.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            stopSpeaking();
            soundEngine.playClick();
            onClose();
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#F5F3EE]/25 bg-[#171B21]/95 px-3 py-2 text-xs font-bold text-[#F5F3EE] shadow-xl hover:border-[#E6A94F] hover:bg-[#232A34] cursor-pointer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          <span>Apagar linterna</span>
        </button>
      </div>

      {/* Hidden Inscriptions revealed under the spotlight */}
      {inscriptions.map((ins) => {
        const isDiscovered = discoveredIds.includes(ins.id);
        const dx = ins.x - beamPos.x;
        const dy = ins.y - beamPos.y;
        // Aspect-corrected distance (16:9 canvas)
        const dist = Math.hypot(dx * 1.35, dy * 0.78);
        const illuminated = dist < 17;
        const nearGlow = dist < 29;
        const visibleOpacity = isDiscovered
          ? illuminated
            ? 1
            : 0.75
          : illuminated
          ? 0.98
          : nearGlow
          ? 0.34
          : 0.04;

        const isFragment = ins.kind === 'pintadera-fragment';

        return (
          <button
            key={ins.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectInscription(ins);
            }}
            onFocus={() => setBeamPos({ x: ins.x, y: ins.y })}
            style={{
              left: `${ins.x}%`,
              top: `${ins.y}%`,
              opacity: visibleOpacity,
            }}
            aria-label={`${ins.symbolLabel}: ${ins.title}${
              isDiscovered ? ' (Descubierto)' : ' (Inspeccionar)'
            }`}
            className={`group absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-opacity duration-150 focus:opacity-100 focus:outline-none cursor-pointer`}
          >
            <span
              className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-bold shadow-[0_0_24px_rgba(243,200,118,0.55)] transition-transform duration-150 group-hover:scale-105 ${
                isDiscovered
                  ? 'border-[#74C69D] bg-[#163024]/95 text-[#D8F3DC]'
                  : isFragment
                  ? 'border-[#F3C876] bg-[#2D2112]/95 text-[#FAF4E8]'
                  : 'border-[#90CAF9] bg-[#162436]/95 text-[#E8F2FC]'
              }`}
            >
              {isDiscovered ? (
                <CheckCircle2
                  className="h-4 w-4 text-[#74C69D] shrink-0"
                  aria-hidden="true"
                />
              ) : isFragment ? (
                <Compass
                  className="h-4 w-4 text-[#F3C876] shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <KeyRound
                  className="h-4 w-4 text-[#90CAF9] shrink-0"
                  aria-hidden="true"
                />
              )}
              <span className="font-mono tracking-wide whitespace-nowrap">
                {illuminated || isDiscovered ? ins.engraving : '··· ? ···'}
              </span>
            </span>

            {(illuminated || isDiscovered) && (
              <span className="mt-1 rounded-md border border-[#F5F3EE]/20 bg-[#14181F]/92 px-2 py-0.5 text-[11px] font-semibold text-[#F3C876] whitespace-nowrap">
                {isDiscovered ? `${ins.symbolLabel} ✓` : 'Toca para registrar'}
              </span>
            )}
          </button>
        );
      })}

      {/* Decoded Inscription Card (bottom-center when an inscription is clicked) */}
      {activeCard && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute bottom-3 left-1/2 z-30 w-[min(94%,540px)] -translate-x-1/2 rounded-2xl border border-[#E6A94F]/60 bg-[#171B21]/96 p-4 text-[#F5F3EE] shadow-2xl space-y-2.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F3C876]">
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{activeCard.dialHintLabel}</span>
              </div>
              <h3 className="mt-0.5 font-display text-base font-bold text-[#F5F3EE]">
                {activeCard.title}
              </h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {speechAvailable && (
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      `${activeCard.title}. ${activeCard.explanation[cycle]}`,
                      muted
                    )
                  }
                  aria-label="Escuchar inscripción revelada"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#F5F3EE]/18 bg-[#222833] text-[#F3C876] hover:border-[#E6A94F] cursor-pointer"
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveCard(null)}
                aria-label="Cerrar tarjeta de inscripción"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#F5F3EE]/18 bg-[#222833] text-[#F5F3EE] hover:border-[#E6A94F] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[#E6A94F]/35 bg-[#231D14] px-3 py-1.5 font-mono text-xs font-bold tracking-wider text-[#F3C876]">
            {activeCard.engraving}
          </div>

          <p className="text-xs leading-relaxed text-[#E2DDD2]">
            {activeCard.explanation[cycle]}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] font-semibold text-[#74C69D]">
              Guardado en tu Carpeta de Pistas ✓
            </span>
            {activeCard.kind === 'pintadera-fragment' && (
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  soundEngine.playClick();
                  onClose();
                  onOpenMetaVault();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#C67D1E] px-3 py-1.5 text-xs font-bold text-[#14181F] hover:bg-[#D98E2B] cursor-pointer"
              >
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ver Gran Pintadera</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Accessible DUA keyboard/quick-scan helper bar when no card is open */}
      {!activeCard && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto absolute bottom-3 left-3 z-30 flex flex-wrap items-center gap-1.5 rounded-xl border border-[#F5F3EE]/18 bg-[#14181F]/90 px-3 py-1.5 text-[11px] text-[#D6D0C4]"
        >
          <span className="font-semibold text-[#F3C876]">Zonas ocultas:</span>
          {inscriptions.map((ins, i) => {
            const done = discoveredIds.includes(ins.id);
            return (
              <button
                key={ins.id}
                type="button"
                onClick={() => handleSelectInscription(ins)}
                className={`rounded-md border px-2 py-0.5 font-semibold transition-colors cursor-pointer ${
                  done
                    ? 'border-[#52B788]/60 bg-[#183024] text-[#9FE2BF]'
                    : 'border-[#F5F3EE]/20 bg-[#1E242E] text-[#D6D0C4] hover:border-[#E6A94F]'
                }`}
              >
                {done ? `${ins.symbolLabel} ✓` : `Rastro ${i + 1}`}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
