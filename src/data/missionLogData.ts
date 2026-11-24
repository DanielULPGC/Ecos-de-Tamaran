import {
  CycleId,
  ExpeditionState,
  RoomId,
} from '../types/game';
import { ROOMS_DATA } from './roomsData';
import {
  CANARIAN_COLLECTIBLES,
  TRANSVERSAL_MISSIONS,
} from './enrichmentData';
import { TEACHER_CURRICULUM_BY_ROOM } from './curriculumData';

import { SHADOW_CHALLENGES } from './shadowMatchData';

export type MissionActionTarget =
  | 'clue'
  | 'puzzle1'
  | 'puzzle2'
  | 'empathy'
  | 'shadow'
  | 'transversal'
  | 'collectible';

export type MissionLomloeArea =
  | 'Conocimiento del Medio'
  | 'EMOCREA y Empatía'
  | 'Valores y Agenda 2030'
  | 'Patrimonio Canario';

export interface MissionLogItem {
  id: string;
  roomId: RoomId;
  roomIndex: number;
  roomNumber: number;
  title: string;
  actionTarget: MissionActionTarget;
  isCoreSeal: boolean;
  area: MissionLomloeArea;
  competencyCodes: string;
  lomloeObjective: string;
  completed: boolean;
}

export interface RoomMissionGroup {
  roomId: RoomId;
  roomIndex: number;
  roomNumber: number;
  roomTitle: string;
  epoch: string;
  years: string;
  competenciasClave: string[];
  competenciasEspecificas: string[];
  criteriosEvaluacion: string[];
  criteriosCodificados: { code: string; ce: string; text: string }[];
  saberesBloqueA: string[];
  saberesConocimientoMedio: string[];
  saberesEmocreaValores: string[];
  items: MissionLogItem[];
  completedCount: number;
  totalCount: number;
  coreCompletedCount: number;
}

const LOMLOE_OBJECTIVE_TEXT: Record<
  RoomId,
  Record<MissionActionTarget, Record<CycleId, string>>
