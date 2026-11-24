import {
  AtlasLayerId,
  CycleId,
  RoomId,
  SpecificCompetencyId,
} from '../types/game';

export interface NaturalAtlasLandmark {
  id: string;
  layer: AtlasLayerId;
  name: string;
  zoneLabel: string;
  metricLabel: string;
  roomId: RoomId;
  cx: number;
  cy: number;
  summary: Record<CycleId, string>;
  humanNatureLink: string;
  curriculumTag: string;
}

export interface AtlasLayerInquiry {
  hypothesisPrompt: Record<CycleId, string>;
  question: Record<CycleId, string>;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  conclusion: string;
  ceCodes: SpecificCompetencyId[];
}

export interface AtlasLayerDefinition {
  id: AtlasLayerId;
  title: string;
  shortLabel: string;
  blockTag: string;
  ceTag: string;
  accentHex: string;
  overview: Record<CycleId, string>;
  altitudeStrip: {
    elevation: string;
    zone: string;
    detail: string;
  }[];
  inquiry: AtlasLayerInquiry;
}

export const ATLAS_LAYERS: AtlasLayerDefinition[] = [
  {
    id: 'relieve',
    title: 'Relieve volcánico y geografía física',
    shortLabel: 'Relieve',
    blockTag: 'Bloque A · Cultura científica',
    ceTag: 'CE2 · CE5',
    accentHex: '#9C5A25',
    overview: {
      ciclo2:
        'Gran Canaria es una isla volcánica con forma casi redonda: tiene montañas altas en la cumbre, profundos barrancos y playas en la costa.',
      ciclo3:
        'El origen volcánico de Gran Canaria ha esculpido calderas de erosión, roques basálticos, barrancos radiales y penínsulas como La Isleta, condicionando dónde vivieron sus habitantes.',
    },
    altitudeStrip: [
      {
        elevation: '0 – 300 m',
        zone: 'Costa y bahías',
        detail: 'Playas, acantilados y puertos naturales (La Isleta, Gáldar).',
      },
      {
        elevation: '300 – 1.000 m',
        zone: 'Medianías y barrancos',
        detail: 'Barrancos de Guayadeque y Guiniguada; cuevas excavadas en toba.',
      },
      {
        elevation: '1.000 – 1.956 m',
        zone: 'Cumbres volcánicas',
        detail: 'Morro de la Agujereada (1.956 m), Roque Nublo (1.813 m) y Tejeda.',
      },
    ],
    inquiry: {
      hypothesisPrompt: {
        ciclo2:
          'Indagación científica: observa las cuevas aborígenes y los barrancos de la isla.',
        ciclo3:
          'Indagación (CE2 · CE5): relaciona la geología volcánica con el poblamiento prehispánico.',
      },
      question: {
        ciclo2:
          '¿Por qué los antiguos canarios excavaron graneros y viviendas en paredes como el Cenobio de Valerón?',
        ciclo3:
          '¿Qué ventaja científica y geográfica ofrecía la toba volcánica de los barrancos para los poblados y graneros canarii?',
      },
      options: [
        {
          id: 'toba',
          label:
            'Porque la toba volcánica se podía tallar y mantenía temperatura fresca y seca todo el año.',
          isCorrect: true,
          feedback:
            '¡Exacto! La toba volcánica es una roca blanda y aislante: protegía el grano de la humedad y daba abrigo natural frente al calor y el frío.',
        },
        {
          id: 'nieve',
          label:
            'Porque en la costa de Gran Canaria nieva todos los meses y buscaban el hielo.',
          isCorrect: false,
          feedback:
            'En la costa de Gran Canaria el clima es suave todo el año. Fíjate en la roca volcánica y la conservación de los alimentos.',
        },
        {
          id: 'rios',
          label:
            'Porque querían evitar que grandes ríos congelados destruyeran sus barcos.',
          isCorrect: false,
          feedback:
            'En Gran Canaria no hay ríos congelados sino barrancos estacionales. Piensa en cómo es la roca volcánica.',
        },
      ],
      conclusion:
        'Evidencia comprobada: el relieve volcánico condicionó la arquitectura troglodita y el almacenamiento seguro de cereales en los barrancos.',
      ceCodes: ['CE2', 'CE5'],
    },
  },
  {
    id: 'ecosistemas',
    title: 'Ecosistemas, endemismos y Selva de Doramas',
    shortLabel: 'Ecosistemas',
    blockTag: 'Bloque A + C · Ecosistemas e impacto humano',
    ceTag: 'CE5 · CE6',
    accentHex: '#2A6F4E',
    overview: {
      ciclo2:
        'Según la altura y la humedad, en Gran Canaria viven plantas y animales únicos en el mundo: cardones en la costa, bosques húmedos en el norte y pinares en la cumbre.',
      ciclo3:
        'Gran Canaria alberga distintos pisos bioclimáticos (cardonal-tabaibal, monteverde/laurisilva y pinar canario). La acción humana desde la conquista transformó gravemente ecosistemas como la Selva de Doramas.',
    },
    altitudeStrip: [
      {
        elevation: 'Zona baja seca',
        zone: 'Cardonal-tabaibal',
        detail: 'Plantas adaptadas a poca lluvia y al sol, como el cardón y la tabaiba.',
      },
      {
        elevation: 'Norte húmedo',
        zone: 'Monteverde y laurisilva',
        detail: 'Antigua Selva de Doramas (hoy protegida en Los Tilos de Moya).',
      },
      {
        elevation: 'Cumbres',
        zone: 'Pinar canario',
        detail: 'Pino canario (Pinus canariensis), capaz de rebrotar tras incendios.',
      },
    ],
    inquiry: {
      hypothesisPrompt: {
        ciclo2:
          'Indagación ecosocial: compara el bosque del norte antes y después de la conquista.',
        ciclo3:
          'Indagación (CE5 · CE6): analiza las causas y consecuencias de la intervención humana en los ecosistemas insulares.',
      },
      question: {
        ciclo2:
          '¿Por qué desapareció gran parte de la Selva de Doramas tras la conquista del siglo XV?',
        ciclo3:
          '¿Qué actividad económica introducida tras la conquista provocó la mayor tala de la Selva de Doramas y qué consecuencia tuvo?',
      },
      options: [
        {
          id: 'azucar',
          label:
            'Se taló madera para los ingenios de caña de azúcar y tierras de cultivo, reduciendo el bosque húmedo.',
          isCorrect: true,
          feedback:
            '¡Correcto! Los ingenios azucareros necesitaban muchísima leña y agua. Hoy protegemos los restos en Los Tilos de Moya y reforestamos para recuperar biodiversidad.',
        },
        {
          id: 'volcan-ayer',
          label:
            'Un volcán cubrió por completo el norte de la isla la semana pasada.',
          isCorrect: false,
          feedback:
            'Las últimas erupciones en Gran Canaria ocurrieron hace unos dos mil años. La causa de la pérdida de la Selva de Doramas fue la acción humana.',
        },
        {
          id: 'sin-lluvia-siempre',
          label:
            'Porque en el norte de Gran Canaria nunca llegan nubes ni humedad.',
          isCorrect: false,
          feedback:
            'Al contrario: el norte recibe los vientos alisios húmedos, por eso crecía allí la laurisilva.',
        },
      ],
      conclusion:
        'Evidencia comprobada: conocer el impacto histórico de la deforestación nos enseña a proteger los bosques húmedos y la biodiversidad endémica hoy.',
      ceCodes: ['CE5', 'CE6'],
    },
  },
  {
    id: 'agua',
    title: 'Vientos alisios y ciclo del agua insular',
    shortLabel: 'Alisios y Agua',
    blockTag: 'Bloque A + C · Clima y sostenibilidad',
    ceTag: 'CE2 · CE5 · CE6',
    accentHex: '#1D4E89',
    overview: {
      ciclo2:
        'Los vientos alisios traen nubes húmedas desde el noreste. Al chocar con las montañas, los árboles atrapan gotitas de agua y las presas la guardan para toda la isla.',
      ciclo3:
        'El clima de Gran Canaria está regido por los vientos alisios del noreste y la corriente fría de Canarias. El mar de nubes produce la lluvia horizontal, que recarga los acuíferos y se complementa con presas, pozos y desalación.',
    },
    altitudeStrip: [
      {
        elevation: 'Vientos del NE',
        zone: 'Alisios y mar de nubes',
        detail: 'Chocan con el norte (600–1.500 m) creando niebla y lluvia horizontal.',
      },
      {
        elevation: 'Subsuelo y cumbre',
        zone: 'Acuíferos y presas',
        detail: 'El agua se infiltra en rocas volcánicas o se embalsa en Soria y Chira.',
      },
      {
        elevation: 'Litoral y ciudades',
        zone: 'Desalación y ahorro',
        detail: 'Plantas desaladoras, depuración y uso responsable (ODS 6).',
      },
    ],
    inquiry: {
      hypothesisPrompt: {
        ciclo2:
          'Indagación científica: sigue el viaje del agua desde las nubes del norte hasta tu casa.',
        ciclo3:
          'Indagación (CE2 · CE6): explica el papel de los bosques y los vientos alisios en el ciclo hidrológico de Gran Canaria.',
      },
      question: {
        ciclo2:
          '¿Cómo ayudan los árboles del norte (como los pinos y la laurisilva) a conseguir agua cuando hay mar de nubes?',
        ciclo3:
          '¿Qué es la «lluvia horizontal» en Canarias y por qué es vital para el ciclo del agua en Gran Canaria?',
      },
      options: [
        {
          id: 'lluvia-horizontal',
          label:
            'Las hojas atrapan las gotitas de la niebla de los alisios y las hacen gotear al suelo, recargando el acuífero.',
          isCorrect: true,
          feedback:
            '¡Brillante observación científica! Sin bosques en las medianías y cumbres se pierde esa lluvia horizontal que recarga los acuíferos subterráneos.',
        },
        {
          id: 'salada',
          label:
            'Los árboles convierten directamente el agua salada de la playa en nieve dulce.',
          isCorrect: false,
          feedback:
            'La desalación se hace en plantas tecnológicas; los árboles atrapan el agua dulce que ya viene en las gotitas de niebla.',
        },
        {
          id: 'bloquean',
          label:
            'Los árboles impiden que el agua entre en la tierra y la devuelven al espacio.',
          isCorrect: false,
          feedback:
            'Al contrario: las raíces frenan la erosión y ayudan a que el agua se filtre despacio hacia los acuíferos.',
        },
      ],
      conclusion:
        'Evidencia comprobada: cuidar el bosque y ahorrar agua (ODS 6) protegen juntos el ciclo natural del agua en Gran Canaria.',
      ceCodes: ['CE2', 'CE5', 'CE6'],
    },
  },
  {
    id: 'patrimonio',
    title: 'Patrimonio, Reserva de la Biosfera y territorio',
    shortLabel: 'Patrimonio',
    blockTag: 'Bloque C · Sociedades y territorios',
    ceTag: 'CE6 · CE7 · CE9',
    accentHex: '#8A5410',
    overview: {
      ciclo2:
        'Casi la mitad de Gran Canaria es Reserva de la Biosfera de la UNESCO. Además de paisajes naturales, cuidamos sitios históricos como la Cueva Pintada, Vegueta y el Castillo de la Luz.',
      ciclo3:
        'Gran Canaria combina Patrimonio Mundial (Risco Caído y las Montañas Sagradas), Reserva de la Biosfera (UNESCO, 2005) y conjuntos históricos que demuestran cómo naturaleza y cultura coevolucionan.',
    },
    altitudeStrip: [
      {
        elevation: 'Norte arqueológico',
        zone: 'Gáldar y Valerón',
        detail: 'Museo y Parque Arqueológico Cueva Pintada y Cenobio de Valerón.',
      },
      {
        elevation: 'Cumbre sagrada',
        zone: 'Risco Caído · UNESCO',
        detail: 'Paisaje Cultural Patrimonio Mundial y núcleo de la Reserva de la Biosfera.',
      },
      {
        elevation: 'Fachada atlántica',
        zone: 'Vegueta y Puerto',
        detail: 'Fundación de Las Palmas (1478), fortificaciones costeras y Puerto de La Luz.',
      },
    ],
    inquiry: {
      hypothesisPrompt: {
        ciclo2:
          'Indagación ciudadana: piensa qué significa vivir en una isla Reserva de la Biosfera.',
        ciclo3:
          'Indagación (CE6 · CE9): conecta la protección del patrimonio natural y cultural con la participación ciudadana.',
      },
      question: {
        ciclo2:
          '¿Qué podemos hacer en una excursión escolar por Gran Canaria para cuidar el patrimonio natural e histórico?',
        ciclo3:
          '¿Por qué la UNESCO protege paisajes culturales como Risco Caído y la Reserva de la Biosfera de Gran Canaria?',
      },
      options: [
        {
          id: 'respetar',
          label:
            'Respetar senderos, no arrancar flora ni tocar grabados, y valorar la convivencia sostenible entre personas y naturaleza.',
          isCorrect: true,
          feedback:
            '¡Excelente compromiso ecosocial! Proteger la biodiversidad y los yacimientos garantiza que futuras generaciones también puedan estudiarlos y disfrutarlos.',
        },
        {
          id: 'llevar-piedras',
          label:
            'Llevarse a casa trozos de cerámica o plantas endémicas como recuerdo.',
          isCorrect: false,
          feedback:
            'Cada pieza arqueológica o planta endémica fuera de su lugar pierde su valor científico y daña el ecosistema.',
        },
        {
          id: 'solo-turistas',
          label:
            'Dejar que solo los museos se preocupen, porque el alumnado no puede ayudar.',
          isCorrect: false,
          feedback:
            'La protección del patrimonio empieza por la ciudadanía activa desde la escuela (CE9).',
        },
      ],
      conclusion:
        'Evidencia comprobada: la ciudadanía escolar es clave para conservar la Reserva de la Biosfera y el patrimonio histórico de Gran Canaria.',
      ceCodes: ['CE6', 'CE7', 'CE9'],
    },
  },
];

