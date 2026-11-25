import { CycleId, ExpeditionState, StickyNoteColor } from '../types/game';
import { ROOMS_DATA } from '../data/roomsData';
import { getExplorerById } from '../data/charactersAndBadges';
import { getMoodById, TRANSVERSAL_MISSIONS } from '../data/enrichmentData';
import {
  LOMLOE_COMPETENCY_RUBRIC,
  evaluateSpecificCompetencies,
} from '../data/curriculumData';
import { getUnlockedTimeCapsuleRoomIds } from '../data/timeCapsules';
import { getDifficultyProfile } from '../data/difficultyConfig';
import { formatEscapeTime } from '../data/escapeLocks';
import { BADGES } from '../data/charactersAndBadges';
import { STICKY_EMOJIS } from '../components/StickyNoteWidget';

const STICKY_RGB: Record<
  StickyNoteColor,
  { bg: [number, number, number]; border: [number, number, number]; text: [number, number, number] }
> = {
  ochre: { bg: [255, 243, 196], border: [223, 185, 76], text: [71, 51, 7] },
  laurel: { bg: [220, 242, 229], border: [115, 181, 142], text: [21, 64, 42] },
  sky: { bg: [223, 238, 251], border: [116, 167, 214], text: [21, 54, 88] },
  coral: { bg: [251, 226, 218], border: [220, 147, 123], text: [90, 35, 21] },
};

/**
 * Standard PDF built-in fonts use WinAnsiEncoding (Latin-1 + Spanish punctuation).
 * Replace emojis/non-WinAnsi symbols cleanly so there are never garbled characters.
 */
