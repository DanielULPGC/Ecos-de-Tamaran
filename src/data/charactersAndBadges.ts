import {
  BadgeDefinition,
  BadgeId,
  ExpeditionState,
  ExplorerId,
  ExplorerProfile,
} from '../types/game';
import explorerNayraImg from '../assets/images/explorer_nayra_1795513462633.webp';
import explorerAdayImg from '../assets/images/explorer_aday_1795513464407.webp';
import explorerSofiaImg from '../assets/images/explorer_sofia_1795513467583.webp';
import explorerYerayImg from '../assets/images/explorer_yeray_1795513466465.webp';

export const EXPLORERS: ExplorerProfile[] = [
  {
    id: 'nayra',
    name: 'Nayra',
    role: 'Rastreadora de Tamarán',
    powerName: 'Lupa Arqueológica',
    powerShort: 'Pista visual gratis al instante',
    powerDetail:
      'En cada reto, su lupa revela gratis la pista 1 y señala detalles ocultos.',
    portraitPath: explorerNayraImg,
    accentHex: '#2A6F4E',
    greeting: '¡Con mi lupa encontraremos cada secreto de la isla!',
    cheerLines: [
      '¡Ojo de águila! Ese hallazgo es oro puro.',
      '¡Qué descubrimiento tan genial!',
      '¡Sello conseguido! Vamos a por el siguiente.',
    ],
    sheet: {
      age: '10 años · Primaria',
      origin: 'Gáldar (Norte de Gran Canaria)',
      personalityTraits: ['Observadora', 'Curiosa', 'Paciente', 'Detallista'],
      favoriteObject: 'Lupa de latón y colgante de pintadera de barro',
      favoritePlace: 'Cueva Pintada de Gáldar y los barrancos del norte',
      motto: 'Quien mira con calma descubre historias que otros pasan por alto.',
      bio: 'A Nayra le apasiona investigar objetos antiguos, dibujar patrones geométricos en su libreta y proteger el patrimonio arqueológico de Gran Canaria.',
      attributes: {
        observacion: 5,
        empatia: 4,
        ingenio: 4,
        trabajoEnEquipo: 4,
      },
      startingGoal:
        'Aprender a leer pistas materiales (cerámica, pintaderas y mapas) para reconstruir cómo vivían en cada época.',
      growthStrength:
        'Detecta detalles escondidos antes que nadie y ayuda al grupo a no rendirse ante un enigma difícil.',
      learningChallenge:
        'Compartir sus hipótesis en voz alta y escuchar otras interpretaciones antes de cerrar una conclusión.',
      competencyFocus:
        'Conciencia y expresiones culturales · Indagación histórica con fuentes materiales',
      milestones: [
        {
          roomId: 'aborigenes',
          stageLabel: 'Etapa 1 · Ojo arqueológico',
          growthNote:
            'Interpreta la pintadera aborigen y valora la memoria canarii de Agáldar.',
        },
        {
          roomId: 'conquista',
          stageLabel: 'Etapa 2 · Lectora de fuentes',
          growthNote:
            'Contrasta documentos históricos para distinguir hechos comprobables de opiniones.',
        },
        {
          roomId: 'pirateria',
          stageLabel: 'Etapa 3 · Rastreadora costera',
          growthNote:
            'Descifra señales de vigilancia y entiende cómo la isla cooperó para protegerse.',
        },
        {
          roomId: 'sigloXX',
          stageLabel: 'Etapa 4 · Guardiana de la memoria',
          growthNote:
            'Conecta los objetos cotidianos de 1952 con las historias familiares de Gran Canaria.',
        },
      ],
    },
  },
  {
    id: 'aday',
    name: 'Aday',
    role: 'Guardián de las Voces',
    powerName: 'Brújula Empática',
    powerShort: 'Guía emocional en dilemas',
    powerDetail:
      'Ilumina la clave emocional de los personajes y desbloquea ideas rápidas.',
    portraitPath: explorerAdayImg,
    accentHex: '#C67D1E',
    greeting: '¡Escuchemos a cada personaje para abrir todas las puertas!',
    cheerLines: [
      '¡Escuchar con empatía siempre abre caminos!',
      '¡Gran corazón y mente despierta!',
      '¡Un paso más para iluminar toda Gran Canaria!',
    ],
    sheet: {
      age: '9 años · Primaria',
      origin: 'Vegueta, Las Palmas de Gran Canaria',
      personalityTraits: ['Empático', 'Dialogante', 'Sereno', 'Solidario'],
      favoriteObject: 'Brújula de bolsillo y cuaderno de emociones',
      favoritePlace: 'Plaza de Santa Ana y senderos con dragos y palmeras',
      motto: 'Todas las personas de la historia tienen una voz que merece ser escuchada.',
      bio: 'Aday siempre lleva su bufanda amarilla y un cuaderno donde anota cómo se sienten las personas. Sabe que entender las emociones ayuda a resolver conflictos de forma justa.',
      attributes: {
        observacion: 4,
        empatia: 5,
        ingenio: 3,
        trabajoEnEquipo: 5,
      },
      startingGoal:
        'Comprender las emociones, miedos y esperanzas de quienes vivieron momentos clave en la isla.',
      growthStrength:
        'Calma los nervios del equipo y propone acuerdos justos cuando existen dos puntos de vista distintos.',
      learningChallenge:
        'Confiar en su propia iniciativa a la hora de tomar decisiones rápidas en los puzles de lógica.',
      competencyFocus:
        'EMOCREA · Regulación emocional, escucha activa y convivencia democrática',
      milestones: [
        {
          roomId: 'aborigenes',
          stageLabel: 'Etapa 1 · Escucha en comunidad',
          growthNote:
            'Reconoce el valor del cuidado compartido del alimento y el respeto a las personas mayores.',
        },
        {
          roomId: 'conquista',
          stageLabel: 'Etapa 2 · Puente entre culturas',
          growthNote:
            'Identifica emociones encontradas en el encuentro cultural y defiende el diálogo respetuoso.',
        },
        {
          roomId: 'pirateria',
          stageLabel: 'Etapa 3 · Calma ante el miedo',
          growthNote:
            'Transforma el temor ante los ataques en cooperación vecinal y apoyo mutuo.',
        },
        {
          roomId: 'sigloXX',
          stageLabel: 'Etapa 4 · Empatía con quien emigra',
          growthNote:
            'Comprende la añoranza de las familias canarias que partieron por mar hacia América.',
        },
      ],
    },
  },
  {
    id: 'sofia',
    name: 'Sofía',
    role: 'Navegante del Atlántico',
    powerName: 'Sextante Veloz',
    powerShort: 'Resuelve 1 pieza por reto',
    powerDetail:
      'Su catalejo coloca o marca automáticamente una pieza correcta en cada minijuego.',
    portraitPath: explorerSofiaImg,
    accentHex: '#1D4E89',
    greeting: '¡Rumbo firme! Mi sextante nos dará ventaja en cada enigma.',
    cheerLines: [
      '¡Viento a favor! Qué rapidez resolviendo.',
      '¡Rumbo exacto hacia el siguiente sello!',
      '¡Brillante! El Atlántico no tiene secretos para ti.',
    ],
    sheet: {
      age: '11 años · Primaria',
      origin: 'Puerto de La Luz / Costa de Gran Canaria',
      personalityTraits: ['Decidida', 'Ordenada', 'Ágil', 'Aventurera'],
      favoriteObject: 'Catalejo de latón, gafas redondas y chaqueta marinera',
      favoritePlace: 'Muelles históricos y miradores al océano Atlántico',
      motto: 'Con un buen mapa y mente clara, ningún océano es demasiado grande.',
      bio: 'Sofía adora orientarse con las estrellas, trazar rutas marítimas y organizar cronologías. Siempre encuentra el primer paso clave cuando un reto parece enredado.',
      attributes: {
        observacion: 4,
        empatia: 4,
        ingenio: 5,
        trabajoEnEquipo: 4,
      },
      startingGoal:
        'Ordenar en el tiempo los grandes acontecimientos atlánticos que conectaron Gran Canaria con el mundo.',
      growthStrength:
        'Aporta claridad estratégica, rapidez lógica y orientación espacial en mapas y líneas del tiempo.',
      learningChallenge:
        'Frenar un poco el ritmo para saborear las historias personales detrás de cada fecha histórica.',
      competencyFocus:
        'Competencia matemática, orientación espacial y pensamiento cronológico',
      milestones: [
        {
          roomId: 'aborigenes',
          stageLabel: 'Etapa 1 · Orientación en la isla',
          growthNote:
            'Relaciona los paisajes de cumbre y costa con la vida de los antiguos canarii.',
        },
        {
          roomId: 'conquista',
          stageLabel: 'Etapa 2 · Brújula del tiempo',
          growthNote:
            'Ordena las fechas clave del siglo XV con precisión y sentido histórico.',
        },
        {
          roomId: 'pirateria',
          stageLabel: 'Etapa 3 · Estratega del Atlántico',
          growthNote:
            'Domina la rosa de los vientos y las rutas de vigilancia del Castillo de San Cristóbal.',
        },
        {
          roomId: 'sigloXX',
          stageLabel: 'Etapa 4 · Navegante entre continentes',
          growthNote:
            'Comprende el papel del Puerto de La Luz como puente entre Europa, África y América.',
        },
      ],
    },
  },
  {
    id: 'yeray',
    name: 'Yeray',
    role: 'Ingeniero del Agua',
    powerName: 'Chispa Creativa',
    powerShort: 'Marca en verde tus aciertos',
    powerDetail:
      'Comprueba qué piezas ya tienes bien en cada reto para afinar sin perder ritmo.',
    portraitPath: explorerYerayImg,
    accentHex: '#9C5A25',
    greeting: '¡Manos a la obra! Probemos ideas hasta que todo encaje.',
    cheerLines: [
      '¡Chispa activada! Así fluyen las buenas ideas.',
      '¡Todo encaja como una acequia bien trazada!',
      '¡Equipo imparable! A seguir explorando.',
    ],
    sheet: {
      age: '10 años · Primaria',
      origin: 'Tejeda y las Cumbres de Gran Canaria',
      personalityTraits: ['Creativo', 'Práctico', 'Entusiasta', 'Perseverante'],
      favoriteObject: 'Lápiz de carpintero tras la oreja y cantimplora',
      favoritePlace: 'Pinares de cumbre, acequias y bancales de piedra seca',
      motto: 'Si una pieza no encaja a la primera, probamos otro camino con una sonrisa.',
      bio: 'Yeray construye maquetas de acequias, repara mecanismos y siempre tiene una idea práctica para ayudar a su equipo. Cree que equivocarse es la mejor forma de aprender.',
      attributes: {
        observacion: 4,
        empatia: 4,
        ingenio: 5,
        trabajoEnEquipo: 5,
      },
      startingGoal:
        'Descubrir cómo las personas de Gran Canaria resolvieron retos técnicos como cuidar el agua y construir sus pueblos.',
      growthStrength:
        'Mantiene el entusiasmo tras un fallo, prueba soluciones ingeniosas y cuida la sostenibilidad.',
      learningChallenge:
        'Planificar los pasos antes de actuar impulsivamente para aprovechar mejor cada pista.',
      competencyFocus:
        'Competencia STEM, resolución creativa de problemas y sostenibilidad (ODS)',
      milestones: [
        {
          roomId: 'aborigenes',
          stageLabel: 'Etapa 1 · Ingenio ancestral',
          growthNote:
            'Admira cómo los aborígenes aprovechaban el barro, la piedra y el grano sin desperdiciar nada.',
        },
        {
          roomId: 'conquista',
          stageLabel: 'Etapa 2 · Aprendiz de oficios',
          growthNote:
            'Conecta herramientas, arquitectura y organización urbana en el nacimiento de Las Palmas.',
        },
        {
          roomId: 'pirateria',
          stageLabel: 'Etapa 3 · Constructor de defensas',
          growthNote:
            'Comprende el ingenio detrás de las torres, almenaras y fortalezas costeras.',
        },
        {
          roomId: 'sigloXX',
          stageLabel: 'Etapa 4 · Maestro del agua',
          growthNote:
            'Resuelve la red de galerías, presas y acequias para llevar agua de la cumbre a los cultivos.',
        },
      ],
    },
  },
];