> = {
  aborigenes: {
    clue: {
      ciclo2:
        'Observar una fuente material aborigen (pintadera y gofio) y valorar su cuidado.',
      ciclo3:
        'Analizar fuentes arqueológicas de los canarii para explicar su vida cotidiana y organización.',
    },
    puzzle1: {
      ciclo2:
        'Reconocer los motivos geométricos de las pintaderas de Gáldar como expresión cultural.',
      ciclo3:
        'Interpretar el simbolismo de las pintaderas prehispánicas y la conservación de la Cueva Pintada.',
    },
    puzzle2: {
      ciclo2:
        'Relacionar los alimentos y recursos aborígenes (gofio, barro, graneros) con el medio insular.',
      ciclo3:
        'Explicar la organización económica de los guanartematos y los graneros colectivos como el Cenobio de Valerón.',
    },
    empathy: {
      ciclo2:
        'Identificar emociones como la preocupación y proponer repartos justos de recursos compartidos.',
      ciclo3:
        'Practicar la escucha activa y buscar acuerdos cooperativos equilibrando necesidades y sostenibilidad.',
    },
    shadow: {
      ciclo2:
        'Reconocer siluetas de objetos aborígenes (vasija, pintadera, molino e ídolo) y su uso cotidiano.',
      ciclo3:
        'Relacionar la tecnología material prehispánica de Gran Canaria con la conservación de alimentos y el patrimonio museístico.',
    },
    transversal: {
      ciclo2:
        'Valorar el papel igualitario de mujeres y hombres en el cuidado de la comunidad (ODS 5).',
      ciclo3:
        'Aplicar criterios de coeducación e igualdad reconociendo las aportaciones históricas invisibilizadas (ODS 5).',
    },
    collectible: {
      ciclo2:
        'Descubrir vocabulario y patrimonio natural propio de Canarias vinculado a la isla.',
      ciclo3:
        'Reconocer la riqueza del léxico canario y la biodiversidad autóctona como legado cultural.',
    },
  },
  conquista: {
    clue: {
      ciclo2:
        'Explorar testimonios escritos sencillos sobre el origen de Las Palmas junto al Guiniguada.',
      ciclo3:
        'Examinar fuentes primarias de la conquista (1478–1483) identificando quién cuenta cada versión.',
    },
    puzzle1: {
      ciclo2:
        'Ordenar cronológicamente hechos clave de la historia local de Gran Canaria.',
      ciclo3:
        'Situar en una línea temporal la fundación del Real de Las Palmas, el Pacto de Calatayud y el final de la conquista.',
    },
    puzzle2: {
      ciclo2:
        'Diferenciar datos comprobables de opiniones injustas o prejuicios sobre otras personas.',
      ciclo3:
        'Contrastar crónicas históricas distinguiendo hechos verificables de sesgos culturales y etnocentrismo.',
    },
    empathy: {
      ciclo2:
        'Ponerse en el lugar de dos personas con versiones distintas respetando sus costumbres y lengua.',
      ciclo3:
        'Desarrollar empatía cognitiva y afectiva ante el choque cultural proponiendo mediación pacífica.',
    },
    shadow: {
      ciclo2:
        'Identificar objetos históricos del siglo XV (carabela, pluma, pergamino y llave del Real).',
      ciclo3:
        'Interpretar fuentes materiales y documentales del nacimiento del Real de Las Palmas junto al Guiniguada.',
    },
    transversal: {
      ciclo2:
        'Promover la convivencia respetuosa y los derechos de todas las personas sin exclusiones (ODS 16).',
      ciclo3:
        'Argumentar cómo el diálogo intercultural y los derechos humanos construyen sociedades pacíficas (ODS 16).',
    },
    collectible: {
      ciclo2:
        'Conocer fauna y palabras tradicionales de Canarias que siguen vivas hoy.',
      ciclo3:
        'Integrar canarismos y elementos del patrimonio natural insular en la expresión cotidiana.',
    },
  },
  pirateria: {
    clue: {
      ciclo2:
        'Identificar el papel de las torres y castillos costeros en la protección de la isla.',
      ciclo3:
        'Analizar el valor geoestratégico de Gran Canaria y sus fortificaciones en las rutas atlánticas.',
    },
    puzzle1: {
      ciclo2:
        'Orientarse con los puntos cardinales y reconocer señales de aviso desde la costa.',
      ciclo3:
        'Aplicar la orientación espacial y el pensamiento lógico para interpretar rutas y defensas costeras.',
    },
    puzzle2: {
      ciclo2:
        'Relacionar productos históricos de Canarias (azúcar, cochinilla) con la vida en la isla.',
      ciclo3:
        'Explicar los ciclos económicos atlánticos (azúcar, vino, cochinilla) y el puente tricontinental.',
    },
    empathy: {
      ciclo2:
        'Reconocer el miedo en momentos de alarma y elegir estrategias de calma y solidaridad vecinal.',
      ciclo3:
        'Regular el pánico colectivo mediante comunicación asertiva y verificación frente a rumores.',
    },
    shadow: {
      ciclo2:
        'Asociar instrumentos marineros y de vigilancia costera con sus siluetas para desbloquear pistas.',
      ciclo3:
        'Analizar los instrumentos de navegación y alerta costera en el Atlántico entre los siglos XVI y XIX.',
    },
    transversal: {
      ciclo2:
        'Comprobar si una noticia o rumor es cierto antes de compartirlo con los demás (Alfabetización mediática).',
      ciclo3:
        'Aplicar pensamiento crítico frente a bulos y desinformación, del siglo XVI a las redes actuales (ODS 4 y 16).',
    },
    collectible: {
      ciclo2:
        'Reconocer expresiones musicales y objetos tradicionales del folclore canario.',
      ciclo3:
        'Valorar el timple y el patrimonio cultural isleño como seña de identidad compartida.',
    },
  },
  sigloXX: {
    clue: {
      ciclo2:
        'Observar objetos y recuerdos familiares del siglo XX para compararlos con la vida actual.',
      ciclo3:
        'Interpretar testimonios de la emigración canaria y la transformación del Puerto de La Luz.',
    },
    puzzle1: {
      ciclo2:
        'Diferenciar objetos cotidianos de la época de los abuelos frente a objetos modernos.',
      ciclo3:
        'Analizar el contexto histórico de la emigración canaria a América distinguiendo anacronismos.',
    },
    puzzle2: {
      ciclo2:
        'Comprender el recorrido del agua en Gran Canaria y la importancia de cuidarla entre todos.',
      ciclo3:
        'Explicar la cultura hidráulica insular (heredamientos, presas y acequias) y la gestión sostenible del agua.',
    },
    empathy: {
      ciclo2:
        'Mostrar empatía y gestos de acogida hacia quienes llegan nuevos al colegio o a la isla.',
      ciclo3:
        'Conectar la memoria familiar migrante canaria con la acogida intercultural y los derechos humanos.',
    },
    shadow: {
      ciclo2:
        'Reconocer recuerdos cotidianos del siglo XX (maleta, timple, vapor y cántaro de agua).',
      ciclo3:
        'Vincular la memoria material portuaria e hidráulica del siglo XX con la Gran Canaria contemporánea.',
    },
    transversal: {
      ciclo2:
        'Proponer hábitos sencillos para ahorrar agua y proteger el entorno de la isla (ODS 6 y 11).',
      ciclo3:
        'Comprometerse con la sostenibilidad hídrica y las metas de la Agenda Canaria 2030 (ODS 6 y 13).',
    },
    collectible: {
      ciclo2:
        'Reconocer palabras cotidianas del español de Canarias y su origen en la isla.',
      ciclo3:
        'Valorar la variedad lingüística canaria como patrimonio vivo de contacto atlántico.',
    },
  },
};

