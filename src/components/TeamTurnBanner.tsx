import React from 'react';
import { RefreshCw, Settings2, Users, X } from 'lucide-react';
import { TeamTurnsState } from '../types/game';
import { COOPERATIVE_ROLES } from '../data/enrichmentData';

interface TeamTurnBannerProps {
  teamTurns: TeamTurnsState;
  justRotated: boolean;
  onRotate: () => void;
  onOpenConfig: () => void;
  onHide: () => void;
}

export const TeamTurnBanner: React.FC<TeamTurnBannerProps> = ({
  teamTurns,
  justRotated,
  onRotate,
  onOpenConfig,
  onHide,
}) => {
  const activeRoleIndex = teamTurns.rotationIndex % COOPERATIVE_ROLES.length;

  return (
    <div
      role="region"
      aria-label="Turnos de equipo cooperativo"
      className={`shrink-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b px-3 py-1.5 sm:px-5 text-xs transition-colors duration-300 ${
        justRotated
          ? 'border-[#E6A94F]/70 bg-[#2A2216] text-[#FAF4E8]'
          : 'border-[#F5F3EE]/10 bg-[#1B212A] text-[#E2DDD2]'
      }`}
    >
      {/* Left label + 4 cooperative roles */}
      <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
        <span className="inline-flex items-center gap-1.5 font-bold text-[#74C69D] whitespace-nowrap">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Turnos:</span>
        </span>

        {justRotated && (
          <span className="rounded-md bg-[#C67D1E] px-2 py-0.5 text-[11px] font-bold text-[#14181F] whitespace-nowrap">
            ¡Rotación de roles!
          </span>
        )}

        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {COOPERATIVE_ROLES.map((role, idx) => {
            const memberIdx =
              (idx + teamTurns.rotationIndex) % teamTurns.memberNames.length;
            const rawName = teamTurns.memberNames[memberIdx]?.trim();
            const displayName = rawName || `Equipo ${memberIdx + 1}`;
            const isLead = idx === activeRoleIndex;
            const shortRole = role.title.split(' ')[0];

            return (
              <div
                key={role.id}
                title={`${role.title}: ${role.task}`}
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] transition-colors ${
                  isLead
                    ? 'border-[#E6A94F]/75 bg-[#2D2416] text-[#FAF4E8] font-bold'
                    : 'border-[#F5F3EE]/12 bg-[#14181F]/80 text-[#C7C1B5]'
                }`}
              >
                <span aria-hidden="true">{role.emoji}</span>
                <span className="text-[#E6C58D] font-semibold">
                  {shortRole}:
                </span>
                <span className="max-w-[90px] truncate">{displayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onRotate}
          title="Rotar los roles cooperativos ahora"
          className="inline-flex items-center gap-1 rounded-lg border border-[#E6A94F]/45 bg-[#232A34] px-2.5 py-1 text-[11px] font-bold text-[#F3C876] hover:border-[#E6A94F] hover:bg-[#2E3643] whitespace-nowrap cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          <span>Rotar</span>
        </button>
        <button
          type="button"
          onClick={onOpenConfig}
          title="Editar nombres del equipo y reglas de rotación"
          className="inline-flex items-center gap-1 rounded-lg border border-[#F5F3EE]/16 bg-[#14181F] px-2 py-1 text-[11px] font-semibold text-[#D6D0C4] hover:border-[#74C69D] hover:text-white whitespace-nowrap cursor-pointer"
        >
          <Settings2 className="h-3 w-3" aria-hidden="true" />
          <span className="hidden md:inline">Equipo</span>
        </button>
        <button
          type="button"
          onClick={onHide}
          aria-label="Ocultar barra de turnos"
          title="Ocultar barra de turnos"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[#9AA3B0] hover:bg-[#232A34] hover:text-white cursor-pointer"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