export function getExplorerById(id: ExplorerId): ExplorerProfile {
  return EXPLORERS.find((e) => e.id === id) ?? EXPLORERS[0];
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'sello-aborigen',
    title: 'Pintadera de Oro',
    subtitle: 'Completa la Sala 1 · Gáldar',
    kind: 'epoch',
    requirementDetail:
      'Resuelve los 2 enigmas y el dilema empático de La Cueva de los Canarii.',
  },
  {
    id: 'sello-conquista',
    title: 'Puente de Culturas',
    subtitle: 'Completa la Sala 2 · Guiniguada',
    kind: 'epoch',
    requirementDetail:
      'Resuelve los 2 enigmas y el dilema empático del Archivo del Real de Las Palmas.',
  },
  {
    id: 'sello-pirateria',
    title: 'Vigía del Atlántico',
    subtitle: 'Completa la Sala 3 · San Cristóbal',
    kind: 'epoch',
    requirementDetail:
      'Resuelve los 2 enigmas y el dilema empático de La Atalaya de San Cristóbal.',
  },
  {
    id: 'sello-sigloXX',
    title: 'Memoria del Puerto',
    subtitle: 'Completa la Sala 4 · Puerto de La Luz',
    kind: 'epoch',
    requirementDetail:
      'Resuelve los 2 enigmas y el dilema empático del Muelle de La Luz.',
  },
  {
    id: 'ojo-explorador',
    title: 'Ojo de Exploración',
    subtitle: 'Encuentra al menos 2 hallazgos ocultos',
    kind: 'attitude',
    requirementDetail:
      'Recoge los hallazgos históricos principales en 2 salas distintas.',
  },
  {
    id: 'corazon-empatico',
    title: 'Corazón Empático',
    subtitle: 'Resuelve 2 dilemas de personajes',
    kind: 'attitude',
    requirementDetail:
      'Completa 2 dilemas EMOCREA y guarda sus reflexiones en el Diario.',
  },
  {
    id: 'mente-critica',
    title: 'Mente Crítica',
    subtitle: 'Supera las crónicas cruzadas o la maleta de 1952',
    kind: 'attitude',
    requirementDetail:
      'Distingue hechos de prejuicios en la Sala 2 o detecta anacronismos en la Sala 4.',
  },
  {
    id: 'guardian-tamaran',
    title: 'Vigía de Tamarán',
    subtitle: 'Ilumina las 4 zonas de Gran Canaria',
    kind: 'attitude',
    requirementDetail:
      'Consigue los 12 sellos clave completando las cuatro salas históricas.',
  },
  {
    id: 'agenda-2030',
    title: 'Agente Agenda 2030',
    subtitle: 'Supera 2 misiones transversales',
    kind: 'challenge',
    requirementDetail:
      'Completa 2 Misiones 2030 de igualdad, convivencia, verificación o agua.',
  },
  {
    id: 'tesoro-canario',
    title: 'Tesoro del Habla',
    subtitle: 'Colecciona 2 tesoros del patrimonio canario',
    kind: 'challenge',
    requirementDetail:
      'Encuentra 2 emblemas dorados del patrimonio y habla canaria en las salas.',
  },
  {
    id: 'maestro-sombras',
    title: 'Siluetas de la Historia',
    subtitle: 'Completa 2 juegos de Sombras',
    kind: 'challenge',
    requirementDetail:
      'Empareja todos los artefactos históricos con sus siluetas en al menos 2 salas.',
  },
  {
    id: 'explorador-natural',
    title: 'Naturalista de la Isla',
    subtitle: 'Indaga 2 capas del Atlas del Medio Natural',
    kind: 'challenge',
    requirementDetail:
      'Resuelve 2 mini-retos de indagación (Relieve, Ecosistemas, Alisios o Patrimonio) en el Atlas.',
  },
  {
    id: 'cronista-tiempo',
    title: 'Brújula del Tiempo',
    subtitle: 'Completa la Línea del Tiempo (CE7)',
    kind: 'challenge',
    requirementDetail:
      'Ordena las etapas históricas de Gran Canaria y acierta la pregunta de unidades de tiempo.',
  },
  {
    id: 'restaurador-mural',
    title: 'Arte en Piezas',
    subtitle: 'Restaura 2 murales en el Taller de Puzles',
    kind: 'challenge',
    requirementDetail:
      'Completa el puzle de piezas de al menos 2 escenas históricas de Gran Canaria.',
  },
];