export function buildMissionLogByRoom(
  state: ExpeditionState,
  cycle: CycleId
): RoomMissionGroup[] {
  return ROOMS_DATA.map((room, roomIndex) => {
    const p = state.progress[room.id];
    const curriculum =
      TEACHER_CURRICULUM_BY_ROOM.find((c) => c.roomId === room.id) ??
      TEACHER_CURRICULUM_BY_ROOM[0];
    const transversal = TRANSVERSAL_MISSIONS[room.id];
    const collectible =
      CANARIAN_COLLECTIBLES.find((c) => c.roomId === room.id) ??
      CANARIAN_COLLECTIBLES[0];
    const objectives = LOMLOE_OBJECTIVE_TEXT[room.id];

    const items: MissionLogItem[] = [
      {
        id: `${room.id}-clue`,
        roomId: room.id,
        roomIndex,
        roomNumber: room.number,
        title: `Hallazgo · ${room.clue.itemLabel}`,
        actionTarget: 'clue',
        isCoreSeal: false,
        area: 'Conocimiento del Medio',
        competencyCodes: 'CCEC · CCL',
        lomloeObjective: objectives.clue[cycle],
        completed: p.clueFound,
      },
      {
        id: `${room.id}-puzzle1`,
        roomId: room.id,
        roomIndex,
        roomNumber: room.number,
        title: `${room.puzzle1.sealTitle} · ${room.puzzle1.title}`,
        actionTarget: 'puzzle1',
        isCoreSeal: true,
        area: 'Conocimiento del Medio',
        competencyCodes:
          room.id === 'pirateria'
            ? 'STEM · CC'
            : room.id === 'conquista'
            ? 'CCL · CC'
            : 'CCEC · CC',
        lomloeObjective: objectives.puzzle1[cycle],
        completed: p.puzzle1Solved,
      },
      {
        id: `${room.id}-puzzle2`,
        roomId: room.id,
        roomIndex,
        roomNumber: room.number,
        title: `${room.puzzle2.sealTitle} · ${room.puzzle2.title}`,
        actionTarget: 'puzzle2',
        isCoreSeal: true,
        area: 'Conocimiento del Medio',
        competencyCodes:
          room.id === 'sigloXX'
            ? 'STEM · CC'
            : room.id === 'conquista'
            ? 'CCL · CPSAA'
            : 'CC · STEM',
        lomloeObjective: objectives.puzzle2[cycle],
        completed: p.puzzle2Solved,
      },
      {
        id: `${room.id}-empathy`,
        roomId: room.id,
        roomIndex,
        roomNumber: room.number,
        title: `${room.empathy.sealTitle} · ${room.empathy.title}`,
        actionTarget: 'empathy',
        isCoreSeal: true,
        area: 'EMOCREA y Empatía',
        competencyCodes: 'CPSAA · CC',
        lomloeObjective: objectives.empathy[cycle],
        completed: p.empathySolved,
      },
      {
        id: `${room.id}-shadow`,
        roomId: room.id,
        roomIndex,
        roomNumber: room.number,
        title: `Sombras · ${SHADOW_CHALLENGES[room.id].title}`,
        actionTarget: 'shadow',
        isCoreSeal: false,
        area: 'Conocimiento del Medio',
        competencyCodes: 'CCEC · STEM',
        lomloeObjective: objectives.shadow[cycle],
        completed: p.shadowSolved,
      },
      {
        id: `${room.id}-transversal`,
        roomId: room.id,
        roomIndex,
        roomNumber: room.number,
        title: `Misión 2030 · ${transversal.title}`,
        actionTarget: 'transversal',
        isCoreSeal: false,
        area: 'Valores y Agenda 2030',
        competencyCodes: `CC · ${transversal.odsTag}`,
        lomloeObjective: objectives.transversal[cycle],
        completed: p.transversalSolved,
      },
      {
        id: `${room.id}-collectible`,
        roomId: room.id,
        roomIndex,
        roomNumber: room.number,
        title: p.collectibleFound
          ? `Tesoro Canario · ${collectible.word}`
          : 'Tesoro Canario escondido en la sala',
        actionTarget: 'collectible',
        isCoreSeal: false,
        area: 'Patrimonio Canario',
        competencyCodes: 'CCEC · CCL',
        lomloeObjective: objectives.collectible[cycle],
        completed: p.collectibleFound,
      },
    ];

    const completedCount = items.filter((item) => item.completed).length;
    const coreCompletedCount = items.filter(
      (item) => item.isCoreSeal && item.completed
    ).length;

    return {
      roomId: room.id,
      roomIndex,
      roomNumber: room.number,
      roomTitle: room.title,
      epoch: room.epoch,
      years: room.years,
      competenciasClave: curriculum.competenciasClave,
      competenciasEspecificas: curriculum.competenciasEspecificas,
      criteriosEvaluacion: curriculum.criteriosEvaluacion[cycle],
      criteriosCodificados: curriculum.criteriosCodificados[cycle],
      saberesBloqueA: curriculum.saberesBloqueA[cycle],
      saberesConocimientoMedio: curriculum.saberesConocimientoMedio[cycle],
      saberesEmocreaValores: curriculum.saberesEmocreaValores[cycle],
      items,
      completedCount,
      totalCount: items.length,
      coreCompletedCount,
    };
  });
}
