import {
  CanarianCollectible,
  EmotionFaceKey,
  RoomId,
  ThermometerMoodId,
  TransversalMission,
} from '../types/game';

export const TRANSVERSAL_MISSIONS: Record<RoomId, TransversalMission> = {
  aborigenes: {
    roomId: 'aborigenes',
    axis: 'Coeducación e Igualdad',
    odsTag: 'ODS 5 · Igualdad de género',
    title: 'Las manos invisibles de la cerámica canarii',
    story: {
      ciclo2:
        'En la antigua Gran Canaria, muchas mujeres moldeaban la cerámica, pintaban vasijas y transmitían las historias del valle, aunque a veces los libros antiguos solo nombraban a los guerreros.',
      ciclo3:
        'Las investigaciones arqueológicas en Gran Canaria demuestran el papel central de las mujeres en la alfarería, la conservación de alimentos y la transmisión cultural. Visibilizar su trabajo nos da una historia completa e igualitaria.',
    },
    question: '¿Por qué es importante estudiar también el trabajo de las mujeres en la historia?',
    options: [
      {
        id: 't1-a',
        label: 'Porque sus conocimientos y cuidados sostuvieron la vida de toda la comunidad.',
        isBest: true,
        feedback: '¡Exacto! Reconocer a mujeres y hombres construye una historia más justa e igualitaria.',
      },
      {
        id: 't1-b',
        label: 'No hace falta, solo importan las batallas.',
        isBest: false,
        feedback: 'La historia es mucho más que batallas: la ciencia, el arte y el cuidado cotidiano nos hacen avanzar.',
      },
      {
        id: 't1-c',
        label: 'Porque antes las mujeres no hacían ningún trabajo.',
        isBest: false,
        feedback: 'Al contrario: su trabajo fue imprescindible para alimentar, vestir y educar a la comunidad.',
      },
    ],
    actionTip:
      'Reto de aula: investigad el nombre de una mujer referente de Canarias (como Pino Ojeda, Josefina de la Torre o Carmen Laforet).',
  },
  conquista: {
    roomId: 'conquista',
    axis: 'Convivencia y Derechos',
    odsTag: 'ODS 16 · Paz y justicia',
    title: 'El valor de las palabras que heredamos',
    story: {
      ciclo2:
        'Palabras como gofio, baifo, Gáldar o Telde sobrevivieron más de 500 años. Cuidar la diversidad cultural significa valorar lo que cada pueblo aporta sin borrar a nadie.',
      ciclo3:
        'Los derechos humanos protegen la dignidad, la lengua y la identidad de todas las personas. Hoy Gran Canaria celebra sus raíces múltiples resolviendo los conflictos mediante el diálogo y el respeto.',
    },
    question: 'Cuando dos personas tienen ideas o costumbres distintas en clase, ¿qué favorece la cultura de paz?',
    options: [
      {
        id: 't2-a',
        label: 'Escuchar sin burlas, buscar puntos en común y llegar a acuerdos respetuosos.',
        isBest: true,
        feedback: '¡Muy bien! El diálogo respetuoso convierte la diversidad en riqueza.',
      },
      {
        id: 't2-b',
        label: 'Imponer siempre la costumbre de la mayoría sin preguntar.',
        isBest: false,
        feedback: 'Escuchar a todas las voces fortalece la convivencia democrática.',
      },
      {
        id: 't2-c',
        label: 'Evitar trabajar juntos en equipo.',
        isBest: false,
        feedback: 'Trabajar en equipos diversos nos ayuda a aprender nuevas ideas.',
      },
    ],
    actionTip:
      'Reto de aula: cread un pequeño mural con palabras bonitas que usen vuestras familias.',
  },
  pirateria: {
    roomId: 'pirateria',
    axis: 'Alfabetización Mediática',
    odsTag: 'Ciudadanía Digital Crítica',
    title: 'De los rumores de 1599 a los bulos en pantallas',
    story: {
      ciclo2:
        'En 1599 un rumor falso en el mercado asustó a todo Vegueta. Hoy los rumores viajan todavía más rápido por mensajes y vídeos en internet.',
      ciclo3:
        'Igual que los vigías de San Cristóbal contrastaban las señales antes de tocar alarma, hoy necesitamos pensamiento crítico digital para detectar noticias falsas (bulos) antes de reenviarlas.',
    },
    question: 'Si recibes un mensaje alarmante o un rumor sobre un compañero, ¿cuál es el paso más responsable?',
    options: [
      {
        id: 't3-a',
        label: 'No reenviarlo, comprobar si viene de una fuente fiable y pedir ayuda a un adulto si preocupa.',
        isBest: true,
        feedback: '¡Genial! Cortar la cadena de bulos protege a toda tu clase.',
      },
      {
        id: 't3-b',
        label: 'Reenviarlo rápido a todos los grupos por si acaso.',
        isBest: false,
        feedback: 'Reenviar sin comprobar multiplica el miedo y puede hacer daño a otras personas.',
      },
      {
        id: 't3-c',
        label: 'Creerlo al instante solo porque tiene letras grandes.',
        isBest: false,
        feedback: 'Los títulos exagerados suelen buscar clics o miedo, no informar con verdad.',
      },
    ],
    actionTip:
      'Regla de las 3P: Párate, Pregunta quién lo dice y Prueba si es verdad antes de compartir.',
  },
  sigloXX: {
    roomId: 'sigloXX',
    axis: 'Sostenibilidad · ODS',
    odsTag: 'ODS 6 y 13 · Agua y Clima (Agenda Canaria 2030)',
    title: 'Cada gota cuenta en una isla volcánica',
    story: {
      ciclo2:
        'En Gran Canaria el agua es un tesoro que viaja desde las nubes hasta las presas y acequias. Cuidar los barrancos, las plantas autóctonas y no malgastar agua protege nuestro futuro.',
      ciclo3:
        'La Agenda Canaria 2030 impulsa el ahorro de agua, las energías limpias y la protección de ecosistemas únicos como el pinar canario y el litoral frente al cambio climático.',
    },
    question: '¿Qué gesto diario en el colegio y en casa ayuda de verdad a cuidar el agua y el clima de la isla?',
    options: [
      {
        id: 't4-a',
        label: 'Cerrar el grifo al enjabonarse, usar botella reutilizable y cuidar las zonas verdes.',
        isBest: true,
        feedback: '¡Brillante! Pequeños hábitos diarios multiplicados por toda la isla logran grandes cambios.',
      },
      {
        id: 't4-b',
        label: 'Dejar el agua correr porque siempre habrá lluvia de sobra.',
        isBest: false,
        feedback: 'En islas con lluvias irregulares como Gran Canaria, ahorrar cada gota es vital.',
      },
      {
        id: 't4-c',
        label: 'Tirar plásticos en los barrancos porque el viento se los lleva.',
        isBest: false,
        feedback: 'Los residuos de los barrancos acaban llegando al océano y dañando la fauna marina.',
      },
    ],
    actionTip:
      'Reto de aula: elegid un "guardián o guardiana del agua y la luz" cada semana en clase.',
  },
};

