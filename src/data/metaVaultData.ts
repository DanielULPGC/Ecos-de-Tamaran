import { CycleId, ExpeditionState, RoomId } from '../types/game';
import { ROOMS_DATA } from './roomsData';

export interface SceneInscription {
  id: string;
  roomId: RoomId;
  kind: 'lock-clue' | 'pintadera-fragment';
  x: number;
  y: number;
  symbolLabel: string;
  title: string;
  engraving: string;
  explanation: Record<CycleId, string>;
  dialHintLabel: string;
}

export interface PintaderaFragmentDef {
  roomId: RoomId;
  roomNumber: number;
  quadrant: 'NW' | 'NE' | 'SW' | 'SE';
  title: string;
  epochLabel: string;
  runeLabel: string;
  coordinateTag: string;
  accentHex: string;
  metaDial: Record<
    CycleId,
    {
      label: string;
      prompt: string;
      options: string[];
      correctIndex: number;
    }
  >;
}

export const SCENE_INSCRIPTIONS: Record<RoomId, SceneInscription[]> = {
  aborigenes: [
    {
      id: 'ins-r1-lock',
      roomId: 'aborigenes',
      kind: 'lock-clue',
      x: 14,
      y: 25,
      symbolLabel: 'Grabado en la roca',
      title: 'Marca de los silos de Valerón',
      engraving: 'CEBADA TOSTADA · VALERÓN (+300 SILOS)',
      explanation: {
        ciclo2:
          'Bajo la luz de la linterna aparece un dibujo del granero excavado en la roca: Valerón guardaba el grano para toda la comunidad.',
        ciclo3:
          'Grabado oculto en la toba volcánica: recuerda que el gofio aborigen se elaboraba con cebada tostada almacenada en los más de 300 silos del Cenobio de Valerón.',
      },
      dialHintLabel: 'Pista directa para el Cerrojo de Agáldar',
    },
    {
      id: 'ins-r1-frag',
      roomId: 'aborigenes',
      kind: 'pintadera-fragment',
      x: 84,
      y: 23,
      symbolLabel: 'Cuadrante I · Pintadera',
      title: 'Fragmento de Piedra de Agáldar',
      engraving: 'CUADRANTE NORTE · SOL DE GÁLDAR',
      explanation: {
        ciclo2:
          '¡Has descubierto el primer trozo de la Gran Pintadera! Guarda el símbolo del Sol de Gáldar para la Cámara Secreta final.',
        ciclo3:
          'Primer cuadrante de la Gran Pintadera de Gran Canaria: símbolo geométrico canarii del norte de la isla, clave para el meta-cerrojo entre las 4 épocas.',
      },
      dialHintLabel: 'Fragmento 1/4 para la Cámara Secreta',
    },
  ],
  conquista: [
    {
      id: 'ins-r2-lock',
      roomId: 'conquista',
      kind: 'lock-clue',
      x: 48,
      y: 22,
      symbolLabel: 'Tinta invisible',
      title: 'Anotación secreta del escribano',
      engraving: '24 JUNIO 1478 · GUINIGUADA -> ANSITE 1483',
      explanation: {
        ciclo2:
          'La luz revela tinta oculta en el archivo: el campamento se levantó en 1478 en el barranco de Guiniguada y todo terminó en 1483.',
        ciclo3:
          'Nota marginal en tinta ferrogálica: Fundación del Real (1478), Pacto de Calatayud y cierre definitivo en Ansite (1483).',
      },
      dialHintLabel: 'Pista directa para la Cerradura del Archivo',
    },
    {
      id: 'ins-r2-frag',
      roomId: 'conquista',
      kind: 'pintadera-fragment',
      x: 85,
      y: 80,
      symbolLabel: 'Cuadrante II · Pintadera',
      title: 'Fragmento de Pergamino del Real',
      engraving: 'CUADRANTE ESTE · PALMERA DEL GUINIGUADA',
      explanation: {
        ciclo2:
          '¡Segundo trozo de la Gran Pintadera encontrado! Representa el palmeral donde nació Las Palmas y el valor del diálogo.',
        ciclo3:
          'Segundo cuadrante de la Gran Pintadera de Gran Canaria: emblema del encuentro cultural en el barranco de Guiniguada (1478–1483).',
      },
      dialHintLabel: 'Fragmento 2/4 para la Cámara Secreta',
    },
  ],
  pirateria: [
    {
      id: 'ins-r3-lock',
      roomId: 'pirateria',
      kind: 'lock-clue',
      x: 44,
      y: 22,
      symbolLabel: 'Código tallado',
      title: 'Regla del vigía en la almena',
      engraving: '1599 · DOS FUEGOS -> CASTILLO DE LA LUZ',
      explanation: {
        ciclo2:
          'En la piedra del torreón está tallado el aviso secreto de 1599: encender dos fuegos para avisar al Castillo de la Luz.',
        ciclo3:
          'Inscripción de guardia de 1599: dos hogueras hacia el Castillo de la Luz; siglos después la cochinilla tiñó de carmín el comercio atlántico.',
      },
      dialHintLabel: 'Pista directa para el Cerrojo del Torreón',
    },
    {
      id: 'ins-r3-frag',
      roomId: 'pirateria',
      kind: 'pintadera-fragment',
      x: 84,
      y: 82,
      symbolLabel: 'Cuadrante III · Pintadera',
      title: 'Fragmento de Brújula Atlántica',
      engraving: 'CUADRANTE COSTA · FUEGO DE ALMENARA',
      explanation: {
        ciclo2:
          '¡Tercer trozo de la Gran Pintadera hallado! Su señal de fuego recuerda cómo la isla se protegió trabajando unida.',
        ciclo3:
          'Tercer cuadrante de la Gran Pintadera de Gran Canaria: la llama de vigilancia de San Cristóbal que unió costa y cumbre en 1599.',
      },
      dialHintLabel: 'Fragmento 3/4 para la Cámara Secreta',
    },
  ],
  sigloXX: [
    {
      id: 'ins-r4-lock',
      roomId: 'sigloXX',
      kind: 'lock-clue',
      x: 18,
      y: 25,
      symbolLabel: 'Sello de aduana',
      title: 'Etiqueta invisible de 1952',
      engraving: 'LA LUZ 1952 · ALISIOS -> CUMBRE -> HEREDAMIENTOS',
      explanation: {
        ciclo2:
          'La luz descubre un sello antiguo del muelle: los barcos salían en 1952 del Puerto de La Luz y el agua de la isla nace en la cumbre.',
        ciclo3:
          'Marca portuaria de 1952: rumbo a Venezuela desde La Luz, mientras los vientos alisios alimentan la cumbre y los heredamientos reparten el agua.',
      },
      dialHintLabel: 'Pista directa para el Cerrojo Final',
    },
    {
      id: 'ins-r4-frag',
      roomId: 'sigloXX',
      kind: 'pintadera-fragment',
      x: 74,
      y: 22,
      symbolLabel: 'Cuadrante IV · Pintadera',
      title: 'Fragmento del Puente Atlántico',
      engraving: 'CUADRANTE PUERTO · OLA Y GOTA DE AGUA',
      explanation: {
        ciclo2:
          '¡Último trozo de la Gran Pintadera! Une el océano, el agua de las cumbres y la memoria de nuestras familias.',
        ciclo3:
          'Cuarto cuadrante de la Gran Pintadera de Gran Canaria: símbolo de sostenibilidad hídrica y puente atlántico del Puerto de La Luz.',
      },
      dialHintLabel: 'Fragmento 4/4 para la Cámara Secreta',
    },
  ],
};

