import { RoomId } from '../types/game';

export type GlossaryIconKey =
  | 'pintadera'
  | 'silo'
  | 'guanartemato'
  | 'alfareria'
  | 'cronica'
  | 'toponimia'
  | 'mestizaje'
  | 'prejuicio'
  | 'almenara'
  | 'atalaya'
  | 'cochinilla'
  | 'bulo'
  | 'anacronismo'
  | 'acequia'
  | 'alisios'
  | 'emigracion';

export interface GlossaryTerm {
  id: string;
  term: string;
  roomId: RoomId;
  roomNumber: number;
  category: 'Arqueología' | 'Historia' | 'Patrimonio y Agua' | 'Pensamiento Crítico';
  simpleDefinition: string;
  pictogramSteps: [string, string, string];
  example: string;
  iconKey: GlossaryIconKey;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // SALA 1 — ABORÍGENES
  {
    id: 'pintadera',
    term: 'Pintadera',
    roomId: 'aborigenes',
    roomNumber: 1,
    category: 'Arqueología',
    simpleDefinition:
      'Sello pequeño de barro cocido con dibujos geométricos. Los antiguos canarios lo usaban para marcar sus graneros o decorar.',
    pictogramSteps: ['🏺 Barro', '🔺 Dibujo', '🔖 Sello'],
    example: 'En Gáldar tallaste una pintadera simétrica para identificar el silo.',
    iconKey: 'pintadera',
  },
  {
    id: 'silo',
    term: 'Silo (Cenobio de Valerón)',
    roomId: 'aborigenes',
    roomNumber: 1,
    category: 'Arqueología',
    simpleDefinition:
      'Cueva pequeña excavada en la roca volcánica para guardar grano y semillas secos y protegidos para toda la comunidad.',
    pictogramSteps: ['🪨 Roca', '🌾 Grano', '🤝 Para todos'],
    example: 'El Cenobio de Valerón tenía más de 300 silos excavados en el risco.',
    iconKey: 'silo',
  },
  {
    id: 'guanartemato',
    term: 'Guanartemato',
    roomId: 'aborigenes',
    roomNumber: 1,
    category: 'Historia',
    simpleDefinition:
      'Cada uno de los dos grandes territorios en los que se organizaba Gran Canaria antes de 1478: Agáldar y Telde.',
    pictogramSteps: ['🏝️ Isla', '🗺️ 2 zonas', '⚖️ Gobierno'],
    example: 'El guanarteme gobernaba escuchando al consejo de la comunidad.',
    iconKey: 'guanartemato',
  },
  {
    id: 'alfareria',
    term: 'Alfarería y friso',
    roomId: 'aborigenes',
    roomNumber: 1,
    category: 'Arqueología',
    simpleDefinition:
      'La alfarería es el arte de moldear vasijas con barro a mano. Un friso es una banda pintada con dibujos en la pared de una cueva.',
    pictogramSteps: ['✋ Manos', '🏺 Vasija', '🎨 Friso'],
    example: 'En la Cueva Pintada de Gáldar aún se conservan frisos rojos, blancos y negros.',
    iconKey: 'alfareria',
  },

  // SALA 2 — CONQUISTA Y ENCUENTRO
  {
    id: 'cronica',
    term: 'Crónica histórica',
    roomId: 'conquista',
    roomNumber: 2,
    category: 'Historia',
    simpleDefinition:
      'Relato antiguo donde una persona escribía lo que pasaba en su época. Como refleja su punto de vista, conviene compararla con otras fuentes.',
    pictogramSteps: ['📜 Papel', '✍️ Relato', '🔍 Comparar'],
    example: 'Al leer dos crónicas distintas entendemos mejor lo ocurrido en 1478.',
    iconKey: 'cronica',
  },
  {
    id: 'toponimia',
    term: 'Toponimia',
    roomId: 'conquista',
    roomNumber: 2,
    category: 'Arqueología',
    simpleDefinition:
      'Conjunto de nombres de pueblos, barrancos y montañas. Muchos lugares de Gran Canaria conservan su nombre aborigen.',
    pictogramSteps: ['⛰️ Lugar', '🗣️ Nombre', '⏳ Memoria'],
    example: 'Telde, Gáldar, Arucas y Guiniguada son ejemplos de toponimia canarii.',
    iconKey: 'toponimia',
  },
  {
    id: 'mestizaje',
    term: 'Mestizaje',
    roomId: 'conquista',
    roomNumber: 2,
    category: 'Historia',
    simpleDefinition:
      'Encuentro y mezcla de familias, palabras, músicas y costumbres de culturas distintas que conviven en un mismo lugar.',
    pictogramSteps: ['🌍 Culturas', '🤲 Encuentro', '🌈 Riqueza'],
    example: 'El habla y las tradiciones de Canarias nacen del mestizaje de varios pueblos.',
    iconKey: 'mestizaje',
  },
  {
    id: 'prejuicio',
    term: 'Prejuicio',
    roomId: 'conquista',
    roomNumber: 2,
    category: 'Pensamiento Crítico',
    simpleDefinition:
      'Opinión injusta sobre una persona o grupo formada antes de conocerlos y sin tener pruebas reales.',
    pictogramSteps: ['🚫 Sin pruebas', '😟 Etiqueta', '💡 Cuestionar'],
    example: 'El pensamiento crítico nos ayuda a detectar prejuicios y escuchar con respeto.',
    iconKey: 'prejuicio',
  },

