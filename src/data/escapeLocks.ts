import { CycleId, RoomId } from '../types/game';

export interface LockDialDefinition {
  id: string;
  label: string;
  clueSource: string;
  options: string[];
  correctIndex: number;
}

export interface RoomExitLockDefinition {
  roomId: RoomId;
  lockName: string;
  doorTitle: string;
  storyPrompt: Record<CycleId, string>;
  dials: Record<CycleId, [LockDialDefinition, LockDialDefinition, LockDialDefinition]>;
  escapeHint: Record<CycleId, string>;
  unlockedMessage: string;
}

export function formatEscapeTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const ROOM_EXIT_LOCKS: Record<RoomId, RoomExitLockDefinition> = {
  aborigenes: {
    roomId: 'aborigenes',
    lockName: 'Cerrojo de Piedra de Agáldar',
    doorTitle: 'Puerta de la Cueva de los Canarii',
    storyPrompt: {
      ciclo2:
        'Para abrir el paso de piedra hacia 1478, coloca los 3 sellos y gira los 3 cilindros con lo que descubriste en la cueva.',
      ciclo3:
        'El mecanismo volcánico de Agáldar exige los 3 sellos de la sala y la combinación de 3 claves arqueológicas para avanzar de época.',
    },
    dials: {
      ciclo2: [
        {
          id: 'r1-d1',
          label: 'Alimento del cesto',
          clueSource: 'Pista del Hallazgo',
          options: ['Plátano', 'Gofio', 'Azúcar'],
          correctIndex: 1,
        },
        {
          id: 'r1-d2',
          label: 'Sello geométrico',
          clueSource: 'Reto 1 · Mural',
          options: ['Brújula', 'Ancla', 'Pintadera'],
          correctIndex: 2,
        },
        {
          id: 'r1-d3',
          label: 'Granero en la roca',
          clueSource: 'Reto 2 · Vasijas',
          options: ['Valerón', 'La Luz', 'Guiniguada'],
          correctIndex: 0,
        },
      ],
      ciclo3: [
        {
          id: 'r1-c3-d1',
          label: 'Base del gofio',
          clueSource: 'Hallazgo · Cesto',
          options: ['Maíz dulce', 'Cebada tostada', 'Caña de azúcar', 'Trigo molido'],
          correctIndex: 1,
        },
        {
          id: 'r1-c3-d2',
          label: 'Frisos de Gáldar',
          clueSource: 'Reto 1 · Pintadera',
          options: [
            'Castillo de la Luz',
            'Real de Las Palmas',
            'Cueva Pintada',
            'Roque Bentayga',
          ],
          correctIndex: 2,
        },
        {
          id: 'r1-c3-d3',
          label: '+300 silos comunitarios',
          clueSource: 'Reto 2 · Patrimonio',
          options: [
            'Cenobio de Valerón',
            'Puerto de La Luz',
            'Torre de San Cristóbal',
            'Barranco de Guayadeque',
          ],
          correctIndex: 0,
        },
      ],
    },
    escapeHint: {
      ciclo2:
        'Recuerda el cesto (gofio), el sello de barro en cruz (pintadera) y el granero gigante excavado en la roca (Valerón).',
      ciclo3:
        'Revisa el grano tostado del hallazgo, el yacimiento con frisos geométricos de Gáldar y el granero excavado en un risco.',
    },
    unlockedMessage:
      '¡Los tres cilindros de piedra encajan con un clic! El paso hacia el siglo XV se abre ante ti.',
  },
  conquista: {
    roomId: 'conquista',
    lockName: 'Cerradura del Archivo Real',
    doorTitle: 'Portón del Barranco de Guiniguada',
    storyPrompt: {
      ciclo2:
        'El portón del archivo solo cede cuando encajas los 3 sellos y marcas las 3 claves de la historia de 1478–1483.',
      ciclo3:
        'Para salir del Archivo del Real de Las Palmas, introduce la secuencia histórica verificada en los 3 diales de bronce.',
    },
    dials: {
      ciclo2: [
        {
          id: 'r2-d1',
          label: 'Año del campamento',
          clueSource: 'Nota del archivero',
          options: ['1599', '1478', '1952'],
          correctIndex: 1,
        },
        {
          id: 'r2-d2',
          label: 'Barranco del palmeral',
          clueSource: 'Mapa de la sala',
          options: ['Guiniguada', 'Valerón', 'Maspalomas'],
          correctIndex: 0,
        },
        {
          id: 'r2-d3',
          label: 'Fin de la conquista',
          clueSource: 'Reto 1 · Cronología',
          options: ['1492', '1510', '1483'],
          correctIndex: 2,
        },
      ],
      ciclo3: [
        {
          id: 'r2-c3-d1',
          label: 'Fundación del Real',
          clueSource: 'Acta · 24 de junio',
          options: ['1478', '1483', '1492', '1599'],
          correctIndex: 0,
        },
        {
          id: 'r2-c3-d2',
          label: 'Pacto diplomático',
          clueSource: 'Reto 1 · Cronología',
          options: [
            'Pacto de Vegueta',
            'Pacto de Calatayud',
            'Pacto del Muelle',
            'Pacto de Tirajana',
          ],
          correctIndex: 1,
        },
        {
          id: 'r2-c3-d3',
          label: 'Cierre en 1483',
          clueSource: 'Nota del archivero',
          options: ['El Batán', 'La Isleta', 'Ansite', 'Agaete'],
          correctIndex: 2,
        },
      ],
    },
    escapeHint: {
      ciclo2:
        'Mira la nota del archivero: el campamento se montó en 1478 junto al barranco de Guiniguada y la conquista acabó en 1483.',
      ciclo3:
        'Contrasta la cronología del archivo: año del Real de Las Palmas, acuerdo diplomático de 1481–1482 y fortaleza final de 1483.',
    },
    unlockedMessage:
      '¡Cerrojo de bronce liberado! El archivo se abre hacia la costa atlántica de 1599.',
  },
  pirateria: {
    roomId: 'pirateria',
    lockName: 'Cerrojo de Hierro del Torreón',
    doorTitle: 'Escotilla de la Atalaya de San Cristóbal',
    storyPrompt: {
      ciclo2:
        'La escotilla del torreón está cerrada con el código del vigía. Ajusta los 3 diales para escapar hacia el siglo XX.',
      ciclo3:
        'Desbloquea el cerrojo de hierro de San Cristóbal aplicando el protocolo de alerta de 1599 y el comercio atlántico.',
    },
    dials: {
      ciclo2: [
        {
          id: 'r3-d1',
          label: 'Año de la alerta',
          clueSource: 'Torreón de vigía',
          options: ['1478', '1599', '1952'],
          correctIndex: 1,
        },
        {
          id: 'r3-d2',
          label: 'Señal de aviso',
          clueSource: 'Brasero de señales',
          options: ['Dos fuegos', 'Un fuego', 'Sin fuego'],
          correctIndex: 0,
        },
        {
          id: 'r3-d3',
          label: 'Fortaleza avisada',
          clueSource: 'Reto 1 · Almenaras',
          options: ['Roque Nublo', 'Cueva de Valerón', 'Castillo de la Luz'],
          correctIndex: 2,
        },
      ],
      ciclo3: [
        {
          id: 'r3-c3-d1',
          label: 'Protocolo de 1599',
          clueSource: 'Código del brasero',
          options: ['Dos hogueras', 'Tres faroles', 'Una hoguera', 'Campana sola'],
          correctIndex: 0,
        },
        {
          id: 'r3-c3-d2',
          label: 'Fortaleza receptora',
          clueSource: 'Reto 1 · Almenaras',
          options: [
            'Real de Agáldar',
            'Castillo de la Luz',
            'Presa de Soria',
            'Fortaleza de Ansite',
          ],
          correctIndex: 1,
        },
        {
          id: 'r3-c3-d3',
          label: 'Tinte rojo del s. XIX',
          clueSource: 'Reto 2 · Comercio',
          options: ['Caña de azúcar', 'Vino malvasía', 'Cochinilla', 'Plátano'],
          correctIndex: 2,
        },
      ],
    },
    escapeHint: {
      ciclo2:
        'Comprueba el código del brasero: en 1599 se encendieron dos fuegos para avisar al Castillo de la Luz.',
      ciclo3:
        'Relaciona la señal de humo del brasero, la fortaleza portuaria de Las Isletas y el tinte natural carmín del siglo XIX.',
    },
    unlockedMessage:
      '¡Los pasadores de hierro se deslizan! Sales del torreón rumbo al Puerto de La Luz del siglo XX.',
  },
  sigloXX: {
    roomId: 'sigloXX',
    lockName: 'Cerrojo Final del Cuaderno del Tiempo',
    doorTitle: 'Puerta de Regreso al Presente',
    storyPrompt: {
      ciclo2:
        '¡Última cerradura del Escape Room! Introduce las 3 claves de la memoria y el agua para completar la aventura y volver al presente.',
      ciclo3:
        'Activa el cerrojo final del Cuaderno del Tiempo con las 3 claves del siglo XX y la sostenibilidad de Gran Canaria.',
    },
    dials: {
      ciclo2: [
        {
          id: 'r4-d1',
          label: 'Año de la maleta',
          clueSource: 'Carta familiar',
          options: ['1483', '1952', '1599'],
          correctIndex: 1,
        },
        {
          id: 'r4-d2',
          label: 'Puerto de salida',
          clueSource: 'Reto 1 · Maleta',
          options: ['Puerto de La Luz', 'Agáldar', 'Valerón'],
          correctIndex: 0,
        },
        {
          id: 'r4-d3',
          label: 'Dónde nace el agua',
          clueSource: 'Reto 2 · Red del agua',
          options: ['Playa', 'Muelle', 'Cumbre'],
          correctIndex: 2,
        },
      ],
      ciclo3: [
        {
          id: 'r4-c3-d1',
          label: 'Destino de la carta',
          clueSource: 'Hallazgo · 1952',
          options: ['Venezuela', 'Noruega', 'Japón', 'Australia'],
          correctIndex: 0,
        },
        {
          id: 'r4-c3-d2',
          label: 'Reparto comunitario',
          clueSource: 'Reto 2 · Circuito agua',
          options: ['Almenaras', 'Heredamientos', 'Pintaderas', 'Guanartematos'],
          correctIndex: 1,
        },
        {
          id: 'r4-c3-d3',
          label: 'Vientos húmedos',
          clueSource: 'Reto 2 · Cumbres',
          options: ['Siroco seco', 'Calima', 'Alisios', 'Poniente'],
          correctIndex: 2,
        },
      ],
    },
    escapeHint: {
      ciclo2:
        'En 1952 las familias zarpaban desde el Puerto de La Luz, y el circuito del agua comienza con la lluvia en la cumbre.',
      ciclo3:
        'Combina el destino americano del pasaje de 1952, la institución que reparte los turnos de agua y los vientos húmedos del norte.',
    },
    unlockedMessage:
      '¡Cerrojo final abierto! Has escapado de las cuatro épocas y devuelto toda su luz a Gran Canaria.',
  },
};
