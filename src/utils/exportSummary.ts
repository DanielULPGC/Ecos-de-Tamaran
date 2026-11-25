import { CycleId, JournalEntry, RoomEmotionCheck, RoomId } from '../types/game';
import { getMoodById } from '../data/enrichmentData';
import { getDifficultyProfile } from '../data/difficultyConfig';
import { formatEscapeTime } from '../data/escapeLocks';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface ReflectionReportMeta {
  doorsUnlocked?: number;
  badgesUnlocked?: number;
  badgesTotal?: number;
  elapsedSeconds?: number;
  showEscapeTimer?: boolean;
}

export function downloadReflectionReport(
  explorerName: string,
  cycle: CycleId,
  entries: JournalEntry[],
  emotions?: Partial<Record<RoomId, RoomEmotionCheck>>,
  meta?: ReflectionReportMeta
) {
  const safeName = explorerName.trim() || 'Equipo Explorador de Tamarán';
  const difficulty = getDifficultyProfile(cycle);
  const cycleLabel =
    cycle === 'ciclo2'
      ? `${difficulty.levelName} · 2.º Ciclo de Educación Primaria (3.º y 4.º)`
      : `${difficulty.levelName} · 3.º Ciclo de Educación Primaria (5.º y 6.º)`;
  const today = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const escapeStatsParts: string[] = [];
  if (typeof meta?.doorsUnlocked === 'number') {
    escapeStatsParts.push(`<strong>Cerrojos abiertos:</strong> ${meta.doorsUnlocked}/4`);
  }
  if (typeof meta?.badgesUnlocked === 'number' && typeof meta?.badgesTotal === 'number') {
    escapeStatsParts.push(
      `<strong>Insignias:</strong> ${meta.badgesUnlocked}/${meta.badgesTotal}`
    );
  }
  if (meta?.showEscapeTimer && typeof meta.elapsedSeconds === 'number' && meta.elapsedSeconds > 0) {
    escapeStatsParts.push(
      `<strong>Tiempo Escape Room:</strong> ${escapeHtml(formatEscapeTime(meta.elapsedSeconds))}`
    );
  }
  const escapeStatsHtml =
    escapeStatsParts.length > 0
      ? `<div style="margin-top: 6px; font-size: 13px; color: #1d4e89;">${escapeStatsParts.join(
          ' &nbsp;·&nbsp; '
        )}</div>`
      : '';

  const entriesHtml = entries
    .map((entry, index) => {
      const emo = emotions?.[entry.roomId];
      const beforeMood = getMoodById(emo?.before);
      const afterMood = getMoodById(emo?.after);
      const emoHtml =
        beforeMood || afterMood
          ? `<p style="margin: 6px 0; font-size: 14px;">
              <strong>Termómetro emocional (Antes → Después):</strong>
              ${beforeMood ? `${escapeHtml(beforeMood.emoji)} ${escapeHtml(beforeMood.label)}` : '—'}
              &nbsp;→&nbsp;
              ${afterMood ? `${escapeHtml(afterMood.emoji)} ${escapeHtml(afterMood.label)}` : '—'}
            </p>`
          : '';

      return `
      <section style="border: 1px solid #d6d1c4; border-radius: 10px; padding: 18px 20px; margin-bottom: 16px; background: #faf8f4;">
        <div style="font-size: 12px; color: #526071; margin-bottom: 4px;">
          Sala ${index + 1} · ${escapeHtml(entry.epoch)}
        </div>
        <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #1d4e89;">
          ${escapeHtml(entry.roomTitle)}
        </h2>
        <p style="margin: 6px 0; font-size: 14px;">
          <strong>Emoción identificada (EMOCREA):</strong> ${escapeHtml(entry.emotionSelected)}
        </p>
        ${emoHtml}
        <p style="margin: 6px 0; font-size: 14px;">
          <strong>Clave de pensamiento crítico:</strong> ${escapeHtml(entry.criticalTakeaway)}
        </p>
        <p style="margin: 6px 0; font-size: 14px;">
          <strong>Decisión ante el dilema:</strong> ${escapeHtml(entry.decisionLabel)}
        </p>
        <div style="margin-top: 10px; padding: 12px 14px; background: #ffffff; border: 1px solid #e4dfd4; border-radius: 8px; font-size: 14px; line-height: 1.6;">
          <strong>Diario de reflexión:</strong><br/>
          ${escapeHtml(entry.reflectionText)}
        </div>
        ${
          entry.stickyNote
            ? `<div style="margin-top: 10px; display: inline-block; padding: 10px 16px; background: #fff3c4; border: 1px solid #dfb94c; border-radius: 4px; color: #473307; font-size: 14px;">
                <strong>Pega-nota emocional:</strong> ${escapeHtml(entry.stickyNote.emoji)} <strong>${escapeHtml(entry.stickyNote.word)}</strong>
              </div>`
            : ''
        }
      </section>`;
    })
    .join('\n');

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Cuaderno de Reflexión — Ecos de Tamarán</title>
</head>
<body style="font-family: 'Segoe UI', system-ui, sans-serif; color: #232a34; background: #ffffff; max-width: 820px; margin: 32px auto; padding: 0 20px; line-height: 1.55;">
  <header style="border-bottom: 2px solid #1d4e89; padding-bottom: 16px; margin-bottom: 24px;">
    <div style="font-size: 12px; color: #526071;">Ecos de Tamarán: El Cuaderno del Tiempo · Currículo de Canarias (LOMLOE)</div>
    <h1 style="margin: 6px 0 8px 0; font-size: 26px; color: #171b21;">Resumen de Expedición, Empatía y Pensamiento Crítico</h1>
    <div style="font-size: 14px; color: #394452;">
      <strong>Explorador / Equipo:</strong> ${escapeHtml(safeName)} &nbsp;·&nbsp;
      <strong>Nivel:</strong> ${escapeHtml(cycleLabel)} &nbsp;·&nbsp;
      <strong>Fecha:</strong> ${escapeHtml(today)}
    </div>
    ${escapeStatsHtml}
  </header>
  ${entriesHtml}
  <footer style="margin-top: 28px; padding-top: 14px; border-top: 1px solid #d6d1c4; font-size: 12px; color: #526071;">
    Documento generado desde Ecos de Tamarán para la evaluación formativa y asamblea de aula (Conocimiento del Medio, EMOCREA y Valores Cívicos y Éticos — Decreto 211/2022, Canarias).
  </footer>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const slug = safeName
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñ]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  anchor.href = url;
  anchor.download = `cuaderno-tamaran-${slug || 'reflexion'}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