export const PINTADERA_FRAGMENTS: PintaderaFragmentDef[] = [
  {
    roomId: 'aborigenes',
    roomNumber: 1,
    quadrant: 'NW',
    title: 'Cuadrante Norte · Agáldar',
    epochLabel: 'Época Aborigen',
    runeLabel: 'Sol de Gáldar',
    coordinateTag: 'Sala 1 · Cueva Pintada y Valerón',
    accentHex: '#C67D1E',
    metaDial: {
      ciclo2: {
        label: 'Sala 1 · Raíz canarii',
        prompt: '¿Qué símbolo o lugar unía a la comunidad aborigen?',
        options: ['Valerón y Pintadera', 'Barco de vapor', 'Campana de Vegueta'],
        correctIndex: 0,
      },
      ciclo3: {
        label: 'Sala 1 · Patrimonio Canarii',
        prompt: '¿Qué gran valor comunitario dejó la sociedad aborigen de Agáldar?',
        options: [
          'Silos colectivos (Valerón) y arte geométrico',
          'Comercio de cochinilla hacia Europa',
          'Emigración transatlántica en 1952',
          'Almenaras costeras ante armadas',
        ],
        correctIndex: 0,
      },
    },
  },
  {
    roomId: 'conquista',
    roomNumber: 2,
    quadrant: 'NE',
    title: 'Cuadrante Este · Guiniguada',
    epochLabel: 'Siglo XV (1478–1483)',
    runeLabel: 'Palmera del Barranco',
    coordinateTag: 'Sala 2 · Real de Las Palmas',
    accentHex: '#2A6F4E',
    metaDial: {
      ciclo2: {
        label: 'Sala 2 · Encuentro cultural',
        prompt: '¿Dónde empezó la ciudad en 1478?',
        options: ['Cumbre de Tejeda', 'Barranco de Guiniguada', 'Puerto de La Luz'],
        correctIndex: 1,
      },
      ciclo3: {
        label: 'Sala 2 · Memoria crítica',
        prompt: '¿Qué herramienta histórica nos permite entender 1478–1483 con justicia?',
        options: [
          'Creer solo una crónica sin comprobar',
          'Contrastar fuentes y escuchar todas las voces',
          'Ignorar las fechas y los mapas antiguos',
          'Repetir rumores sin verificar',
        ],
        correctIndex: 1,
      },
    },
  },
  {
    roomId: 'pirateria',
    roomNumber: 3,
    quadrant: 'SW',
    title: 'Cuadrante Costa · San Cristóbal',
    epochLabel: 'Siglos XVI–XIX (1599)',
    runeLabel: 'Llama de Almenara',
    coordinateTag: 'Sala 3 · Atalaya y Castillo de la Luz',
    accentHex: '#1D4E89',
    metaDial: {
      ciclo2: {
        label: 'Sala 3 · Defensa y calma',
        prompt: '¿Cómo avisaban los vigías al Castillo de la Luz en 1599?',
        options: ['Con un teléfono', 'Con cartas por barco', 'Con dos fuegos en la torre'],
        correctIndex: 2,
      },
      ciclo3: {
        label: 'Sala 3 · Atlántico y verificación',
        prompt: '¿Qué enseñanza conectó a los vigías de 1599 con nuestro presente?',
        options: [
          'Difundir alarmas antes de comprobar',
          'Aislar la isla del resto del mundo',
          'Verificar señales y cooperar con calma ante el miedo',
          'Sustituir las fortalezas por graneros',
        ],
        correctIndex: 2,
      },
    },
  },
  {
    roomId: 'sigloXX',
    roomNumber: 4,
    quadrant: 'SE',
    title: 'Cuadrante Puerto · La Luz',
    epochLabel: 'Siglo XX (1952) y Presente',
    runeLabel: 'Ola y Alisios',
    coordinateTag: 'Sala 4 · Memoria y Agua Sostenible',
    accentHex: '#9C5A25',
    metaDial: {
      ciclo2: {
        label: 'Sala 4 · Futuro de la isla',
        prompt: '¿Qué tesoro natural debemos cuidar desde la cumbre hasta el mar?',
        options: ['El agua de la isla', 'El humo de los barcos', 'El polvo del archivo'],
        correctIndex: 0,
      },
      ciclo3: {
        label: 'Sala 4 · Agenda 2030 y Puente',
        prompt: '¿Qué une la emigración de 1952 con el cuidado actual de Gran Canaria?',
        options: [
          'La empatía hacia quien llega y la gestión sostenible del agua',
          'El abandono de las cumbres y los barrancos',
          'El cierre del Puerto de La Luz al comercio',
          'La desaparición del habla canaria',
        ],
        correctIndex: 0,
      },
    },
  },
];