export interface BadgeProgressEvaluation {
  unlocked: boolean;
  current: number;
  target: number;
  progressPct: number;
}

export function evaluateBadgeProgress(
  badgeId: BadgeId,
  state: ExpeditionState
): BadgeProgressEvaluation {
  const p = state.progress;
  const sealsIn = (id: keyof typeof p) =>
    Number(p[id].puzzle1Solved) +
    Number(p[id].puzzle2Solved) +
    Number(p[id].empathySolved);

  let current = 0;
  let target = 1;

  switch (badgeId) {
    case 'sello-aborigen':
      current = sealsIn('aborigenes');
      target = 3;
      break;
    case 'sello-conquista':
      current = sealsIn('conquista');
      target = 3;
      break;
    case 'sello-pirateria':
      current = sealsIn('pirateria');
      target = 3;
      break;
    case 'sello-sigloXX':
      current = sealsIn('sigloXX');
      target = 3;
      break;
    case 'ojo-explorador':
      current = Object.values(p).filter((r) => r.clueFound).length;
      target = 2;
      break;
    case 'corazon-empatico':
      current = Object.values(p).filter((r) => r.empathySolved).length;
      target = 2;
      break;
    case 'mente-critica':
      current = Number(p.conquista.puzzle2Solved || p.sigloXX.puzzle1Solved);
      target = 1;
      break;
    case 'guardian-tamaran':
      current = (
        ['aborigenes', 'conquista', 'pirateria', 'sigloXX'] as const
      ).filter((id) => sealsIn(id) === 3).length;
      target = 4;
      break;
    case 'agenda-2030':
      current = Object.values(p).filter((r) => r.transversalSolved).length;
      target = 2;
      break;
    case 'tesoro-canario':
      current = Object.values(p).filter((r) => r.collectibleFound).length;
      target = 2;
      break;
    case 'maestro-sombras':
      current = Object.values(p).filter((r) => r.shadowSolved).length;
      target = 2;
      break;
    case 'explorador-natural':
      current = state.atlasLayersCompleted?.length ?? 0;
      target = 2;
      break;
    case 'cronista-tiempo':
      current = state.timelineSolved ? 1 : 0;
      target = 1;
      break;
    case 'restaurador-mural':
      current = state.solvedJigsawRooms?.length ?? 0;
      target = 2;
      break;
  }

  const unlocked =
    state.unlockedBadges.includes(badgeId) || current >= target;
  const clamped = Math.min(current, target);
  return {
    unlocked,
    current: clamped,
    target,
    progressPct: Math.round((clamped / target) * 100),
  };
}

