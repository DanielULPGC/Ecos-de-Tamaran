import { ROOMS_DATA } from '../data/roomsData';
import {
  CURRICULUM_OVERVIEW,
  LEARNING_SITUATION_SA,
  LOMLOE_COMPETENCY_RUBRIC,
  SCIENTIFIC_PRECISION_NOTES,
  SPECIFIC_COMPETENCIES_CMN,
  TEACHER_CURRICULUM_BY_ROOM,
} from '../data/curriculumData';
import { GLOSSARY_TERMS } from '../data/glossaryData';
import { HISTORICAL_GLOSSARY_ENTRIES } from '../data/historicalGlossaryData';
import {
  ASSEMBLY_FLASH_QUESTIONS,
  CANARIAN_COLLECTIBLES,
  COOPERATIVE_ROLES,
  TRANSVERSAL_MISSIONS,
} from '../data/enrichmentData';
import { BADGES, EXPLORERS } from '../data/charactersAndBadges';
import { SHADOW_CHALLENGES } from '../data/shadowMatchData';
import { TIME_CAPSULES } from '../data/timeCapsules';
import { HONOR_ACHIEVEMENTS } from '../data/honorAchievements';
import { DIFFICULTY_PROFILES } from '../data/difficultyConfig';
import { ROOM_EXIT_LOCKS } from '../data/escapeLocks';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapHtmlDoc(title: string, subtitle: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} — Ecos de Tamarán</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #232a34; background: #ffffff; max-width: 920px; margin: 32px auto; padding: 0 20px; line-height: 1.55; }
    header { border-bottom: 2px solid #1d4e89; padding-bottom: 14px; margin-bottom: 24px; }
    h1 { margin: 6px 0 4px 0; font-size: 26px; color: #171b21; }
    h2 { margin: 22px 0 8px 0; font-size: 19px; color: #1d4e89; }
    h3 { margin: 14px 0 6px 0; font-size: 15px; color: #232a34; }
    .meta { font-size: 12px; color: #526071; }
    .card { border: 1px solid #d6d1c4; border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; background: #faf8f4; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
    .picto { display: inline-block; background: #ffffff; border: 1px solid #dfd9cc; border-radius: 6px; padding: 6px 10px; font-weight: 700; font-size: 13px; margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0 18px 0; font-size: 13px; }
    th, td { border: 1px solid #d6d1c4; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #eae6dc; color: #171b21; }
    ul { margin: 6px 0 6px 18px; padding: 0; }
    li { margin-bottom: 4px; font-size: 14px; }
    p { margin: 6px 0; font-size: 14px; }
    footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #d6d1c4; font-size: 12px; color: #526071; }
  </style>
</head>
<body>
  <header>
    <div class="meta">Ecos de Tamarán: El Cuaderno del Tiempo · Educación Primaria (Gran Canaria · LOMLOE)</div>
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">${escapeHtml(subtitle)}</div>
  </header>
  ${bodyHtml}
  <footer>Material didáctico generado desde Ecos de Tamarán · Currículo de Canarias (Decreto 211/2022, Conocimiento del Medio, EMOCREA y Valores Cívicos y Éticos).</footer>
</body>
</html>`;
}

// --- Minimal standard PKZIP (Store / method 0) with IEEE CRC-32 & UTF-8 flag ---
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

interface ZipInputFile {
  name: string;
  content: string;
}

function buildZipBlob(files: ZipInputFile[]): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((Math.max(1980, now.getFullYear()) - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const checksum = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, checksum, true);
    lv.setUint32(18, dataBytes.length, true);
    lv.setUint32(22, dataBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, checksum, true);
    cv.setUint32(20, dataBytes.length, true);
    cv.setUint32(24, dataBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    localParts.push(localHeader, dataBytes);
    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const blobParts: BlobPart[] = [
    ...localParts.map((u) => u.buffer as ArrayBuffer),
    ...centralParts.map((u) => u.buffer as ArrayBuffer),
    eocd.buffer as ArrayBuffer,
  ];

  return new Blob(blobParts, { type: 'application/zip' });
}

function generateCurriculumHtml(): string {
  const areasHtml = `<div class="grid">${CURRICULUM_OVERVIEW.areas
    .map(
      (a) =>
        `<div class="card"><h3>${escapeHtml(a.name)}</h3><p>${escapeHtml(
          a.focus
        )}</p></div>`
    )
    .join('')}</div>`;

  const ceIndexHtml = `
    <section class="card">
      <h2>Competencias Específicas de Conocimiento del Medio (Decreto 211/2022)</h2>
      <table>
        <thead>
          <tr><th>Código</th><th>Competencia Específica</th><th>Bloques</th><th>Descriptores Perfil de Salida</th></tr>
        </thead>
        <tbody>
          ${SPECIFIC_COMPETENCIES_CMN.map(
            (ce) => `<tr>
              <td><strong>${escapeHtml(ce.id)}</strong></td>
              <td><strong>${escapeHtml(ce.shortTitle)}</strong><br/>${escapeHtml(
              ce.officialFocus
            )}</td>
              <td>${escapeHtml(ce.blocks)}</td>
              <td>${escapeHtml(ce.descriptors)}</td>
            </tr>`
          ).join('')}
        </tbody>
      </table>
    </section>`;

  const saHtml = `
    <section class="card">
      <div class="meta">${escapeHtml(LEARNING_SITUATION_SA.code)} · ${escapeHtml(
    LEARNING_SITUATION_SA.duration
  )}</div>
      <h2>Situación de Aprendizaje (SA): ${escapeHtml(LEARNING_SITUATION_SA.title)}</h2>
      <p><strong>Justificación:</strong> ${escapeHtml(LEARNING_SITUATION_SA.justification)}</p>
      <p><strong>Producto final:</strong> ${escapeHtml(LEARNING_SITUATION_SA.finalProduct)}</p>
      <h3>Secuencia por sesiones (Bloques A, B y C)</h3>
      <table>
        <thead><tr><th>Sesión</th><th>Título y duración</th><th>Bloques / CE</th><th>Actividades clave</th></tr></thead>
        <tbody>
          ${LEARNING_SITUATION_SA.sessions
            .map(
              (s) => `<tr>
                <td><strong>Sesión ${s.number}</strong></td>
                <td>${escapeHtml(s.title)} (${escapeHtml(s.duration)})</td>
                <td>${escapeHtml(s.blocks)} · ${escapeHtml(s.ces.join(', '))}</td>
                <td>${escapeHtml(s.activity)}</td>
              </tr>`
            )
            .join('')}
        </tbody>
      </table>
      <h3>Agrupamientos, Medidas DUA e Instrumentos de Evaluación</h3>
      <ul>${[
        ...LEARNING_SITUATION_SA.groupings,
        ...LEARNING_SITUATION_SA.duaMeasures,
        ...LEARNING_SITUATION_SA.assessmentInstruments,
      ]
        .map((x) => `<li>${escapeHtml(x)}</li>`)
        .join('')}</ul>
    </section>`;

  const roomsHtml = TEACHER_CURRICULUM_BY_ROOM.map(
    (item) => `
    <section class="card">
      <div class="meta">${escapeHtml(item.epoch)} · Competencias Específicas: ${escapeHtml(
      item.competenciasEspecificas.join(' · ')
    )}</div>
      <h2>${escapeHtml(item.roomTitle)}</h2>
      <h3>Bloque A · Cultura científica y Medio Natural (2.º y 3.º Ciclo)</h3>
      <ul>${[...item.saberesBloqueA.ciclo2, ...item.saberesBloqueA.ciclo3]
        .map((s) => `<li>${escapeHtml(s)}</li>`)
        .join('')}</ul>
      <h3>Bloque B · Tecnología y digitalización</h3>
      <ul>${[...item.saberesBloqueB.ciclo2, ...item.saberesBloqueB.ciclo3]
        .map((s) => `<li>${escapeHtml(s)}</li>`)
        .join('')}</ul>
      <h3>Bloque C · Sociedades y territorios (2.º y 3.º Ciclo)</h3>
      <ul>${[
        ...item.saberesConocimientoMedio.ciclo2,
        ...item.saberesConocimientoMedio.ciclo3,
      ]
        .map((s) => `<li>${escapeHtml(s)}</li>`)
        .join('')}</ul>
      <h3>EMOCREA y Valores Cívicos y Éticos</h3>
      <ul>${[
        ...item.saberesEmocreaValores.ciclo2,
        ...item.saberesEmocreaValores.ciclo3,
      ]
        .map((s) => `<li>${escapeHtml(s)}</li>`)
        .join('')}</ul>
      <h3>Criterios de evaluación codificados (2.º y 3.º Ciclo)</h3>
      <ul>${[
        ...item.criteriosCodificados.ciclo2,
        ...item.criteriosCodificados.ciclo3,
      ]
        .map(
          (c) =>
            `<li><strong>${escapeHtml(c.code)} (${escapeHtml(
              c.ce
            )}):</strong> ${escapeHtml(c.text)}</li>`
        )
        .join('')}</ul>
      <h3>Preguntas para la asamblea de aula</h3>
      <ul>${item.preguntasAsamblea
        .map((q) => `<li>${escapeHtml(q)}</li>`)
        .join('')}</ul>
    </section>`
  ).join('');

  const rubricHtml = `
    <section class="card">
      <h2>Rúbrica Competencial Orientativa (LOMLOE · Decreto 211/2022)</h2>
      <table>
        <thead>
          <tr>
            <th>Dimensión y Competencias</th>
            <th>1 · Iniciado</th>
            <th>2 · En proceso</th>
            <th>3 · Adquirido</th>
            <th>4 · Avanzado</th>
          </tr>
        </thead>
        <tbody>
          ${LOMLOE_COMPETENCY_RUBRIC.map(
            (r) => `<tr>
              <td><strong>${escapeHtml(r.dimension)}</strong><div class="meta">${escapeHtml(
              r.competencies
            )}</div></td>
              <td>${escapeHtml(r.iniciado)}</td>
              <td>${escapeHtml(r.enProceso)}</td>
              <td>${escapeHtml(r.adquirido)}</td>
              <td>${escapeHtml(r.avanzado)}</td>
            </tr>`
          ).join('')}
        </tbody>
      </table>
    </section>`;

  const rigorHtml = `
    <section class="card">
      <h2>Notas de Rigor Histórico y Arqueológico para el Profesorado</h2>
      <ul>${SCIENTIFIC_PRECISION_NOTES.map(
        (n) =>
          `<li><strong>${escapeHtml(n.topic)}</strong> (${escapeHtml(
            n.roomRef
          )}): ${escapeHtml(n.clarification)}</li>`
      ).join('')}</ul>
    </section>`;

  return wrapHtmlDoc(
    'Ficha Docente · Conocimiento del Medio (Decreto 211/2022), Situación de Aprendizaje y Rúbrica',
    `${CURRICULUM_OVERVIEW.mencion} · ${CURRICULUM_OVERVIEW.normativa}`,
    areasHtml + ceIndexHtml + saHtml + roomsHtml + rubricHtml + rigorHtml
  );
}

function generateRoomsGuideHtml(): string {
  const difficultyHtml = `
    <section class="card">
      <h2>Selector de Dificultad por Ciclo (2.º y 3.º de Primaria)</h2>
      <table>
        <thead>
          <tr>
            <th>Nivel y Ciclo</th>
            <th>Puzle de Sombras</th>
            <th>Pistas en Enigmas</th>
            <th>Cerrojo de Salida</th>
            <th>Taller de Murales</th>
          </tr>
        </thead>
        <tbody>
          ${(['ciclo2', 'ciclo3'] as const)
            .map((cid) => {
              const p = DIFFICULTY_PROFILES[cid];
              return `<tr>
                <td><strong>${escapeHtml(p.levelName)}</strong> (${escapeHtml(p.cycleLabel)} · ${escapeHtml(p.gradesLabel)})</td>
                <td>${p.shadowPiecesCount} piezas (${p.shadowShowCardCue ? 'con pista visual fija' : 'observación pura'})</td>
                <td>Hasta ${p.maxPuzzleHints} ayudas · ${escapeHtml(p.clueLengthLabel)}</td>
                <td>3 cilindros × ${p.exitLockOptionsPerDial} opciones</td>
                <td>${escapeHtml(p.jigsawDefaultLabel)}</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </section>`;

  const explorersHtml = `
    <section class="card">
      <h2>Exploradores elegibles, poderes y hojas de desarrollo</h2>
      ${EXPLORERS.map(
        (e) => `
        <div style="margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #e2ddd2;">
          <h3>${escapeHtml(e.name)} — ${escapeHtml(e.role)} (${escapeHtml(e.sheet.age)} · ${escapeHtml(e.sheet.origin)})</h3>
          <p><strong>Poder:</strong> ${escapeHtml(e.powerName)} — ${escapeHtml(e.powerDetail)}</p>
          <p><strong>Rasgos:</strong> ${escapeHtml(e.sheet.personalityTraits.join(', '))} · <strong>Lema:</strong> «${escapeHtml(e.sheet.motto)}»</p>
          <p><strong>Meta inicial:</strong> ${escapeHtml(e.sheet.startingGoal)} · <strong>Reto de crecimiento:</strong> ${escapeHtml(e.sheet.learningChallenge)}</p>
        </div>`
      ).join('')}
      <h3>Roles cooperativos para Modo Asamblea</h3>
      <ul>${COOPERATIVE_ROLES.map(
        (r) =>
          `<li>${escapeHtml(r.emoji)} <strong>${escapeHtml(
            r.title
          )}</strong>: ${escapeHtml(r.task)}</li>`
      ).join('')}</ul>
    </section>`;

  const roomsHtml = ROOMS_DATA.map((room) => {
    const flashQs = ASSEMBLY_FLASH_QUESTIONS[room.id] ?? [];
    const shadow = SHADOW_CHALLENGES[room.id];
    const exitLock = ROOM_EXIT_LOCKS[room.id];
    const lockKeysC2 = exitLock.dials.ciclo2
      .map((d) => `${d.label}: ${d.options[d.correctIndex]}`)
      .join(' · ');
    const lockKeysC3 = exitLock.dials.ciclo3
      .map((d) => `${d.label}: ${d.options[d.correctIndex]}`)
      .join(' · ');
    return `
      <section class="card">
        <div class="meta">Sala ${room.number} · ${escapeHtml(
      room.epoch
    )} (${escapeHtml(room.years)}) · ${escapeHtml(room.location)}</div>
        <h2>${escapeHtml(room.title)}</h2>
        <p><strong>Hallazgo:</strong> ${escapeHtml(
          room.clue.title
        )} — ${escapeHtml(room.clue.historicalNote)}</p>
        <h3>Enigma 1: ${escapeHtml(room.puzzle1.title)} (${escapeHtml(
      room.puzzle1.sealTitle
    )})</h3>
        <p><em>2.º Ciclo:</em> ${escapeHtml(room.puzzle1.intro.ciclo2)}</p>
        <p><em>3.º Ciclo:</em> ${escapeHtml(room.puzzle1.intro.ciclo3)}</p>
        <p><em>Pista final (3.º nivel):</em> ${escapeHtml(
          room.puzzle1.hints.ciclo2.level3
        )} / ${escapeHtml(room.puzzle1.hints.ciclo3.level3)}</p>
        <h3>Enigma 2: ${escapeHtml(room.puzzle2.title)} (${escapeHtml(
      room.puzzle2.sealTitle
    )})</h3>
        <p><em>2.º Ciclo:</em> ${escapeHtml(room.puzzle2.intro.ciclo2)}</p>
        <p><em>3.º Ciclo:</em> ${escapeHtml(room.puzzle2.intro.ciclo3)}</p>
        <p><em>Pista final (3.º nivel):</em> ${escapeHtml(
          room.puzzle2.hints.ciclo2.level3
        )} / ${escapeHtml(room.puzzle2.hints.ciclo3.level3)}</p>
        <h3>Juego de Sombras: ${escapeHtml(shadow.title)}</h3>
        <ul>${shadow.artifacts
          .map(
            (a) =>
              `<li><strong>${escapeHtml(a.name)}:</strong> ${escapeHtml(
                a.shortFact
              )}</li>`
          )
          .join('')}</ul>
        <p><em>Pista histórica desbloqueada (3.º Ciclo):</em> ${escapeHtml(
          shadow.unlockedClueText.ciclo3
        )}</p>
        <h3>Dilema de Empatía y Pensamiento Crítico: ${escapeHtml(
          room.empathy.title
        )}</h3>
        <p>${escapeHtml(room.empathy.setting)}</p>
        <ul>
          <li><strong>${escapeHtml(
            room.empathy.voices[0].name
          )}</strong> (${escapeHtml(
      room.empathy.voices[0].role
    )}): ${escapeHtml(room.empathy.voices[0].quote.ciclo3)}</li>
          <li><strong>${escapeHtml(
            room.empathy.voices[1].name
          )}</strong> (${escapeHtml(
      room.empathy.voices[1].role
    )}): ${escapeHtml(room.empathy.voices[1].quote.ciclo3)}</li>
        </ul>
        <h3>Cerrojo de Salida (Escape Room): ${escapeHtml(exitLock.lockName)}</h3>
        <p><strong>${escapeHtml(exitLock.doorTitle)}</strong></p>
        <ul>
          <li><strong>Claves 2.º Ciclo (3 opciones/dial):</strong> ${escapeHtml(lockKeysC2)}</li>
          <li><strong>Claves 3.º Ciclo (4 opciones/dial):</strong> ${escapeHtml(lockKeysC3)}</li>
        </ul>
        <p><strong>Preguntas relámpago de Asamblea:</strong> ${flashQs
          .map((q) => escapeHtml(q))
          .join(' | ')}</p>
      </section>`;
  }).join('');

  const badgesHtml = `
    <section class="card">
      <h2>${BADGES.length} Insignias de Explorador</h2>
      <ul>${BADGES.map(
        (b) =>
          `<li><strong>${escapeHtml(b.title)}</strong> — ${escapeHtml(
            b.subtitle
          )}${
            b.requirementDetail
              ? ` <span class="meta">(${escapeHtml(b.requirementDetail)})</span>`
              : ''
          }</li>`
      ).join('')}</ul>
    </section>`;

  return wrapHtmlDoc(
    'Guía Completa de las 4 Salas, Cerrojos, Dificultad y Personajes',
    'Solucionario orientativo de enigmas y cerrojos de salida, niveles por ciclo, voces históricas y dinámicas cooperativas',
    difficultyHtml + explorersHtml + roomsHtml + badgesHtml
  );
}

function generateGlossaryHtml(): string {
  const historicalCards = HISTORICAL_GLOSSARY_ENTRIES.map(
    (e) => `
    <article class="card">
      <div class="meta">Letra ${escapeHtml(e.letter)} · ${escapeHtml(
      e.theme
    )}</div>
      <h3>${escapeHtml(e.term)}</h3>
      <p><strong>2.º Ciclo:</strong> ${escapeHtml(e.definition.ciclo2)}</p>
      <p><strong>3.º Ciclo:</strong> ${escapeHtml(e.definition.ciclo3)}</p>
      <p class="meta"><strong>En Gran Canaria:</strong> ${escapeHtml(
        e.inGranCanaria
      )}</p>
    </article>`
  ).join('');

  const visualCards = GLOSSARY_TERMS.map(
    (t) => `
    <article class="card">
      <div class="meta">Sala ${t.roomNumber} · ${escapeHtml(t.category)}</div>
      <h3>${escapeHtml(t.term)}</h3>
      <div class="picto">${escapeHtml(t.pictogramSteps.join('  →  '))}</div>
      <p>${escapeHtml(t.simpleDefinition)}</p>
      <p class="meta"><strong>En la aventura:</strong> ${escapeHtml(
        t.example
      )}</p>
    </article>`
  ).join('');

  return wrapHtmlDoc(
    'Glosario Escolar Unificado de Historia y Arqueología de Gran Canaria',
    `${HISTORICAL_GLOSSARY_ENTRIES.length} conceptos históricos A–Z (2.º y 3.º ciclo) + ${GLOSSARY_TERMS.length} fichas visuales con pictogramas`,
    `<h2>Diccionario de Términos Históricos (A–Z)</h2><div class="grid">${historicalCards}</div><h2>Glosario Visual por Sala (Pictogramas)</h2><div class="grid">${visualCards}</div>`
  );
}

function generateTransversalHtml(): string {
  const cards = ROOMS_DATA.map((room) => {
    const m = TRANSVERSAL_MISSIONS[room.id];
    return `
      <section class="card">
        <div class="meta">Sala ${room.number} (${escapeHtml(
      room.title
    )}) · ${escapeHtml(m.axis)} · ${escapeHtml(m.odsTag)}</div>
        <h2>${escapeHtml(m.title)}</h2>
        <p><strong>2.º Ciclo:</strong> ${escapeHtml(m.story.ciclo2)}</p>
        <p><strong>3.º Ciclo:</strong> ${escapeHtml(m.story.ciclo3)}</p>
        <p><strong>Pregunta reto:</strong> ${escapeHtml(m.question)}</p>
        <p><strong>Propuesta de acción para el aula:</strong> ${escapeHtml(
          m.actionTip
        )}</p>
      </section>`;
  }).join('');

  return wrapHtmlDoc(
    'Misiones Transversales · Agenda Canaria 2030',
    'Coeducación, Convivencia y Derechos Humanos, Alfabetización Mediática y Sostenibilidad',
    cards
  );
}

function generateAlbumHtml(): string {
  const collectiblesCards = CANARIAN_COLLECTIBLES.map((c) => {
    const room = ROOMS_DATA.find((r) => r.id === c.roomId);
    return `
      <article class="card">
        <div class="meta">Sala ${room?.number ?? ''} · ${escapeHtml(
      c.category
    )}</div>
        <h3>${escapeHtml(c.word)} · ${escapeHtml(c.secondaryWord)}</h3>
        <p>${escapeHtml(c.meaning)}</p>
        <p><em>${escapeHtml(c.exampleSentence)}</em></p>
        <p><strong>Dato cultural:</strong> ${escapeHtml(c.culturalFact)}</p>
      </article>`;
  }).join('');

  const capsulesCards = TIME_CAPSULES.map(
    (cap) => `
    <article class="card">
      <div class="meta">Cápsula ${cap.capsuleNumber}/4 · ${escapeHtml(
      cap.historicalDate
    )} · ${escapeHtml(cap.location)}</div>
      <h3>${escapeHtml(cap.title)}</h3>
      <p><strong>2.º Ciclo:</strong> ${escapeHtml(cap.summary.ciclo2)}</p>
      <p><strong>3.º Ciclo:</strong> ${escapeHtml(cap.summary.ciclo3)}</p>
      <p><strong>Detalles visuales para observar:</strong></p>
      <ul>${cap.spotDetails
        .map((d) => `<li>${escapeHtml(d)}</li>`)
        .join('')}</ul>
    </article>`
  ).join('');

  const honorList = `
    <section class="card">
      <h2>Muro de Honor (${HONOR_ACHIEVEMENTS.length} logros especiales)</h2>
      <ul>${HONOR_ACHIEVEMENTS.map(
        (h) =>
          `<li><strong>${escapeHtml(h.title)}</strong> (${escapeHtml(
            h.category
          )}): ${escapeHtml(h.description)}</li>`
      ).join('')}</ul>
    </section>`;

  return wrapHtmlDoc(
    'Álbum de Conquistas: Patrimonio Canario, Cápsulas del Tiempo y Muro de Honor',
    'Léxico, fauna, escenas históricas ilustradas y retos especiales para trabajar en clase',
    `<h2>Tesoros del Patrimonio y Habla Canaria</h2><div class="grid">${collectiblesCards}</div><h2>4 Cápsulas del Tiempo</h2>${capsulesCards}${honorList}`
  );
}

export function downloadEducationalContentZip() {
  const readme = [
    'ECOS DE TAMARÁN: EL CUADERNO DEL TIEMPO',
    'Dossier completo de contenidos didácticos (Gran Canaria · Educación Primaria · LOMLOE)',
    '=====================================================================================',
    '',
    'Contenido incluido en este archivo ZIP:',
    '1. 01_Ficha_Docente_LOMLOE_y_Rubrica.html — Saberes básicos, criterios, rúbrica competencial de 4 niveles y notas de rigor histórico.',
    '2. 02_Guia_Salas_Enigmas_Sombras_y_Personajes.html — Niveles de dificultad por ciclo, recorrido por las 4 salas, solucionario de enigmas y cerrojos de salida, Juego de Sombras, hojas de desarrollo y ' +
      `${BADGES.length} insignias.`,
    '3. 03_Glosario_Unificado_Gran_Canaria.html — Diccionario histórico escolar A–Z (20 conceptos) y Glosario Visual con pictogramas (16 fichas).',
    '4. 04_Misiones_Transversales_Agenda_2030.html — 4 misiones transversales (Coeducación, DDHH, Bulos y ODS).',
    '5. 05_Album_Patrimonio_Capsulas_y_Honor.html — Tesoros del habla canaria, 4 Cápsulas del Tiempo y Muro de Honor.',
    '',
    'Cómo usarlos: haz doble clic en cualquier archivo .html para abrirlo en el navegador o imprimirlo en PDF.',
  ].join('\r\n');

  const blob = buildZipBlob([
    { name: 'LEEME.txt', content: readme },
    {
      name: '01_Ficha_Docente_LOMLOE_y_Rubrica.html',
      content: generateCurriculumHtml(),
    },
    {
      name: '02_Guia_Salas_Enigmas_Sombras_y_Personajes.html',
      content: generateRoomsGuideHtml(),
    },
    {
      name: '03_Glosario_Unificado_Gran_Canaria.html',
      content: generateGlossaryHtml(),
    },
    {
      name: '04_Misiones_Transversales_Agenda_2030.html',
      content: generateTransversalHtml(),
    },
    {
      name: '05_Album_Patrimonio_Capsulas_y_Honor.html',
      content: generateAlbumHtml(),
    },
  ]);

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'ecos-de-tamaran-contenidos.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