export const SECRET_CHAMBER_RELIC = {
  title: 'El Mapa Vivo de las Siete Cumbres y el Atlántico',
  subtitle: 'Cámara Secreta del Cuaderno del Tiempo · Gran Pintadera Restaurada',
  message: {
    ciclo2:
      '¡Lo habéis conseguido en equipo! Al unir los cuatro fragmentos de la Gran Pintadera habéis demostrado que Gran Canaria brilla cuando cuidamos su historia, su naturaleza, el agua y nos escuchamos con respeto.',
    ciclo3:
      '¡Enigma entre épocas completado! La Gran Pintadera de Gran Canaria reúne la cooperación canarii, el pensamiento crítico ante las fuentes, la calma frente a los bulos y la sostenibilidad hídrica de la Agenda 2030. El Cuaderno del Tiempo queda ahora en vuestras manos para seguir escribiendo una isla más justa.',
  },
  cooperativePrompt:
    'Reto final de equipo: cada integrante del grupo explica en una frase qué pieza de su época ayudó a abrir la Cámara Secreta.',
};

/**
 * A Pintadera fragment is considered collected if the explorer either unlocked
 * that room's Exit Lock OR discovered the room's hidden Pintadera inscription
 * with the Scene Inspection Flashlight.
 */
export function getCollectedPintaderaRooms(state: ExpeditionState): RoomId[] {
  const manual = state.metaVault?.collectedFragments ?? [];
  return ROOMS_DATA.filter(
    (room) =>
      state.progress[room.id]?.doorUnlocked || manual.includes(room.id)
  ).map((room) => room.id);
}

export function getRoomInscriptions(roomId: RoomId): SceneInscription[] {
  return SCENE_INSCRIPTIONS[roomId] ?? [];
}

export function getDiscoveredRoomInscriptions(
  state: ExpeditionState,
  roomId: RoomId
): SceneInscription[] {
  const discovered = state.metaVault?.discoveredInscriptions ?? [];
  return getRoomInscriptions(roomId).filter((ins) =>
    discovered.includes(ins.id)
  );
}