export const CANARIAN_COLLECTIBLES: CanarianCollectible[] = [
  {
    id: 'col-alpispa',
    roomId: 'aborigenes',
    word: 'Alpispa',
    secondaryWord: 'Millo',
    category: 'Fauna canaria',
    meaning:
      'Pajarillo muy inquieto y simpático (lavandera cascadeña) que vive cerca del agua en los barrancos de Gran Canaria.',
    exampleSentence: '«¡Mira qué rápido salta esa alpispa junto al agua del barranco!»',
    culturalFact:
      'En Canarias también llamamos «millo» al maíz, con el que se prepara el delicioso gofio junto a la cebada y el trigo.',
    hotspotX: 68,
    hotspotY: 79,
    iconKey: 'alpispa',
  },
  {
    id: 'col-perenquen',
    roomId: 'conquista',
    word: 'Perenquén',
    secondaryWord: 'Baifo',
    category: 'Fauna canaria',
    meaning:
      'Pequeño reptil nocturno autóctono de Canarias que ayuda a cuidar las casas comiendo mosquitos.',
    exampleSentence: '«El perenquén trepa por el muro de piedra volcánica sin hacer ruido».',
    culturalFact:
      '«Baifo» es una palabra de origen aborigen que seguimos usando hoy para llamar al cabrito.',
    hotspotX: 68,
    hotspotY: 76,
    iconKey: 'perenquen',
  },
  {
    id: 'col-timple',
    roomId: 'pirateria',
    word: 'Timple',
    secondaryWord: 'Buchito',
    category: 'Música y tradición',
    meaning:
      'Pequeño instrumento de cuerda con sonido alegre y brillante, símbolo musical del archipiélago canario.',
    exampleSentence: '«En la plaza de Vegueta sonaba un timple animando a todo el vecindario».',
    culturalFact:
      'Un «buchito» es un sorbito pequeño de agua, leche o café compartido en buena compañía.',
    hotspotX: 63,
    hotspotY: 36,
    iconKey: 'timple',
  },
  {
    id: 'col-guagua',
    roomId: 'sigloXX',
    word: 'Guagua',
    secondaryWord: 'Tenderete',
    category: 'Habla canaria',
    meaning:
      'Palabra canaria y caribeña para llamar al autobús urbano o interurbano, fruto del puente cultural con América.',
    exampleSentence: '«Cogimos la guagua hacia el Puerto de La Luz para ver llegar los barcos».',
    culturalFact:
      'Un «tenderete» es una fiesta alegre y cercana con música popular, baile y amistad.',
    hotspotX: 60,
    hotspotY: 34,
    iconKey: 'guagua',
  },
];