export const NATURAL_ATLAS_LANDMARKS: NaturalAtlasLandmark[] = [
  // RELIEVE
  {
    id: 'roque-nublo',
    layer: 'relieve',
    name: 'Roque Nublo y Cumbre Central',
    zoneLabel: 'Centro · Tejeda',
    metricLabel: '1.813 m de altitud',
    roomId: 'aborigenes',
    cx: 146,
    cy: 132,
    summary: {
      ciclo2:
        'Es una gran roca volcánica de 80 metros de altura en el centro de la isla. Desde allí nacen muchos barrancos que bajan hasta el mar.',
      ciclo3:
        'Monolito volcánico (pitón de brecha volcánica) situado a 1.813 m en la Caldera de Tejeda, cerca del Morro de la Agujereada (1.956 m). Fue lugar sagrado aborigen.',
    },
    humanNatureLink:
      'Su forma preside el horizonte de Gran Canaria y ordena la red radial de barrancos.',
    curriculumTag: 'Bloque A · Relieve volcánico (CE5)',
  },
  {
    id: 'valeron-galdar',
    layer: 'relieve',
    name: 'Barrancos del Norte y Cenobio',
    zoneLabel: 'Norte · Gáldar y Guía',
    metricLabel: 'Toba volcánica excavada',
    roomId: 'aborigenes',
    cx: 112,
    cy: 74,
    summary: {
      ciclo2:
        'En las paredes de roca volcánica blanda del norte, los antiguos canarios excavaron cientos de cuevas para guardar el cereal.',
      ciclo3:
        'Las tobas volcánicas de los acantilados y barrancos del norte permitieron crear graneros fortificados como el Cenobio de Valerón (más de 350 silos).',
    },
    humanNatureLink:
      'Ejemplo clásico de adaptación humana sostenible al relieve volcánico insular.',
    curriculumTag: 'Bloque A + C · Relieve y poblamiento (CE5 · CE7)',
  },
  {
    id: 'la-isleta',
    layer: 'relieve',
    name: 'Península de La Isleta y Bahía',
    zoneLabel: 'Noreste · Las Palmas',
    metricLabel: 'Conos volcánicos y tómbolo',
    roomId: 'sigloXX',
    cx: 174,
    cy: 46,
    summary: {
      ciclo2:
        'Antes era un islote separado, pero la arena del mar formó un puente natural que lo unió a Gran Canaria y creó una bahía tranquila para los barcos.',
      ciclo3:
        'La Isleta se unió a la isla mediante un istmo de arena (tómbolo). Su bahía resguardada de los alisios permitió construir el gran Puerto de La Luz en el siglo XIX–XX.',
    },
    humanNatureLink:
      'La forma de la costa explica por qué allí nació uno de los mayores puertos del Atlántico.',
    curriculumTag: 'Bloque A + C · Relieve costero y economía (CE5 · CE6)',
  },

  // ECOSISTEMAS
  {
    id: 'selva-doramas',
    layer: 'ecosistemas',
    name: 'Selva de Doramas · Los Tilos de Moya',
    zoneLabel: 'Norte · Moya y Firgas',
    metricLabel: 'Monteverde / Laurisilva',
    roomId: 'conquista',
    cx: 138,
    cy: 78,
    summary: {
      ciclo2:
        'Antes de la conquista cubría gran parte del norte con bosques siempre verdes y húmedos. Hoy podemos visitar un trocito vivo en Los Tilos de Moya.',
      ciclo3:
        'Antiguo bosque de laurisilva que sufrió una intensa deforestación tras la conquista (siglos XV–XVI) por los ingenios azucareros y el reparto de tierras. Hoy es Reserva Natural Especial.',
    },
    humanNatureLink:
      'Conecta directamente la Sala 2 (Conquista) con la conservación actual de la biodiversidad.',
    curriculumTag: 'Bloque A + C · Impacto humano en ecosistemas (CE5 · CE6)',
  },
  {
    id: 'tamadaba',
    layer: 'ecosistemas',
    name: 'Pinar de Tamadaba',
    zoneLabel: 'Noroeste · Agaete y Artenara',
    metricLabel: 'Pinar canario · 1.444 m',
    roomId: 'aborigenes',
    cx: 88,
    cy: 112,
    summary: {
      ciclo2:
        'Un bosque de pinos canarios colgado sobre el océano. Sus hojas largas peinan las nubes para recoger agua.',
      ciclo3:
        'Uno de los pinares naturales mejor conservados de la isla. El pino canario posee una corteza gruesa resistente al fuego y ayuda a captar agua del mar de nubes.',
    },
    humanNatureLink:
      'Forma parte del núcleo de la Reserva de la Biosfera de Gran Canaria.',
    curriculumTag: 'Bloque A · Biodiversidad y endemismos (CE5)',
  },
  {
    id: 'dunas-maspalomas',
    layer: 'ecosistemas',
    name: 'Cardonal-tabaibal y Dunas del Sur',
    zoneLabel: 'Sur · Maspalomas',
    metricLabel: 'Clima árido costero',
    roomId: 'pirateria',
    cx: 152,
    cy: 214,
    summary: {
      ciclo2:
        'En el sur llueve muy poco y hace calor: crecen cardones, tabaibas y palmerales junto a dunas móviles y una charca donde descansan aves migratorias.',
      ciclo3:
        'Contrastando con el norte húmedo, el sur está a sotavento de los alisios: alberga ecosistemas áridos, la Reserva Natural Especial de las Dunas y humedales costeros clave para aves migratorias.',
    },
    humanNatureLink:
      'Demuestra por qué Gran Canaria se llama un «continente en miniatura» por sus microclimas.',
    curriculumTag: 'Bloque A · Microclimas y ecosistemas (CE5)',
  },

  // AGUA Y ALISIOS
  {
    id: 'alisios-norte',
    layer: 'agua',
    name: 'Vientos Alisios y Mar de Nubes',
    zoneLabel: 'Noreste · Vertiente Norte',
    metricLabel: '600 – 1.500 m (Barlovento)',
    roomId: 'pirateria',
    cx: 192,
    cy: 74,
    summary: {
      ciclo2:
        'Vientos suaves del noreste que empujaban los barcos antiguos hacia América y traen las nubes que refrescan y riegan el norte de la isla.',
      ciclo3:
        'Los alisios impulsaron las rutas atlánticas entre Europa, Canarias y América (Sala 3) y generan la «panza de burro» y la lluvia horizontal que alimenta los bosques y acuíferos del norte.',
    },
    humanNatureLink:
      'Un mismo fenómeno climático explica tanto la navegación histórica como el agua dulce insular.',
    curriculumTag: 'Bloque A + C · Clima, navegación y agua (CE2 · CE5)',
  },
  {
    id: 'guiniguada',
    layer: 'agua',
    name: 'Barranco de Guiniguada',
    zoneLabel: 'Este · Las Palmas',
    metricLabel: 'Cauce histórico y palmeral',
    roomId: 'conquista',
    cx: 204,
    cy: 112,
    summary: {
      ciclo2:
        'En 1478 se fundó el Real de Las Palmas junto a este barranco porque llevaba agua dulce y tenía un gran palmeral.',
      ciclo3:
        'Eje fluvial histórico que permitió el asentamiento del Real de Las Palmas (1478) y abasteció huertas y molinos mediante acequias. Hoy recuerda la importancia de renaturalizar los cauces.',
    },
    humanNatureLink:
      'El agua dulce siempre ha decidido dónde nacen las ciudades.',
    curriculumTag: 'Bloque A + C · Agua y asentamientos humanos (CE5 · CE7)',
  },
  {
    id: 'presas-cumbre',
    layer: 'agua',
    name: 'Presas de la Cumbre (Soria y Chira)',
    zoneLabel: 'Centro-Sur · Gran Canaria',
    metricLabel: 'Cultura hidráulica · ODS 6',
    roomId: 'sigloXX',
    cx: 128,
    cy: 170,
    summary: {
      ciclo2:
        'Grandes muros construidos en los barrancos durante el siglo XX para guardar el agua de la lluvia y llevarla a los cultivos y pueblos.',
      ciclo3:
        'Obras emblemáticas de la cultura hidráulica del siglo XX en Gran Canaria, junto a heredamientos de aguas, pozos, galerías y la actual desalación con energías renovables.',
    },
    humanNatureLink:
      'Conecta directamente con el Enigma del Agua de la Sala 4 y el ODS 6 (Agenda Canaria 2030).',
    curriculumTag: 'Bloque A + C · Ciclo del agua y sostenibilidad (CE6)',
  },

  // PATRIMONIO
  {
    id: 'risco-caido',
    layer: 'patrimonio',
    name: 'Risco Caído y Montañas Sagradas',
    zoneLabel: 'Cumbre · Artenara y Tejeda',
    metricLabel: 'Patrimonio Mundial UNESCO',
    roomId: 'aborigenes',
    cx: 116,
    cy: 126,
    summary: {
      ciclo2:
        'Cuevas sagradas donde los antiguos canarios observaban la luz del sol para saber cuándo sembrar y cosechar.',
      ciclo3:
        'Declarado Patrimonio Mundial por la UNESCO (2019). Sus almogarenes y marcadores solares muestran el profundo conocimiento astronómico y natural de la sociedad canarii.',
    },
    humanNatureLink:
      'Une ciencia (astronomía y ciclos estacionales), naturaleza y patrimonio aborigen.',
    curriculumTag: 'Bloque A + C · Ciencia ancestral y patrimonio (CE5 · CE7)',
  },
  {
    id: 'vegueta-batan',
    layer: 'patrimonio',
    name: 'Vegueta, San Cristóbal y El Batán',
    zoneLabel: 'Este · Las Palmas y Monte Lentiscal',
    metricLabel: 'Siglos XV – XVI (1478 · 1599)',
    roomId: 'pirateria',
    cx: 212,
    cy: 156,
    summary: {
      ciclo2:
        'Barrio antiguo donde nació la ciudad, torres que vigilaban el mar y el lugar del Monte Lentiscal donde se defendió la isla en 1599.',
      ciclo3:
        'Conjunto histórico de Vegueta, fortificaciones costeras (Castillo de la Luz, Torreón de San Cristóbal) y el escenario de la Batalla de El Batán contra la armada de Van der Does (1599).',
    },
    humanNatureLink:
      'Permite leer la historia de la Edad Moderna directamente sobre el mapa actual de la isla.',
    curriculumTag: 'Bloque C · Patrimonio histórico y memoria (CE7 · CE8)',
  },
  {
    id: 'puerto-luz',
    layer: 'patrimonio',
    name: 'Puerto de La Luz y Memoria Migrante',
    zoneLabel: 'Noreste · Las Palmas',
    metricLabel: 'Siglos XIX – XXI',
    roomId: 'sigloXX',
    cx: 186,
    cy: 58,
    summary: {
      ciclo2:
        'Desde este muelle partieron familias canarias hacia América en el siglo XX y hoy llegan barcos, cultura y personas de todo el mundo.',
      ciclo3:
        'Motor económico y puerta atlántica de Gran Canaria desde finales del siglo XIX. Testigo de la emigración a Cuba y Venezuela y de la actual sociedad intercultural canaria.',
    },
    humanNatureLink:
      'Conecta la memoria familiar del siglo XX con los derechos humanos y la acogida actual (CE8 · CE9).',
    curriculumTag: 'Bloque C · Migraciones y ciudadanía (CE7 · CE8 · CE9)',
  },
];