function toPdfText(input: string): string {
  return input
    .replace(/→/g, '->')
    .replace(/•/g, '-')
    .replace(/…/g, '...')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getEmojiLabel(emoji: string): string {
  const match = STICKY_EMOJIS.find((e) => e.emoji === emoji);
  return match ? match.label : 'Emoción';
}

export async function exportJournalToPdf(
  state: ExpeditionState,
  cycle: CycleId
): Promise<void> {
  // Dynamically load jsPDF only when the user exports, keeping initial bundle lean
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 18;

  const studentName = toPdfText(
    state.explorerName.trim() || 'Equipo Explorador de Tamarán'
  );
  const explorer = getExplorerById(state.explorerId);
  const cycleLabel =
    cycle === 'ciclo2'
      ? '2.º Ciclo de Primaria (3.º y 4.º)'
      : '3.º Ciclo de Primaria (5.º y 6.º)';
  const today = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const difficulty = getDifficultyProfile(cycle);
  const completedRoomsCount = ROOMS_DATA.filter((r) => {
    const p = state.progress[r.id];
    return p.puzzle1Solved && p.puzzle2Solved && p.empathySolved;
  }).length;
  const unlockedDoorsCount = ROOMS_DATA.filter(
    (r) => state.progress[r.id].doorUnlocked
  ).length;

  const entriesCount = ROOMS_DATA.filter((r) => Boolean(state.journal[r.id])).length;
  const shadowsSolvedCount = ROOMS_DATA.filter(
    (r) => state.progress[r.id].shadowSolved
  ).length;
  const capsulesUnlockedCount = getUnlockedTimeCapsuleRoomIds(state).length;
  const totalHintsUsed = ROOMS_DATA.reduce(
    (sum, r) =>
      sum +
      state.progress[r.id].hintsUsed.puzzle1 +
      state.progress[r.id].hintsUsed.puzzle2,
    0
  );
  const puzzlesSolvedCount = ROOMS_DATA.reduce(
    (sum, r) =>
      sum +
      Number(state.progress[r.id].puzzle1Solved) +
      Number(state.progress[r.id].puzzle2Solved),
    0
  );

  const pinnedNotes = ROOMS_DATA.map((room) => ({
    room,
    note: state.journal[room.id]?.stickyNote,
  })).filter(
    (item): item is { room: (typeof ROOMS_DATA)[number]; note: NonNullable<typeof item.note> } =>
      Boolean(item.note)
  );

  let y = 14;

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > bottomLimit) {
      doc.addPage();
      y = 18;
    }
  };

  // --- Header Banner ---
  const showTimerMeta = state.showEscapeTimer && state.elapsedSeconds > 0;
  doc.setFillColor(234, 230, 220);
  doc.roundedRect(margin, y, contentWidth, 43, 3, 3, 'F');
  doc.setDrawColor(29, 78, 137);
  doc.setLineWidth(0.7);
  doc.line(margin, y + 43, margin + contentWidth, y + 43);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(29, 78, 137);
  doc.text(
    'ECOS DE TAMARÁN: EL CUADERNO DEL TIEMPO · GRAN CANARIA (LOMLOE · EMOCREA)',
    margin + 5,
    y + 7
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(23, 27, 33);
  doc.text('Diario de Reflexión y Seguimiento Competencial', margin + 5, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(58, 69, 84);
  doc.text(
    `Alumnado / Equipo: ${studentName}   |   ${cycleLabel} (${toPdfText(difficulty.levelName)})`,
    margin + 5,
    y + 22
  );
  doc.text(
    `Guía: ${toPdfText(explorer.name)}   |   Fecha: ${today}   |   Salas: ${completedRoomsCount}/4   |   Cerrojos: ${unlockedDoorsCount}/4${
      showTimerMeta ? `   |   Tiempo: ${formatEscapeTime(state.elapsedSeconds)}` : ''
    }`,
    margin + 5,
    y + 28
  );
  const atlasCount = state.atlasLayersCompleted?.length ?? 0;
  const timelineDone = Boolean(state.timelineSolved);
  const specificCompetencies = evaluateSpecificCompetencies(state, cycle);

  doc.text(
    `Enigmas: ${puzzlesSolvedCount}/8 (Pistas: ${totalHintsUsed})   |   Reflexiones: ${entriesCount}/4   |   Insignias: ${state.unlockedBadges.length}/${BADGES.length}`,
    margin + 5,
    y + 34
  );
  doc.text(
    `Atlas Natural: ${atlasCount}/4   |   Línea Tiempo: ${
      timelineDone ? 'Sí' : 'Pend.'
    }   |   Sombras: ${shadowsSolvedCount}/4   |   Cápsulas: ${capsulesUnlockedCount}/4`,
    margin + 5,
    y + 39.5
  );

  y += 49;

  // --- Muro de Pega-notas (summary strip if present) ---
  if (pinnedNotes.length > 0) {
    ensureSpace(32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(23, 27, 33);
    doc.text(
      `Muro de Pega-notas emocionales (${pinnedNotes.length}/4)`,
      margin,
      y
    );
    y += 4.5;

    const gap = 4;
    const cardW = (contentWidth - gap * 3) / 4;
    const cardH = 21;

    pinnedNotes.forEach(({ room, note }, idx) => {
      const col = idx % 4;
      const x = margin + col * (cardW + gap);
      const colors = STICKY_RGB[note.color] ?? STICKY_RGB.ochre;

      doc.setFillColor(...colors.bg);
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.45);
      doc.roundedRect(x, y, cardW, cardH, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...colors.text);
      doc.text(`Sala ${room.number} · ${toPdfText(room.mapZoneLabel)}`, x + cardW / 2, y + 5.5, {
        align: 'center',
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(toPdfText(note.word), x + cardW / 2, y + 12.2, {
        align: 'center',
      });

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text(`Emoción: ${getEmojiLabel(note.emoji)}`, x + cardW / 2, y + 17.5, {
        align: 'center',
      });
    });

    y += cardH + 8;
  }

  // --- Per-Room Entries ---
  for (const room of ROOMS_DATA) {
    const p = state.progress[room.id];
    const entry = state.journal[room.id];
    const emo = state.emotions[room.id];
    const beforeMood = getMoodById(emo?.before);
    const afterMood = getMoodById(emo?.after);
    const seals =
      Number(p.puzzle1Solved) +
      Number(p.puzzle2Solved) +
      Number(p.empathySolved);
    const roomHints = p.hintsUsed.puzzle1 + p.hintsUsed.puzzle2;

    const reflectionLines = entry
      ? doc.splitTextToSize(`«${toPdfText(entry.reflectionText)}»`, contentWidth - 14)
      : [];
    const emotionLines = entry
      ? doc.splitTextToSize(
          `Emoción identificada (EMOCREA): ${toPdfText(entry.emotionSelected)}`,
          contentWidth - 10
        )
      : [];
    const decisionLines = entry
      ? doc.splitTextToSize(
          `Decisión empática: ${toPdfText(entry.decisionLabel)}`,
          contentWidth - 10
        )
      : [];
    const criticalLines = entry
      ? doc.splitTextToSize(
          `Pensamiento crítico: ${toPdfText(entry.criticalTakeaway)}`,
          contentWidth - 10
        )
      : [];
    const clueLines = p.clueFound
      ? doc.splitTextToSize(
          `Hallazgo recogido: ${toPdfText(room.clue.title)} — ${toPdfText(
            room.clue.historicalNote
          )}`,
          contentWidth - 10
        )
      : [];

    const hasThermometer = Boolean(beforeMood || afterMood);
    const estimatedHeight =
      23 +
      (hasThermometer ? 6 : 0) +
      (clueLines.length > 0 ? clueLines.length * 4.2 + 3 : 0) +
      (entry
        ? (emotionLines.length + decisionLines.length + criticalLines.length) *
            4.4 +
          reflectionLines.length * 4.8 +
          16 +
          (entry.stickyNote ? 10 : 0)
        : 10);

    ensureSpace(estimatedHeight + 4);

    const cardStartY = y;

    doc.setFillColor(245, 243, 238);
    doc.setDrawColor(210, 205, 194);
    doc.setLineWidth(0.35);
    doc.roundedRect(margin, cardStartY, contentWidth, estimatedHeight, 2.5, 2.5, 'FD');

    let curY = cardStartY + 6.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(82, 96, 113);
    doc.text(
      `SALA ${room.number} · ${toPdfText(room.epoch).toUpperCase()} (${toPdfText(
        room.years
      )})`,
      margin + 5,
      curY
    );

    const extrasLabel = `Cerrojo: ${p.doorUnlocked ? 'Abierto' : 'Pend.'} | Sombras: ${
      p.shadowSolved ? 'Sí' : 'No'
    } | Misión 2030: ${p.transversalSolved ? 'Sí' : 'No'} | Pistas: ${roomHints}`;
    doc.setFontSize(8);
    doc.setTextColor(29, 78, 137);
    doc.text(
      `Sellos: ${seals}/3 | ${extrasLabel}`,
      margin + contentWidth - 5,
      curY,
      { align: 'right' }
    );

    curY += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(23, 27, 33);
    doc.text(toPdfText(room.title), margin + 5, curY);

    curY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(82, 96, 113);
    doc.text(
      `Eje transversal: ${toPdfText(TRANSVERSAL_MISSIONS[room.id].axis)}`,
      margin + 5,
      curY
    );

    curY += 4.5;

    if (hasThermometer) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(138, 84, 16);
      doc.text(
        `Termómetro emocional: Antes ${
          beforeMood ? toPdfText(beforeMood.label) : '—'
        } -> Después ${afterMood ? toPdfText(afterMood.label) : '—'}`,
        margin + 5,
        curY
      );
      curY += 5.5;
    }

    if (clueLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(74, 85, 100);
      doc.text(clueLines, margin + 5, curY);
      curY += clueLines.length * 4.2 + 2.5;
    }

    if (entry) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(35, 42, 52);

      doc.text(emotionLines, margin + 5, curY);
      curY += emotionLines.length * 4.4 + 1;

      doc.text(decisionLines, margin + 5, curY);
      curY += decisionLines.length * 4.4 + 1;

      doc.text(criticalLines, margin + 5, curY);
      curY += criticalLines.length * 4.4 + 2.5;

      const quoteBoxHeight = reflectionLines.length * 4.8 + 7;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(196, 214, 204);
      doc.roundedRect(
        margin + 5,
        curY - 1,
        contentWidth - 10,
        quoteBoxHeight,
        2,
        2,
        'FD'
      );

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(23, 27, 33);
      doc.text(reflectionLines, margin + 8, curY + 4.2);
      curY += quoteBoxHeight + 3;

      if (entry.stickyNote) {
        const colors = STICKY_RGB[entry.stickyNote.color] ?? STICKY_RGB.ochre;
        const noteText = `Pega-nota: ${toPdfText(
          entry.stickyNote.word
        )} (Emoción: ${getEmojiLabel(entry.stickyNote.emoji)})`;
        doc.setFillColor(...colors.bg);
        doc.setDrawColor(...colors.border);
        doc.roundedRect(margin + 5, curY - 1, contentWidth - 10, 7.5, 1.5, 1.5, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.8);
        doc.setTextColor(...colors.text);
        doc.text(noteText, margin + 8, curY + 4);
      }
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(107, 116, 130);
      doc.text(
        'Pendiente de completar el dilema empático y la reflexión de esta sala.',
        margin + 5,
        curY + 1.5
      );
    }

    y = cardStartY + estimatedHeight + 5;
  }

  // --- Automatic Specific Competencies Evaluation (CE2-CE9 · Conocimiento del Medio) ---
  ensureSpace(64);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(42, 111, 78);
  doc.text(
    'Evaluación orientativa por Competencias Específicas de Conocimiento del Medio (CE2–CE9)',
    margin,
    y
  );
  y += 5;

  for (const ce of specificCompetencies) {
    const line1 = `${ce.id} · ${toPdfText(ce.shortTitle)} — Nivel: ${ce.level} (${ce.percentage}%)`;
    const line2 = doc.splitTextToSize(
      `Evidencias: ${toPdfText(ce.evidence)}  |  Descriptores: ${ce.descriptors}`,
      contentWidth - 8
    );
    const blockH = 7.5 + line2.length * 3.8 + 3;
    ensureSpace(blockH + 2);

    doc.setFillColor(242, 248, 244);
    doc.setDrawColor(196, 214, 204);
    doc.roundedRect(margin, y, contentWidth, blockH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.6);
    doc.setTextColor(23, 27, 33);
    doc.text(line1, margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(58, 69, 84);
    doc.text(line2, margin + 4, y + 9.4);

    y += blockH + 2.2;
  }

  y += 3;

  // --- Teacher Competency Rubric Reference Block ---
  ensureSpace(68);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(29, 78, 137);
  doc.text('Guía orientativa de evaluación competencial (LOMLOE · Canarias)', margin, y);
  y += 5;

  for (const row of LOMLOE_COMPETENCY_RUBRIC) {
    const line1 = doc.splitTextToSize(
      `${toPdfText(row.dimension)} (${toPdfText(row.competencies)})`,
      contentWidth - 8
    );
    const line2 = doc.splitTextToSize(
      `Adquirido: ${toPdfText(row.adquirido)}  |  Avanzado: ${toPdfText(row.avanzado)}`,
      contentWidth - 8
    );
    const blockH = (line1.length + line2.length) * 4 + 6;
    ensureSpace(blockH + 3);

    doc.setFillColor(249, 248, 244);
    doc.setDrawColor(214, 209, 196);
    doc.roundedRect(margin, y, contentWidth, blockH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(23, 27, 33);
    doc.text(line1, margin + 4, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(58, 69, 84);
    doc.text(line2, margin + 4, y + 4.8 + line1.length * 4 + 0.5);

    y += blockH + 2.5;
  }

  // --- Footer on every page ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(214, 209, 196);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 116, 130);
    doc.text(
      'Ecos de Tamarán · Cuaderno de Reflexión y Rúbrica (Conocimiento del Medio, EMOCREA y Valores · Canarias)',
      margin,
      pageHeight - 8.5
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8.5, {
      align: 'right',
    });
  }

  const slug = studentName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  doc.save(`diario-tamaran-${slug || 'reflexion'}.pdf`);
}