export const THERMOMETER_MOODS: {
  id: ThermometerMoodId;
  label: string;
  emoji: string;
  face: EmotionFaceKey;
  shortTip: string;
}[] = [
  {
    id: 'curiosidad',
    label: 'Curiosidad',
    emoji: '🧐',
    face: 'alegria',
    shortTip: '¡Ganas de descubrir pistas!',
  },
  {
    id: 'calma',
    label: 'Calma',
    emoji: '😌',
    face: 'calma',
    shortTip: 'Mente serena para pensar.',
  },
  {
    id: 'nervios',
    label: 'Nervios',
    emoji: '😟',
    face: 'preocupacion',
    shortTip: 'Respira despacio: ¡no hay reloj!',
  },
  {
    id: 'alegria',
    label: 'Alegría',
    emoji: '😊',
    face: 'alegria',
    shortTip: '¡Disfrutando la aventura!',
  },
  {
    id: 'orgullo',
    label: 'Orgullo',
    emoji: '🌟',
    face: 'calma',
    shortTip: '¡Qué bien lo estás haciendo!',
  },
];

export function getMoodById(id?: ThermometerMoodId) {
  return THERMOMETER_MOODS.find((m) => m.id === id);
}

export const COOPERATIVE_ROLES = [
  {
    id: 'portavoz',
    title: 'Portavoz del Equipo',
    task: 'Resume los acuerdos del grupo y comparte la decisión en voz alta.',
    emoji: '🎙️',
  },
  {
    id: 'detective',
    title: 'Detective de Pistas',
    task: 'Observa el escenario, señala hallazgos y decide cuándo abrir una pista.',
    emoji: '🔍',
  },
  {
    id: 'secretario',
    title: 'Secretario/a del Diario',
    task: 'Propone la frase de reflexión y la pega-nota de 1 palabra del equipo.',
    emoji: '📝',
  },
  {
    id: 'guardian',
    title: 'Guardián de la Empatía',
    task: 'Asegura que todas las personas del grupo hablen y sean escuchadas con respeto.',
    emoji: '🤝',
  },
];

export const ASSEMBLY_FLASH_QUESTIONS: Record<RoomId, string[]> = {
  aborigenes: [
    'Si nuestra clase fuera un granero colectivo como Valerón, ¿qué 3 cosas compartiríamos siempre?',
    '¿Por qué nos hace sentir bien cuando todos colaboramos en lugar de pensar solo en uno mismo?',
  ],
  conquista: [
    '¿Alguna vez cambiaste de opinión al escuchar la versión de otra persona? ¿Qué pasó?',
    '¿Cómo podemos demostrar respeto por las palabras y costumbres diferentes que existen en nuestra clase?',
  ],
  pirateria: [
    'Cuando alguien trae un rumor al patio o por mensaje, ¿qué podemos responder para frenar el pánico?',
    '¿Qué truco de respiración o calma te funciona mejor antes de un examen o reto difícil?',
  ],
  sigloXX: [
    '¿Qué 3 gestos sencillos harían feliz a un compañero o compañera que llega hoy por primera vez al colegio?',
    '¿Qué pequeño cambio podemos hacer esta semana en clase para ahorrar agua y cuidar Gran Canaria?',
  ],
};