// --- INTERACTIVE TIMELINE DATA (CE7 · Bloque C: Sociedades en el tiempo) ---
export interface TimelineMilestone {
  id: string;
  order: number;
  dateLabel: string;
  centuryLabel: string;
  historicalAge: string;
  title: string;
  shortFact: Record<CycleId, string>;
  roomId: RoomId;
  ciclo3Only?: boolean;
}

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    id: 'tl-canarii',
    order: 1,
    dateLabel: 'Siglos III – XV',
    centuryLabel: 'Siglos III al XV',
    historicalAge: 'Época Aborigen (Prehispánica)',
    title: 'Poblamiento canarii, Cueva Pintada y Cenobio de Valerón',
    shortFact: {
      ciclo2:
        'Los antiguos canarios viven en guanartematos, cultivan cebada para gofio y excavan graneros en la roca volcánica.',
      ciclo3:
        'Sociedad amazigh insular organizada en los guanartematos de Agáldar y Telde; astronomía en Risco Caído y graneros comunitarios.',
    },
    roomId: 'aborigenes',
  },
  {
    id: 'tl-real',
    order: 2,
    dateLabel: '1478 – 1483',
    centuryLabel: 'Siglo XV (finales)',
    historicalAge: 'Tránsito Edad Media – Moderna',
    title: 'Fundación del Real de Las Palmas y Conquista de Gran Canaria',
    shortFact: {
      ciclo2:
        'Nace Las Palmas junto al barranco de Guiniguada y termina la conquista tras años de enfrentamientos y acuerdos.',
      ciclo3:
        'Campamento del Real de Las Palmas (1478), Pacto de Calatayud (1481–1482), rendición en Ansite (1483) e inicio de la sociedad mestiza.',
    },
    roomId: 'conquista',
  },
  {
    id: 'tl-ataques',
    order: 3,
    dateLabel: '1595 – 1599',
    centuryLabel: 'Siglo XVI',
    historicalAge: 'Edad Moderna',
    title: 'Defensa ante Francis Drake y Batalla de El Batán (Van der Does)',
    shortFact: {
      ciclo2:
        'Las torres y castillos vigilan la costa; en 1599 la población frena el ataque de la armada de Van der Does en El Batán.',
      ciclo3:
        'Gran Canaria resiste el ataque corsario de Drake (1595) y derrota a la armada neerlandesa de Van der Does en El Batán (1599).',
    },
    roomId: 'pirateria',
  },
  {
    id: 'tl-cochinilla',
    order: 4,
    dateLabel: 'Siglos XVIII – XIX',
    centuryLabel: 'Siglos XVIII y XIX',
    historicalAge: 'Edad Moderna y Contemporánea',
    title: 'Ciclo de la cochinilla y construcción del Puerto de La Luz',
    shortFact: {
      ciclo2:
        'La cochinilla de las tuneras tiñe telas de rojo y se empieza a construir el gran puerto en la bahía de La Isleta.',
      ciclo3:
        'Tras el azúcar y el vino, la exportación de cochinilla y la Ley de Puertos Francos (1852) impulsan el Puerto de La Luz (1883).',
    },
    roomId: 'pirateria',
    ciclo3Only: true,
  },
  {
    id: 'tl-emigracion',
    order: 5,
    dateLabel: 'Siglo XX',
    centuryLabel: 'Siglo XX',
    historicalAge: 'Edad Contemporánea',
    title: 'Emigración canaria a América y grandes presas de la cumbre',
    shortFact: {
      ciclo2:
        'Muchas familias canarias viajan en barco a Cuba y Venezuela; en la isla se levantan presas para guardar el agua.',
      ciclo3:
        'Ola migratoria hacia Cuba y Venezuela, desarrollo de la cultura hidráulica (heredamientos, presas de Soria y Chira) y auge turístico.',
    },
    roomId: 'sigloXX',
  },
  {
    id: 'tl-biosfera',
    order: 6,
    dateLabel: 'Siglo XXI (2005 – hoy)',
    centuryLabel: 'Siglo XXI',
    historicalAge: 'Edad Contemporánea (Presente)',
    title: 'Reserva de la Biosfera, Patrimonio Mundial y Agenda Canaria 2030',
    shortFact: {
      ciclo2:
        'Cuidamos nuestra isla Reserva de la Biosfera, ahorramos agua y acogemos a personas de todas las culturas.',
      ciclo3:
        'Reserva de la Biosfera (2005), Risco Caído Patrimonio Mundial (2019), energías renovables y retos de sostenibilidad 2030.',
    },
    roomId: 'sigloXX',
    ciclo3Only: true,
  },
];

