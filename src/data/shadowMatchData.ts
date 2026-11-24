import { CycleId, RoomId } from '../types/game';

export type ArtifactIconKey =
  | 'vasija'
  | 'pintadera'
  | 'molino'
  | 'idolo'
  | 'carabela'
  | 'pluma'
  | 'pergamino'
  | 'llave-real'
  | 'sextante'
  | 'catalejo'
  | 'ancla'
  | 'campana'
  | 'maleta'
  | 'timple'
  | 'vapor'
  | 'cantaro';

export interface ShadowArtifact {
  id: ArtifactIconKey;
  name: string;
  shortFact: string;
  silhouetteCue: string;
}

export interface RoomShadowChallenge {
  roomId: RoomId;
  title: string;
  subtitle: string;
  hotspotX: number;
  hotspotY: number;
  artifacts: [ShadowArtifact, ShadowArtifact, ShadowArtifact, ShadowArtifact];
  unlockedClueTitle: string;
  unlockedClueText: Record<CycleId, string>;
  historicalConnection: string;
}

export const SHADOW_CHALLENGES: Record<RoomId, RoomShadowChallenge> = {
  aborigenes: {
    roomId: 'aborigenes',
    title: 'Sombras de la Cueva de Agáldar',
    subtitle: 'Arrastra cada objeto aborigen sobre su silueta exacta',
    hotspotX: 58,
    hotspotY: 42,
    artifacts: [
      {
        id: 'vasija',
        name: 'Vasija aborigen',
        shortFact:
          'Hecha a mano sin torno y pulida con piedras para guardar agua y grano.',
        silhouetteCue: 'Cuerpo redondeado con dos asas laterales.',
      },
      {
        id: 'pintadera',
        name: 'Pintadera de Gáldar',
        shortFact:
          'Sello de barro cocido con motivos geométricos único de Gran Canaria.',
        silhouetteCue: 'Base triangular con mango pequeño en la parte superior.',
      },
      {
        id: 'molino',
        name: 'Molino de piedra',
        shortFact:
          'Piedra volcánica circular con mango de madera para moler cebada y hacer gofio.',
        silhouetteCue: 'Dos discos de piedra superpuestos con vara lateral.',
      },
      {
        id: 'idolo',
        name: 'Ídolo de Tara (o de Chil)',
        shortFact:
          'Figurilla prehispánica de terracota vinculada a la fertilidad; la arqueología actual también la denomina Ídolo de Chil.',
        silhouetteCue: 'Figura simétrica con hombros anchos y base sentada.',
      },
    ],
    unlockedClueTitle: 'Pista secreta · Tecnología de los antiguos canarii',
    unlockedClueText: {
      ciclo2:
        'Los antiguos canarios aprovecharon la piedra volcánica y el barro de la isla sin desperdiciar nada: molían el grano en molinos de mano, guardaban la comida en vasijas y estampaban pintaderas geométricas (una hipótesis principal es que marcaban cada silo).',
      ciclo3:
        'Los canarii combinaron técnicas alfareras sin torno, molinos rotatorios de basalto y pintaderas geométricas (cuyo uso como sellos de granero o marcadores identitarios sigue investigándose) para organizar sus reservas en graneros colectivos como el Cenobio de Valerón.',
    },
    historicalConnection:
      'Muchas de estas piezas originales pueden visitarse hoy en el Museo y Parque Arqueológico Cueva Pintada (Gáldar) y en El Museo Canario (Las Palmas de Gran Canaria).',
  },
  conquista: {
    roomId: 'conquista',
    title: 'Sombras del Real de Las Palmas',
    subtitle: 'Encaja cada objeto del siglo XV en su silueta correspondiente',
    hotspotX: 71,
    hotspotY: 32,
    artifacts: [
      {
        id: 'carabela',
        name: 'Carabela atlántica',
        shortFact:
          'Barco ligero de velas latinas y cuadradas que surcaba las rutas hacia Canarias.',
        silhouetteCue: 'Casco marinero con mástiles altos y velas hinchadas.',
      },
      {
        id: 'pluma',
        name: 'Pluma y tintero',
        shortFact:
          'Herramienta de los cronistas y escribanos para redactar cartas y actas.',
        silhouetteCue: 'Pluma inclinada saliendo de un pequeño frasco cuadrado.',
      },
      {
        id: 'pergamino',
        name: 'Pergamino sellado',
        shortFact:
          'Documento enrollado con sello de lacre donde se firmaban pactos y bandos.',
        silhouetteCue: 'Rollo horizontal con extremos curvados y cinta colgando.',
      },
      {
        id: 'llave-real',
        name: 'Llave del Real',
        shortFact:
          'Llave forjada en hierro que simboliza las puertas de la nueva ciudad junto al Guiniguada.',
        silhouetteCue: 'Aro ornamentado arriba, tallo largo y dientes abajo.',
      },
    ],
    unlockedClueTitle: 'Pista secreta · El nacimiento junto al Guiniguada',
    unlockedClueText: {
      ciclo2:
        'El Real de Las Palmas empezó en 1478 como un pequeño campamento junto al barranco de Guiniguada y su palmeral. De aquel encuentro nació una ciudad donde se mezclaron palabras, cultivos y costumbres de ambas culturas.',
      ciclo3:
        'Los escribanos del Real de Las Palmas registraron pactos, repartos de tierras y ordenanzas desde 1478. Comparar esos documentos con el legado aborigen nos permite entender que la sociedad canaria nació del mestizaje cultural.',
    },
    historicalConnection:
      'El primer asentamiento dio origen a los barrios históricos de Vegueta y Triana, separados originalmente por el cauce del barranco de Guiniguada.',
  },
  pirateria: {
    roomId: 'pirateria',
    title: 'Sombras de la Atalaya Costera',
    subtitle: 'Relaciona cada instrumento marinero con su sombra exacta',
    hotspotX: 38,
    hotspotY: 76,
    artifacts: [
      {
        id: 'sextante',
        name: 'Sextante náutico (ss. XVIII–XIX)',
        shortFact:
          'Instrumento de navegación del siglo XVIII–XIX para medir el ángulo del sol y las estrellas; en 1599 se usaban el astrolabio y la ballestilla.',
        silhouetteCue: 'Arco curvo inferior con marco triangular y brazo móvil.',
      },
      {
        id: 'catalejo',
        name: 'Catalejo de vigía',
        shortFact:
          'Tubo telescópico de latón usado desde las torres para avistar velas en el horizonte.',
        silhouetteCue: 'Tubo alargado en diagonal con tramos escalonados.',
      },
      {
        id: 'ancla',
        name: 'Ancla de galeón',
        shortFact:
          'Pesada pieza de hierro con brazos curvos para sujetar los navíos en la bahía.',
        silhouetteCue: 'Argolla superior, barra cruzada y doble gancho curvo.',
      },
      {
        id: 'campana',
        name: 'Campana de atalaya',
        shortFact:
          'Campana de bronce que sonaba junto a las hogueras para alertar a la población costera.',
        silhouetteCue: 'Cúpula acampanada colgada de un arco superior.',
      },
    ],
    unlockedClueTitle: 'Pista secreta · La red de vigías del Atlántico',
    unlockedClueText: {
      ciclo2:
        'Desde torres como San Cristóbal, los vigías miraban el mar con catalejos. Si veían barcos piratas, tocaban las campanas y encendían hogueras (almenaras) para avisar rápidamente a los pueblos cercanos.',
      ciclo3:
        'Gran Canaria resistió grandes ataques marítimos, como el del corsario inglés Francis Drake (1595) y la armada holandesa de Pieter van der Does (1599), que llegó a incendiar Las Palmas antes de ser derrotada tierra adentro en la Batalla de El Batán.',
    },
    historicalConnection:
      'El torreón de San Cristóbal, construido en el siglo XVI sobre un arrecife volcánico, sigue en pie frente a la costa de Las Palmas de Gran Canaria.',
  },
  sigloXX: {
    roomId: 'sigloXX',
    title: 'Sombras del Puerto y la Memoria',
    subtitle: 'Arrastra cada recuerdo del siglo XX hacia su silueta',
    hotspotX: 54,
    hotspotY: 68,
    artifacts: [
      {
        id: 'maleta',
        name: 'Maleta de emigrante',
        shortFact:
          'Maleta con correas donde las familias llevaban fotos, ropa y recuerdos hacia América.',
        silhouetteCue: 'Rectángulo con asa superior y dos correas verticales.',
      },
      {
        id: 'timple',
        name: 'Timple canario',
        shortFact:
          'Pequeño instrumento de cinco cuerdas con caja abombada, alma de la música canaria.',
        silhouetteCue: 'Silueta estrecha en forma de ocho con mástil fino.',
      },
      {
        id: 'vapor',
        name: 'Barco de vapor',
        shortFact:
          'Gran buque de chimeneas humeantes que llegaba al Puerto de La Luz a repostar carbón.',
        silhouetteCue: 'Casco alargado con dos chimeneas inclinadas arriba.',
      },
      {
        id: 'cantaro',
        name: 'Cántaro de agua',
        shortFact:
          'Recipiente tradicional de barro que mantenía fresca el agua recogida de las acequias.',
        silhouetteCue: 'Cuello estrecho, barriga ancha y una gran asa arqueada.',
      },
    ],
    unlockedClueTitle: 'Pista secreta · Puentes de agua y memoria',
    unlockedClueText: {
      ciclo2:
        'En el siglo XX, el Puerto de La Luz conectó Gran Canaria con barcos de todo el mundo. Muchas familias viajaron con su maleta y su timple, mientras en la isla se construían presas y acequias para cuidar cada gota de agua.',
      ciclo3:
        'El Puerto de La Luz impulsó la economía moderna y las rutas migratorias hacia Cuba y Venezuela. Al mismo tiempo, la ingeniería popular de presas, cantoneras y acequias permitió compartir el agua entre cumbres y medianías.',
    },
    historicalConnection:
      'Conservar la memoria de quienes emigraron y de la cultura del agua ayuda hoy a construir una Gran Canaria más acogedora y sostenible.',
  },
};