export function computeUnlockedBadges(state: ExpeditionState): BadgeId[] {
  const earned = new Set<BadgeId>(state.unlockedBadges);
  const p = state.progress;

  const isRoomDone = (id: keyof typeof p) =>
    p[id].puzzle1Solved && p[id].puzzle2Solved && p[id].empathySolved;

  if (isRoomDone('aborigenes')) earned.add('sello-aborigen');
  if (isRoomDone('conquista')) earned.add('sello-conquista');
  if (isRoomDone('pirateria')) earned.add('sello-pirateria');
  if (isRoomDone('sigloXX')) earned.add('sello-sigloXX');

  const cluesCount = Object.values(p).filter((r) => r.clueFound).length;
  if (cluesCount >= 2) earned.add('ojo-explorador');

  const empathyCount = Object.values(p).filter((r) => r.empathySolved).length;
  if (empathyCount >= 2) earned.add('corazon-empatico');

  if (p.conquista.puzzle2Solved || p.sigloXX.puzzle1Solved) {
    earned.add('mente-critica');
  }

  const transversalCount = Object.values(p).filter(
    (r) => r.transversalSolved
  ).length;
  if (transversalCount >= 2) earned.add('agenda-2030');

  const collectibleCount = Object.values(p).filter(
    (r) => r.collectibleFound
  ).length;
  if (collectibleCount >= 2) earned.add('tesoro-canario');

  const shadowsCount = Object.values(p).filter((r) => r.shadowSolved).length;
  if (shadowsCount >= 2) earned.add('maestro-sombras');

  if ((state.atlasLayersCompleted?.length ?? 0) >= 2) {
    earned.add('explorador-natural');
  }

  if (state.timelineSolved) {
    earned.add('cronista-tiempo');
  }

  if ((state.solvedJigsawRooms?.length ?? 0) >= 2) {
    earned.add('restaurador-mural');
  }

  if (
    isRoomDone('aborigenes') &&
    isRoomDone('conquista') &&
    isRoomDone('pirateria') &&
    isRoomDone('sigloXX')
  ) {
    earned.add('guardian-tamaran');
  }

  return Array.from(earned);
}
