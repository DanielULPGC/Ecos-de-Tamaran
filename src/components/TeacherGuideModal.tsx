import React, { useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  ClipboardCheck,
  Download,
  Info,
  Layers,
  Printer,
  X,
} from 'lucide-react';
import { CycleId, ExpeditionState } from '../types/game';
import {
  CURRICULUM_OVERVIEW,
  LEARNING_SITUATION_SA,
  LOMLOE_COMPETENCY_RUBRIC,
  SCIENTIFIC_PRECISION_NOTES,
  SPECIFIC_COMPETENCIES_CMN,
  TEACHER_CURRICULUM_BY_ROOM,
  evaluateSpecificCompetencies,
} from '../data/curriculumData';
import { downloadEducationalContentZip } from '../utils/exportContentZip';
import { soundEngine } from '../utils/audio';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface TeacherGuideModalProps {
  initialCycle: CycleId;
  state?: ExpeditionState;
  onClose: () => void;
}

export const TeacherGuideModal: React.FC<TeacherGuideModalProps> = ({
  initialCycle,
  state,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(dialogRef, true);

  const [viewCycle, setViewCycle] = useState<CycleId>(initialCycle);
  const [activeSection, setActiveSection] = useState<
    'curriculo' | 'sa' | 'rubrica' | 'rigor'
  >('curriculo');

  const liveCompetencies = useMemo(
    () => (state ? evaluateSpecificCompetencies(state, viewCycle) : []),
    [state, viewCycle]
  );

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/84 p-3 sm:p-6"
    >
      <div className="print-surface flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#526071]">
              <BookOpen className="h-4 w-4 text-[#1D4E89]" aria-hidden="true" />
              <span>{CURRICULUM_OVERVIEW.mencion}</span>
            </div>
            <h2
              id="teacher-guide-title"
              className="mt-1 font-display text-xl font-bold text-[#171B21] sm:text-2xl"
            >
              Ficha Docente · Conocimiento del Medio (LOMLOE · Canarias)
            </h2>
            <p className="mt-0.5 text-xs text-[#4A5564]">
              {CURRICULUM_OVERVIEW.normativa}
            </p>
          </div>
          <div className="no-print flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playDiscover();
                downloadEducationalContentZip();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4E89] px-3 py-2 text-xs font-bold text-white hover:bg-[#153A68] whitespace-nowrap cursor-pointer"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Descargar dossier (.zip)</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#232A34]/20 bg-white px-3 py-2 text-xs font-semibold text-[#232A34] hover:bg-[#F5F3EE] whitespace-nowrap cursor-pointer"
            >
              <Printer className="h-4 w-4 text-[#1D4E89]" aria-hidden="true" />
              <span>Imprimir ficha</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ficha docente"
              className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Section Tabs + Cycle Filter */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-[#232A34]/10 bg-[#EFECE4] px-6 py-3">
          <div
            role="tablist"
            aria-label="Apartados de la Ficha Docente"
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === 'curriculo'}
              onClick={() => {
                soundEngine.playClick();
                setActiveSection('curriculo');
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'curriculo'
                  ? 'bg-[#1D4E89] text-white'
                  : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#1D4E89]'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Matriz Bloques A·B·C</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === 'sa'}
              onClick={() => {
                soundEngine.playClick();
                setActiveSection('sa');
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'sa'
                  ? 'bg-[#9C5A25] text-white'
                  : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#9C5A25]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Situación de Aprendizaje</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === 'rubrica'}
              onClick={() => {
                soundEngine.playClick();
                setActiveSection('rubrica');
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'rubrica'
                  ? 'bg-[#2A6F4E] text-white'
                  : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#2A6F4E]'
              }`}
            >
              <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Rúbrica y Evaluación CE</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSection === 'rigor'}
              onClick={() => {
                soundEngine.playClick();
                setActiveSection('rigor');
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'rigor'
                  ? 'bg-[#C67D1E] text-[#14181F]'
                  : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#C67D1E]'
              }`}
            >
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Notas de Rigor</span>
            </button>
          </div>

          {activeSection === 'curriculo' && (
            <div className="inline-flex rounded-lg border border-[#232A34]/15 bg-[#E5E0D5] p-1">
              <button
                type="button"
                onClick={() => setViewCycle('ciclo2')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  viewCycle === 'ciclo2'
                    ? 'bg-[#1D4E89] text-white'
                    : 'text-[#333D4B] hover:text-[#171B21]'
                }`}
              >
                2.º Ciclo (3.º y 4.º)
              </button>
              <button
                type="button"
                onClick={() => setViewCycle('ciclo3')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  viewCycle === 'ciclo3'
                    ? 'bg-[#1D4E89] text-white'
                    : 'text-[#333D4B] hover:text-[#171B21]'
                }`}
              >
                3.º Ciclo (5.º y 6.º)
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* TAB 1: MATRIZ CURRICULAR BLOQUES A, B Y C */}
          {activeSection === 'curriculo' && (
            <>
              <section className="grid gap-3 md:grid-cols-3">
                {CURRICULUM_OVERVIEW.areas.map((area) => (
                  <div
                    key={area.name}
                    className="rounded-xl border border-[#232A34]/12 bg-white p-4"
                  >
                    <h3 className="text-sm font-bold text-[#1D4E89]">
                      {area.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#3E4856]">
                      {area.focus}
                    </p>
                  </div>
                ))}
              </section>

              {/* Competencias Específicas CMN quick index */}
              <section className="rounded-xl border border-[#232A34]/12 bg-white p-4 space-y-2.5">
                <h3 className="text-xs font-bold text-[#171B21]">
                  Competencias Específicas trabajadas · Conocimiento del Medio
                  (Decreto 211/2022)
                </h3>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {SPECIFIC_COMPETENCIES_CMN.map((ce) => (
                    <div
                      key={ce.id}
                      className="rounded-lg bg-[#F5F3EE] p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[#1D4E89]">
                          {ce.id}
                        </span>
                        <span className="font-mono text-[10px] text-[#526071]">
                          {ce.blocks}
                        </span>
                      </div>
                      <div className="font-bold text-[#171B21]">
                        {ce.shortTitle}
                      </div>
                      <div className="font-mono text-[10px] text-[#4A5564]">
                        Perfil de Salida: {ce.descriptors}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Matriz por sala con Bloques A, B y C + Criterios codificados */}
              <div className="space-y-4">
                {TEACHER_CURRICULUM_BY_ROOM.map((item) => (
                  <article
                    key={item.roomId}
                    className="rounded-xl border border-[#232A34]/15 bg-white p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#232A34]/10 pb-3">
                      <div>
                        <h3 className="font-display text-lg font-bold text-[#171B21]">
                          {item.roomTitle}
                        </h3>
                        <p className="text-xs text-[#526071]">{item.epoch}</p>
                      </div>
                      <div className="font-mono text-xs font-semibold text-[#1D4E89]">
                        {item.competenciasEspecificas.join(' · ')}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <h4 className="text-xs font-bold text-[#2A6F4E]">
                          Bloque A · Cultura científica y Medio Natural
                        </h4>
                        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#2F3845] list-disc pl-4">
                          {item.saberesBloqueA[viewCycle].map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#1D4E89]">
                          Bloque C · Sociedades y territorios
                        </h4>
                        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#2F3845] list-disc pl-4">
                          {item.saberesConocimientoMedio[viewCycle].map(
                            (s, idx) => (
                              <li key={idx}>{s}</li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-[#8A5410]">
                          Bloque B · Tecnología y EMOCREA / Valores
                        </h4>
                        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#2F3845] list-disc pl-4">
                          {item.saberesBloqueB[viewCycle].map((s, idx) => (
                            <li key={`b-${idx}`}>{s}</li>
                          ))}
                          {item.saberesEmocreaValores[viewCycle].map(
                            (s, idx) => (
                              <li key={`e-${idx}`}>{s}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="grid gap-4 border-t border-[#232A34]/10 pt-3 md:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-bold text-[#171B21]">
                          Criterios de evaluación codificados (
                          {viewCycle === 'ciclo2' ? '2.º Ciclo' : '3.º Ciclo'})
                        </h4>
                        <ul className="mt-1.5 space-y-1.5 text-xs leading-relaxed text-[#3E4856]">
                          {item.criteriosCodificados[viewCycle].map((c) => (
                            <li key={c.code}>
                              <span className="font-mono font-bold text-[#1D4E89]">
                                {c.code} ({c.ce}):
                              </span>{' '}
                              {c.text}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg bg-[#F5F3EE] p-3">
                        <h4 className="text-xs font-bold text-[#8A5410]">
                          Preguntas sugeridas para la asamblea de aula
                        </h4>
                        <ul className="mt-1.5 space-y-1.5 text-xs leading-relaxed text-[#2F3845]">
                          {item.preguntasAsamblea.map((q, idx) => (
                            <li key={idx}>• {q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* TAB 2: SITUACIÓN DE APRENDIZAJE (SA) LISTA PARA PROGRAMACIÓN */}
          {activeSection === 'sa' && (
            <section className="space-y-5">
              <div className="rounded-xl border border-[#9C5A25]/35 bg-[#FAF4E8] p-5 space-y-2">
                <div className="font-mono text-xs font-bold text-[#8A5410]">
                  {LEARNING_SITUATION_SA.code} · {LEARNING_SITUATION_SA.duration}
                </div>
                <h3 className="font-display text-xl font-bold text-[#171B21]">
                  {LEARNING_SITUATION_SA.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#2F3845]">
                  {LEARNING_SITUATION_SA.justification}
                </p>
                <div className="border-t border-[#9C5A25]/20 pt-2.5 text-xs text-[#171B21]">
                  <strong>Producto final evaluable:</strong>{' '}
                  {LEARNING_SITUATION_SA.finalProduct}
                </div>
              </div>

              {/* Secuencia de 6 sesiones */}
              <div className="rounded-xl border border-[#232A34]/15 bg-white p-5 space-y-3">
                <h4 className="font-display text-base font-bold text-[#171B21]">
                  Secuencia didáctica por sesiones (Bloques A, B y C)
                </h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {LEARNING_SITUATION_SA.sessions.map((s) => (
                    <div
                      key={s.number}
                      className="rounded-xl border border-[#232A34]/12 bg-[#FAF8F4] p-3.5 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2 font-mono text-[11px] font-bold text-[#1D4E89] tabular-nums">
                        <span>
                          Sesión {s.number} · {s.duration}
                        </span>
                        <span className="text-[#2A6F4E]">{s.blocks}</span>
                      </div>
                      <div className="text-sm font-bold text-[#171B21]">
                        {s.title}
                      </div>
                      <p className="text-xs leading-relaxed text-[#3E4856]">
                        {s.activity}
                      </p>
                      <div className="pt-1 font-mono text-[10px] font-semibold text-[#526071]">
                        Competencias: {s.ces.join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agrupamientos, DUA e Instrumentos */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[#232A34]/12 bg-white p-4">
                  <h4 className="text-xs font-bold text-[#1D4E89]">
                    Agrupamientos cooperativos
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#333D4B] list-disc pl-4">
                    {LEARNING_SITUATION_SA.groupings.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#232A34]/12 bg-white p-4">
                  <h4 className="text-xs font-bold text-[#2A6F4E]">
                    Medidas DUA integradas
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#333D4B] list-disc pl-4">
                    {LEARNING_SITUATION_SA.duaMeasures.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#232A34]/12 bg-white p-4">
                  <h4 className="text-xs font-bold text-[#8A5410]">
                    Instrumentos de evaluación
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#333D4B] list-disc pl-4">
                    {LEARNING_SITUATION_SA.assessmentInstruments.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: RÚBRICA Y EVALUACIÓN AUTOMÁTICA POR COMPETENCIA ESPECÍFICA */}
          {activeSection === 'rubrica' && (
            <section className="space-y-5">
              {liveCompetencies.length > 0 && (
                <div className="rounded-xl border border-[#1D4E89]/30 bg-white p-4 space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-bold text-[#171B21]">
                        Seguimiento orientativo en vivo por Competencia
                        Específica (CE2–CE9)
                      </h3>
                      <p className="text-xs text-[#526071]">
                        Calculado automáticamente a partir de los retos
                        resueltos, el uso autónomo de pistas, el Atlas Natural y
                        la Línea del Tiempo.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {liveCompetencies.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[#232A34]/12 bg-[#FAF8F4] p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-mono font-bold text-[#1D4E89]">
                            {item.id}
                          </span>
                          <span className="font-mono font-bold text-[#2A6F4E] tabular-nums">
                            {item.level} · {item.percentage}%
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#171B21]">
                          {item.shortTitle}
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DFDACF]">
                          <div
                            className="h-full rounded-full bg-[#1D4E89] transition-transform duration-300 origin-left"
                            style={{
                              transform: `scaleX(${item.percentage / 100})`,
                            }}
                          />
                        </div>
                        <p className="text-[11px] leading-snug text-[#4A5564]">
                          {item.evidence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-[#2A6F4E]/30 bg-[#E8F3EC] p-4 text-xs leading-relaxed text-[#1D543A]">
                <strong>
                  Rúbrica orientativa de evaluación competencial (Decreto
                  211/2022 · LOMLOE):
                </strong>{' '}
                valora el desempeño en los Bloques A, B y C de Conocimiento del
                Medio y EMOCREA a partir de las evidencias en las salas, el
                Atlas del Medio Natural, la Línea del Tiempo y el Diario.
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#232A34]/15 bg-white">
                <table className="w-full min-w-[720px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#232A34]/12 bg-[#EAE6DC] text-[#171B21]">
                      <th className="p-3 font-bold w-[22%]">
                        Dimensión / Competencias
                      </th>
                      <th className="p-3 font-bold w-[19.5%]">
                        1 · Iniciado
                      </th>
                      <th className="p-3 font-bold w-[19.5%]">
                        2 · En proceso
                      </th>
                      <th className="p-3 font-bold w-[19.5%] text-[#1D4E89]">
                        3 · Adquirido
                      </th>
                      <th className="p-3 font-bold w-[19.5%] text-[#1D543A]">
                        4 · Avanzado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232A34]/10">
                    {LOMLOE_COMPETENCY_RUBRIC.map((row) => (
                      <tr key={row.id} className="align-top">
                        <td className="p-3 bg-[#FAF8F4]">
                          <div className="font-bold text-[#171B21]">
                            {row.dimension}
                          </div>
                          <div className="mt-1 font-mono text-[11px] font-semibold text-[#1D4E89]">
                            {row.competencies}
                          </div>
                        </td>
                        <td className="p-3 leading-relaxed text-[#4A5564]">
                          {row.iniciado}
                        </td>
                        <td className="p-3 leading-relaxed text-[#3E4856]">
                          {row.enProceso}
                        </td>
                        <td className="p-3 leading-relaxed text-[#171B21] bg-[#F4F8FD]">
                          {row.adquirido}
                        </td>
                        <td className="p-3 leading-relaxed text-[#171B21] bg-[#F1F8F4]">
                          {row.avanzado}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 4: NOTAS DE RIGOR HISTÓRICO Y CIENTÍFICO */}
          {activeSection === 'rigor' && (
            <section className="space-y-4">
              <div className="rounded-xl border border-[#C67D1E]/35 bg-[#FAF4E8] p-4 text-xs leading-relaxed text-[#6E420B]">
                <strong>
                  Aclaraciones científicas, geográficas e historiográficas para
                  el profesorado:
                </strong>{' '}
                contextualizan las adaptaciones didácticas para Educación
                Primaria y ofrecen precisiones basadas en la arqueología, la
                geografía física y la historiografía de Gran Canaria.
              </div>

              <div className="space-y-3">
                {SCIENTIFIC_PRECISION_NOTES.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-xl border border-[#232A34]/15 bg-white p-4 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-[#171B21]">
                        {note.topic}
                      </h3>
                      <span className="font-mono text-[11px] font-semibold text-[#1D4E89]">
                        {note.roomRef}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#333D4B]">
                      {note.clarification}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="no-print flex items-center justify-between border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <span className="text-xs text-[#526071]">
            Recomendación: trabajar en parejas cooperativas y cerrar cada sala
            con el Atlas Natural o 5 minutos de asamblea.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#232A34] px-5 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] whitespace-nowrap cursor-pointer"
          >
            Cerrar ficha
          </button>
        </div>
      </div>
    </div>
  );
};