export interface TimeUnitsChallenge {
  question: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export const TIME_UNITS_CHALLENGES: Record<CycleId, TimeUnitsChallenge> = {
  ciclo2: {
    question:
      'Si el Real de Las Palmas se fundó en 1478 (siglo XV) y el ataque de Van der Does fue en 1599 (siglo XVI), ¿cuántos años tiene 1 siglo?',
    options: [
      {
        id: '10',
        label: '10 años (eso es una década)',
        isCorrect: false,
        feedback:
          '10 años forman una década. Un siglo reúne diez décadas completas.',
      },
      {
        id: '100',
        label: '100 años',
        isCorrect: true,
        feedback:
          '¡Correcto! 1 siglo = 100 años (10 décadas = 1 siglo, y 10 siglos = 1 milenio).',
      },
      {
        id: '1000',
        label: '1.000 años (eso es un milenio)',
        isCorrect: false,
        feedback:
          '1.000 años forman un milenio. Prueba con la medida intermedia.',
      },
    ],
  },
  ciclo3: {
    question:
      '¿A qué siglo y a qué gran Edad de la Historia pertenece la Batalla de El Batán en Gran Canaria (año 1599)?',
    options: [
      {
        id: 'xv-media',
        label: 'Siglo XV · Edad Media',
        isCorrect: false,
        feedback:
          'El siglo XV abarca de 1401 a 1500. Recuerda sumar 1 a las centenas del año 1599.',
      },
      {
        id: 'xvi-moderna',
        label: 'Siglo XVI · Edad Moderna',
        isCorrect: true,
        feedback:
          '¡Exacto! El año 1599 corresponde al último año del siglo XVI (1501–1600), en plena Edad Moderna.',
      },
      {
        id: 'xvii-contemp',
        label: 'Siglo XVII · Edad Contemporánea',
        isCorrect: false,
        feedback:
          'El siglo XVII comenzó en 1601 y la Edad Contemporánea comienza a finales del siglo XVIII (1789).',
      },
    ],
  },
};