  // SALA 3 — PIRATERÍA Y PUENTE ATLÁNTICO
  {
    id: 'almenara',
    term: 'Almenara',
    roomId: 'pirateria',
    roomNumber: 3,
    category: 'Historia',
    simpleDefinition:
      'Hoguera encendida en un lugar alto para mandar avisos rápidos con fuego de noche o con humo de día.',
    pictogramSteps: ['🔥 Fuego', '💨 Humo', '📣 Aviso'],
    example: 'Dos almenaras encendidas avisaban al Castillo de la Luz si llegaban barcos.',
    iconKey: 'almenara',
  },
  {
    id: 'atalaya',
    term: 'Atalaya',
    roomId: 'pirateria',
    roomNumber: 3,
    category: 'Arqueología',
    simpleDefinition:
      'Torre de piedra situada junto al mar o en una colina desde donde los vigías observaban el horizonte.',
    pictogramSteps: ['🏰 Torre', '👀 Vigía', '🌊 Horizonte'],
    example: 'La Torre de San Cristóbal protegía la costa de Las Palmas de Gran Canaria.',
    iconKey: 'atalaya',
  },
  {
    id: 'cochinilla',
    term: 'Cochinilla',
    roomId: 'pirateria',
    roomNumber: 3,
    category: 'Historia',
    simpleDefinition:
      'Pequeño insecto que vive en las pencas de las tuneras y sirve para fabricar un famoso tinte rojo carmín natural.',
    pictogramSteps: ['🌵 Tunera', '🐞 Insecto', '🔴 Tinte rojo'],
    example: 'En el siglo XIX Canarias exportó cochinilla a fábricas textiles de toda Europa.',
    iconKey: 'cochinilla',
  },
  {
    id: 'bulo',
    term: 'Bulo (rumor falso)',
    roomId: 'pirateria',
    roomNumber: 3,
    category: 'Pensamiento Crítico',
    simpleDefinition:
      'Noticia inventada o exagerada que se repite sin comprobar y puede causar miedo o confusión en la gente.',
    pictogramSteps: ['📢 Rumor', '🛑 Parar', '✅ Comprobar'],
    example: 'Tanto en 1599 como hoy en internet, comprobar la fuente frena los bulos.',
    iconKey: 'bulo',
  },

  // SALA 4 — SIGLO XX Y MEMORIA VIVA
  {
    id: 'anacronismo',
    term: 'Anacronismo',
    roomId: 'sigloXX',
    roomNumber: 4,
    category: 'Pensamiento Crítico',
    simpleDefinition:
      'Objeto, invento o costumbre que aparece en una época antigua cuando todavía no se había inventado.',
    pictogramSteps: ['🕰️ 1952', '📱 Móvil', '❌ No encaja'],
    example: 'Un código QR o una tableta dentro de una maleta de 1952 son anacronismos.',
    iconKey: 'anacronismo',
  },
  {
    id: 'acequia',
    term: 'Acequia y heredamiento',
    roomId: 'sigloXX',
    roomNumber: 4,
    category: 'Patrimonio y Agua',
    simpleDefinition:
      'Una acequia es un canal que lleva el agua por las laderas. Un heredamiento es la comunidad que organiza los turnos de riego.',
    pictogramSteps: ['💧 Agua', '〰️ Canal', '🌱 Huertas'],
    example: 'Las acequias repartían el agua de las presas de forma ordenada en los valles.',
    iconKey: 'acequia',
  },
  {
    id: 'alisios',
    term: 'Vientos alisios',
    roomId: 'sigloXX',
    roomNumber: 4,
    category: 'Patrimonio y Agua',
    simpleDefinition:
      'Vientos frescos y constantes del Atlántico que traen humedad y forman el «mar de nubes» en el norte y cumbres de la isla.',
    pictogramSteps: ['🌬️ Viento', '☁️ Nubes', '🌲 Bosques'],
    example: 'Los alisios refrescan Gran Canaria y alimentan la humedad de sus cumbres.',
    iconKey: 'alisios',
  },
  {
    id: 'emigracion',
    term: 'Emigración y acogida',
    roomId: 'sigloXX',
    roomNumber: 4,
    category: 'Historia',
    simpleDefinition:
      'Emigrar es viajar a otro país buscando un futuro mejor. Acoger es recibir con respeto y cariño a quien llega nuevo.',
    pictogramSteps: ['🧳 Viaje', '🚢 Puente', '🤗 Bienvenida'],
    example: 'Muchas familias canarias emigraron a América y hoy Gran Canaria acoge a nuevas familias.',
    iconKey: 'emigracion',
  },
];
