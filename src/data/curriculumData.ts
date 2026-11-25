import {
  CompetencyEvaluationResult,
  CompetencyRubricRow,
  CycleId,
  ExpeditionState,
  LearningSituationPlan,
  ScientificPrecisionNote,
  SpecificCompetencyDefinition,
  TeacherRoomCurriculum,
} from '../types/game';
import { ROOMS_DATA } from './roomsData';

export const CURRICULUM_OVERVIEW = {
  normativa:
    'Decreto 211/2022, de 10 de noviembre (Currículo de Educación Primaria de la Comunidad Autónoma de Canarias · LOMLOE y RD 157/2022)',
  mencion:
    'Área de Conocimiento del Medio Natural, Social y Cultural · EMOCREA y Valores Cívicos',
  areas: [
    {
      name: 'Conocimiento del Medio Natural, Social y Cultural',
      focus:
        'Bloque A (relieve volcánico, ecosistemas endémicos, alisios y ciclo del agua), Bloque B (verificación crítica de información) y Bloque C (etapas históricas, fuentes y patrimonio de Gran Canaria).',
    },
    {
      name: 'Educación Emocional y para la Creatividad (EMOCREA)',
      focus:
        'Materia autonómica de Canarias: alfabetización emocional, empatía histórica, regulación del miedo y gestión pacífica y creativa de conflictos.',
    },
    {
      name: 'Educación en Valores Cívicos y Éticos y Agenda Canaria 2030',
      focus:
        'Pensamiento crítico ante prejuicios y bulos, igualdad y coeducación (ODS 5), cultura de paz (ODS 16), sostenibilidad hídrica (ODS 6) y participación ciudadana.',
    },
  ],
};

export const SPECIFIC_COMPETENCIES_CMN: SpecificCompetencyDefinition[] = [
  {
    id: 'CE2',
    shortTitle: 'Indagación científica e histórica',
    officialFocus:
      'Plantear y dar respuesta a cuestiones científicas sencillas mediante la observación, formulación de hipótesis, recogida de evidencias y extracción de conclusiones.',
    descriptors: 'CCL1 · CCL2 · CCL3 · STEM2 · STEM4 · CD1 · CD2 · CPSAA4',
    blocks: 'Bloque A · Bloque B',
  },
  {
    id: 'CE5',
    shortTitle: 'Medio natural, relieve y ecosistemas insulares',
    officialFocus:
      'Identificar las características de los diferentes elementos o sistemas del medio natural, social y cultural de Canarias, analizando su organización, relieve, clima y biodiversidad.',
    descriptors: 'STEM1 · STEM2 · STEM4 · STEM5 · CD1 · CC4 · CE1 · CCEC1',
    blocks: 'Bloque A · Bloque C',
  },
  {
    id: 'CE6',
    shortTitle: 'Acción humana, ecosostenibilidad y Agenda 2030',
    officialFocus:
      'Identificar las causas y consecuencias de la intervención humana en el entorno (deforestación, agua, territorio) para promover estilos de vida ecosocialmente responsables.',
    descriptors: 'CCL5 · STEM2 · STEM5 · CPSAA4 · CC1 · CC3 · CC4 · CE1',
    blocks: 'Bloque A · Bloque C',
  },
  {
    id: 'CE7',
    shortTitle: 'Tiempo histórico, cronología y fuentes',
    officialFocus:
      'Observar, comprender e interpretar continuidades y cambios del medio social y cultural de Gran Canaria analizando fuentes materiales y documentales y situando hechos en el tiempo.',
    descriptors: 'CCL3 · STEM4 · CPSAA4 · CC1 · CC3 · CE2 · CCEC1',
    blocks: 'Bloque C',
  },
  {
    id: 'CE8',
    shortTitle: 'Diversidad cultural, igualdad y empatía',
    officialFocus:
      'Reconocer y valorar la diversidad y la igualdad de género, mostrando empatía y respeto por otras culturas y analizando críticamente sesgos y prejuicios.',
    descriptors: 'CP3 · CPSAA3 · CC1 · CC2 · CC3 · CCEC1',
    blocks: 'Bloque C · EMOCREA',
  },
  {
    id: 'CE9',
    shortTitle: 'Participación ciudadana y convivencia democrática',
    officialFocus:
      'Participar de forma eficaz y constructiva en la vida escolar y comunitaria asumiendo acuerdos, verificando información frente a bulos y comprometiéndose con el bien común.',
    descriptors: 'CCL5 · CPSAA1 · CC1 · CC2 · CC3 · CCEC1',
    blocks: 'Bloque B · Bloque C',
  },
];

export const LEARNING_SITUATION_SA: LearningSituationPlan = {
  title: 'Ecos de Tamarán: Guardianes del Medio Natural e Histórico de Gran Canaria',
  code: 'SA-CMN-GC · 2.º y 3.º Ciclo de Educación Primaria',
  justification:
    'El alumnado de Gran Canaria necesita comprender cómo el relieve volcánico, el clima de los alisios y la acción humana han moldeado la historia, los ecosistemas y la identidad multicultural de la isla. A través de una expedición interactiva sin presión temporal, se integran los Bloques A, B y C de Conocimiento del Medio junto con EMOCREA y la Agenda Canaria 2030.',
  finalProduct:
    'Cuaderno de Campo y Diario Competencial de Gran Canaria (PDF exportable) con reflexiones empáticas, Muro de Pega-notas, verificación de las 4 capas del Atlas del Medio Natural, Línea del Tiempo ordenada y compromiso grupal en asamblea.',
  cycleScope:
    'Doble itinerario multinivel integrado: 2.º Ciclo (3.º–4.º EP) y 3.º Ciclo (5.º–6.º EP).',
  duration: '6 sesiones de 45–50 minutos (2 semanas lectivas).',
  groupings: [
    'Parejas cooperativas frente al dispositivo (con rotación de los 4 roles: Lectura, Observación, Empatía y Vocería).',
    'Pequeño grupo (4 integrantes) para contrastar las capas del Atlas del Medio Natural y la Línea del Tiempo.',
    'Gran grupo (Asamblea de 5–10 minutos al cierre de cada sala para transferencia emocional y ecosocial).',
  ],
  duaMeasures: [
    'Múltiples formas de representación: narración oral TTS regulable (0,8×–1,15×), modo pictogramas, fuente adaptada para dislexia, alto contraste y Glosario Unificado (A–Z + Visual).',
    'Múltiples formas de acción y expresión: pistas graduadas según ciclo (3 en 2.º Ciclo, 2 en 3.º Ciclo), inicios de frase guiados, controles accesibles por teclado y cronómetro de Escape Room opcional no sancionador.',
    'Múltiples formas de implicación: elección de 4 avatares con poderes pedagógicos diferenciados, termómetro emocional (EMOCREA) y retos opcionales de ampliación.',
  ],
  assessmentInstruments: [
    'Rúbrica competencial de 4 niveles (Iniciado, En proceso, Adquirido, Avanzado) vinculada a CE2–CE9.',
    'Diario de Reflexión y Seguimiento Competencial en PDF (evidencias escritas + autonomía en pistas + evaluación orientativa por CE).',
    'Bitácora de Misiones LOMLOE (registro sistemático de los 28 retos de sala + Atlas Natural + Línea del Tiempo).',
    'Observación directa en las asambleas cooperativas de cierre de cada sesión.',
  ],
  sessions: [
    {
      number: 1,
      title: 'Activación, Sala 1 (Canarii) y Relieve volcánico',
      duration: '50 min',
      blocks: 'Bloque A + C',
      ces: ['CE2', 'CE5', 'CE7', 'CE8'],
      activity:
        'Elección de personaje, exploración de la Cueva de los Canarii (pintaderas, gofio, dilema del granero) e indagación de la capa «Relieve volcánico» en el Atlas.',
    },
    {
      number: 2,
      title: 'Sala 2 (Conquista), fuentes críticas y Selva de Doramas',
      duration: '50 min',
      blocks: 'Bloque A + C',
      ces: ['CE5', 'CE6', 'CE7', 'CE8'],
      activity:
        'Archivo del Real de Las Palmas (cronología, hechos vs. prejuicios, empatía intercultural) e indagación del impacto humano en la Selva de Doramas en el Atlas.',
    },
    {
      number: 3,
      title: 'Sala 3 (Atlántico), vientos alisios y verificación ante bulos',
      duration: '50 min',
      blocks: 'Bloque A + B + C',
      ces: ['CE2', 'CE5', 'CE7', 'CE9'],
      activity:
        'Atalaya de San Cristóbal (orientación cardinal, ciclos económicos, 1595–1599 y Misión 2030 contra rumores) + capa «Alisios y Agua» del Atlas.',
    },
    {
      number: 4,
      title: 'Sala 4 (Siglo XX), cultura hidráulica y acogida',
      duration: '50 min',
      blocks: 'Bloque A + C',
      ces: ['CE6', 'CE7', 'CE8', 'CE9'],
      activity:
        'Muelle de La Luz (emigración canaria, anacronismos, recorrido del agua insular y dilema de acogida) + capa «Patrimonio y Reserva de la Biosfera».',
    },
    {
      number: 5,
      title: 'Síntesis cronológica: Línea del Tiempo y Cápsulas',
      duration: '45 min',
      blocks: 'Bloque C',
      ces: ['CE7', 'CE9'],
      activity:
        'Reto interactivo de la Línea del Tiempo (ordenación de etapas y unidades de tiempo: década/siglo) e inspección guiada de las 4 Cápsulas del Tiempo.',
    },
    {
      number: 6,
      title: 'Producto final, exportación PDF y Asamblea ecosocial',
      duration: '45 min',
      blocks: 'Bloque A + B + C',
      ces: ['CE6', 'CE8', 'CE9'],
      activity:
        'Revisión del Diario y Muro de Pega-notas, exportación del informe competencial en PDF y pacto de aula sobre cuidado del agua y convivencia.',
    },
  ],
};

export const TEACHER_CURRICULUM_BY_ROOM: TeacherRoomCurriculum[] = [
  {
    roomId: 'aborigenes',
    roomTitle: 'Sala 1 · La Cueva de los Canarii',
    epoch: 'Época Aborigen · Siglos III – XV (Gáldar y Cenobio de Valerón)',
    competenciasEspecificas: ['CE2', 'CE5', 'CE7', 'CE8'],
    competenciasClave: [
      'CC (Ciudadana)',
      'CCEC (Conciencia y Expresión Cultural)',
      'STEM (Ciencia y Tecnología)',
      'CPSAA',
    ],
    saberesBloqueA: {
      ciclo2: [
        'Bloque A · Relieve volcánico cercano: barrancos, montañas (Roque Nublo) y cuevas excavadas en roca volcánica blanda.',
        'Bloque A · Relación entre plantas cultivadas (cebada), suelo insular y adaptación respetuosa al entorno.',
      ],
      ciclo3: [
        'Bloque A · Geología volcánica de Gran Canaria (toba volcánica, calderas y barrancos radiales) y su influencia en el poblamiento prehispánico.',
        'Bloque A · Pisos de vegetación autóctona (cardonal-tabaibal, pinar de Tamadaba) y aprovechamiento sostenible de los recursos insulares.',
      ],
    },
    saberesBloqueB: {
      ciclo2: [
        'Bloque B · Exploración guiada de herramientas cotidianas antiguas (molinos de mano, vasijas de barro) y uso seguro del entorno digital.',
      ],
      ciclo3: [
        'Bloque B · Tecnología material prehispánica para conservar alimentos (silos excavados y sellado) frente a técnicas actuales.',
      ],
    },
    saberesConocimientoMedio: {
      ciclo2: [
        'Bloque C · Patrimonio cercano: primeros pobladores de Gran Canaria, alimentación (gofio) y manifestaciones artísticas (pintaderas).',
        'Bloque C · Identificación de huellas arqueológicas del pasado como bienes que debemos proteger entre todos.',
      ],
      ciclo3: [
        'Bloque C · Las sociedades prehispánicas de Canarias: organización en guanartematos (Agáldar y Telde), graneros colectivos (Cenobio de Valerón) y legado toponímico.',
        'Bloque C · Valoración y conservación del patrimonio arqueológico (Cueva Pintada, Risco Caído) como fuente histórica primaria.',
      ],
    },
    saberesEmocreaValores: {
      ciclo2: [
        'EMOCREA: Identificación de emociones básicas (preocupación, miedo) en situaciones de escasez o conflicto.',
        'ODS 5 · Cooperación, coeducación y reparto justo de recursos compartidos en el aula y la familia.',
      ],
      ciclo3: [
        'EMOCREA: Escucha activa de necesidades contrapuestas y búsqueda creativa de acuerdos ganar-ganar.',
        'Valores Cívicos: Bien común, corresponsabilidad, visibilidad de las mujeres (Arminda) y sostenibilidad de los recursos limitados.',
      ],
    },
    criteriosCodificados: {
      ciclo2: [
        {
          code: 'CMN.2.5.1',
          ce: 'CE5',
          text: 'Identificar características del relieve volcánico y elementos del patrimonio aborigen de Gran Canaria valorando su cuidado.',
        },
        {
          code: 'CMN.2.7.1',
          ce: 'CE7',
          text: 'Reconocer objetos y fuentes materiales de la época aborigen relacionándolos con la vida cotidiana en la isla.',
        },
        {
          code: 'CMN.2.8.1',
          ce: 'CE8',
          text: 'Mostrar empatía y proponer repartos justos e igualitarios ante situaciones de escasez grupal.',
        },
      ],
      ciclo3: [
        {
          code: 'CMN.3.2.2',
          ce: 'CE2',
          text: 'Formular hipótesis y extraer conclusiones sobre la adaptación arquitectónica canarii a la toba volcánica.',
        },
        {
          code: 'CMN.3.7.1',
          ce: 'CE7',
          text: 'Analizar fuentes arqueológicas del pasado prehispánico para explicar la organización social y económica de los guanartematos.',
        },
        {
          code: 'CMN.3.8.2',
          ce: 'CE8',
          text: 'Valorar la igualdad de género y argumentar acuerdos cooperativos equilibrando necesidades presentes y sostenibilidad futura.',
        },
      ],
    },
    criteriosEvaluacion: {
      ciclo2: [
        'Identificar elementos significativos del relieve volcánico y patrimonio aborigen de Gran Canaria valorando su cuidado.',
        'Reconocer emociones propias y ajenas proponiendo acuerdos respetuosos ante un problema grupal.',
      ],
      ciclo3: [
        'Analizar fuentes materiales del pasado prehispánico para explicar la organización social y económica de los canarii.',
        'Argumentar decisiones cooperativas equilibrando las necesidades presentes y la sostenibilidad futura.',
      ],
    },
    preguntasAsamblea: [
      '¿Qué palabras, alimentos o costumbres de los antiguos canarios seguimos usando hoy en Gran Canaria?',
      'Cuando en clase falta un material que necesitamos todos, ¿cómo podemos repartirlo con justicia sin dejar a nadie fuera?',
    ],
  },
  {
    roomId: 'conquista',
    roomTitle: 'Sala 2 · El Archivo del Real de Las Palmas',
    epoch: 'Conquista y Encuentro de Culturas (1478–1483)',
    competenciasEspecificas: ['CE5', 'CE6', 'CE7', 'CE8'],
    competenciasClave: ['CCL (Comunicación Lingüística)', 'CC (Ciudadana)', 'CPSAA', 'CCEC'],
    saberesBloqueA: {
      ciclo2: [
        'Bloque A · El barranco de Guiniguada y el agua dulce como clave para que nazca una ciudad.',
        'Bloque A · Los bosques húmedos del norte (Selva de Doramas) y la necesidad de cuidar los árboles.',
      ],
      ciclo3: [
        'Bloque A · Impacto humano en los ecosistemas insulares: la deforestación de la Selva de Doramas por los ingenios azucareros tras la conquista.',
        'Bloque A · Conservación actual del monteverde canario (Los Tilos de Moya) y recuperación de cauces de barrancos.',
      ],
    },
    saberesBloqueB: {
      ciclo2: [
        'Bloque B · Diferenciación entre datos comprobables y opiniones injustas en textos o mensajes.',
      ],
      ciclo3: [
        'Bloque B · Análisis crítico de fuentes documentales y digitales: detección de sesgos, etnocentrismo y visiones parciales.',
      ],
    },
    saberesConocimientoMedio: {
      ciclo2: [
        'Bloque C · Iniciación al tiempo histórico: secuenciación de hechos clave en el nacimiento de Las Palmas junto al barranco de Guiniguada.',
        'Bloque C · Reconocimiento de huellas del pasado y convivencia de distintas tradiciones culturales.',
      ],
      ciclo3: [
        'Bloque C · La conquista y colonización de Gran Canaria (1478–1483): cronología, Pacto de Calatayud (1481–1482), resistencia y formación de la sociedad mestiza.',
        'Bloque C · Contraste de fuentes históricas primarias y valoración del mestizaje cultural canario.',
      ],
    },
    saberesEmocreaValores: {
      ciclo2: [
        'EMOCREA: Toma de perspectiva ante dos versiones distintas de un mismo conflicto.',
        'ODS 16 · Respeto hacia la lengua, las costumbres y la identidad cultural de todas las personas.',
      ],
      ciclo3: [
        'EMOCREA: Empatía cognitiva y afectiva en contextos de choque cultural y mediación pacífica.',
        'Valores Cívicos: Pensamiento crítico frente a prejuicios, etnocentrismo y visiones unilaterales.',
      ],
    },
    criteriosCodificados: {
      ciclo2: [
        {
          code: 'CMN.2.6.1',
          ce: 'CE6',
          text: 'Reconocer cómo la acción humana transforma paisajes naturales como bosques y barrancos.',
        },
        {
          code: 'CMN.2.7.2',
          ce: 'CE7',
          text: 'Ordenar cronológicamente hechos sencillos de la historia local de Gran Canaria.',
        },
        {
          code: 'CMN.2.8.2',
          ce: 'CE8',
          text: 'Distinguir afirmaciones respetuosas basadas en hechos de opiniones injustas o prejuicios.',
        },
      ],
      ciclo3: [
        {
          code: 'CMN.3.6.1',
          ce: 'CE6',
          text: 'Analizar causas y consecuencias ecosociales de la tala de la Selva de Doramas tras la introducción del cultivo de la caña de azúcar.',
        },
        {
          code: 'CMN.3.7.2',
          ce: 'CE7',
          text: 'Contrastar distintas fuentes históricas reconociendo sesgos y múltiples perspectivas en el estudio de la conquista.',
        },
        {
          code: 'CMN.3.8.1',
          ce: 'CE8',
          text: 'Valorar la mediación y el respeto a la diversidad cultural como pilares de la convivencia democrática.',
        },
      ],
    },
    criteriosEvaluacion: {
      ciclo2: [
        'Ordenar cronológicamente hechos sencillos de la historia local de Gran Canaria.',
        'Distinguir afirmaciones respetuosas basadas en hechos de opiniones injustas o prejuicios.',
      ],
      ciclo3: [
        'Contrastar distintas fuentes históricas reconociendo sesgos y múltiples perspectivas en el estudio de la conquista.',
        'Explicar las consecuencias ambientales de la deforestación histórica y defender la mediación pacífica.',
      ],
    },
    preguntasAsamblea: [
      '¿Alguna vez te han juzgado sin escuchar tu versión? ¿Cómo te sentiste?',
      '¿Por qué es importante conocer tanto las huellas históricas como el impacto en los bosques cuando estudiamos el pasado?',
    ],
  },
  {
    roomId: 'pirateria',
    roomTitle: 'Sala 3 · La Atalaya de San Cristóbal',
    epoch: 'Piratería y Puente Atlántico (Siglos XVI–XIX)',
    competenciasEspecificas: ['CE2', 'CE5', 'CE7', 'CE9'],
    competenciasClave: ['STEM (Orientación y ciencia)', 'CD (Digital)', 'CC', 'CPSAA'],
    saberesBloqueA: {
      ciclo2: [
        'Bloque A · Orientación en el espacio con puntos cardinales (N, S, E, O) y reconocimiento del relieve costero (bahías, playas, riscos).',
        'Bloque A · Los vientos alisios del noreste y el clima suave de Gran Canaria.',
      ],
      ciclo3: [
        'Bloque A · Circulación de los vientos alisios y corriente fría de Canarias: influencia en el clima insular (barlovento/sotavento) y en la navegación a vela.',
        'Bloque A · Ecosistemas costeros y áridos del sur (Dunas de Maspalomas) frente al norte húmedo.',
      ],
    },
    saberesBloqueB: {
      ciclo2: [
        'Bloque B · Comprobación de noticias o rumores antes de compartirlos y evolución de señales de comunicación (hogueras frente a medios actuales).',
      ],
      ciclo3: [
        'Bloque B · Alfabetización mediática y verificación de fuentes digitales frente a bulos y desinformación; evolución de instrumentos náuticos (astrolabio, ballestilla y sextante).',
      ],
    },
    saberesConocimientoMedio: {
      ciclo2: [
        'Bloque C · Patrimonio arquitectónico defensivo de Gran Canaria (Castillo de la Luz, San Cristóbal) y orientación básica en el mapa.',
        'Bloque C · Productos tradicionales de la historia isleña: caña de azúcar y cochinilla.',
      ],
      ciclo3: [
        'Bloque C · Canarias en la Edad Moderna y s. XIX: ataques de Drake (1595) y armada de Van der Does / Batalla de El Batán (1599), fortificaciones costeras y ciclos económicos (azúcar, vino, cochinilla).',
        'Bloque C · El archipiélago como puente tricontinental entre Europa, África y América.',
      ],
    },
    saberesEmocreaValores: {
      ciclo2: [
        'EMOCREA: Reconocimiento del miedo y estrategias corporales de calma ante situaciones de alarma.',
        'Solidaridad vecinal y ayuda a las personas más vulnerables.',
      ],
      ciclo3: [
        'EMOCREA: Regulación emocional frente al pánico colectivo y comunicación asertiva en crisis.',
        'Valores Cívicos: Pensamiento crítico frente a bulos, rumores y desinformación (del s. XVI a las redes actuales).',
      ],
    },
    criteriosCodificados: {
      ciclo2: [
        {
          code: 'CMN.2.5.2',
          ce: 'CE5',
          text: 'Utilizar los puntos cardinales y reconocer elementos del paisaje costero y los vientos alisios en Gran Canaria.',
        },
        {
          code: 'CMN.2.7.1',
          ce: 'CE7',
          text: 'Relacionar el patrimonio defensivo costero y los cultivos históricos con la vida en épocas pasadas.',
        },
        {
          code: 'CMN.2.9.1',
          ce: 'CE9',
          text: 'Comprobar la veracidad de rumores y actuar con calma y solidaridad en comunidad.',
        },
      ],
      ciclo3: [
        {
          code: 'CMN.3.5.1',
          ce: 'CE5',
          text: 'Explicar la relación entre los vientos alisios, el relieve costero y la posición geoestratégica de Gran Canaria en el Atlántico.',
        },
        {
          code: 'CMN.3.7.1',
          ce: 'CE7',
          text: 'Situar en la Edad Moderna los ataques de 1595–1599 y explicar los ciclos económicos atlánticos del archipiélago.',
        },
        {
          code: 'CMN.3.9.2',
          ce: 'CE9',
          text: 'Aplicar criterios de verificación crítica para distinguir información fiable de bulos que generan alarma social.',
        },
      ],
    },
    criteriosEvaluacion: {
      ciclo2: [
        'Relacionar elementos del patrimonio costero, los puntos cardinales y los cultivos tradicionales con la vida pasada en Gran Canaria.',
        'Identificar estrategias saludables para calmar el miedo y actuar con cooperación.',
      ],
      ciclo3: [
        'Explicar el papel estratégico, climático y comercial de Gran Canaria en el Atlántico y su huella cultural actual.',
        'Aplicar criterios de verificación crítica para distinguir información fiable de rumores que generan alarma.',
      ],
    },
    preguntasAsamblea: [
      '¿Qué podemos hacer en clase cuando circula un rumor sobre un compañero o una noticia alarmante?',
      '¿Cómo influyen hoy los vientos alisios y el mar en nuestra vida diaria en Gran Canaria?',
    ],
  },
  {
    roomId: 'sigloXX',
    roomTitle: 'Sala 4 · El Muelle de La Luz y la Memoria Viva',
    epoch: 'Siglo XX y Gran Canaria Contemporánea',
    competenciasEspecificas: ['CE2', 'CE6', 'CE7', 'CE8', 'CE9'],
    competenciasClave: ['CC (Ciudadana)', 'STEM', 'CPSAA', 'CCEC'],
    saberesBloqueA: {
      ciclo2: [
        'Bloque A · El ciclo del agua en Gran Canaria: nubes, lluvia, presas y uso responsable en casa y en el colegio.',
        'Bloque A · Gran Canaria como Reserva de la Biosfera que protege sus paisajes y animales.',
      ],
      ciclo3: [
        'Bloque A · Ciclo hidrológico insular: lluvia horizontal (mar de nubes), infiltración en acuíferos volcánicos, presas, galerías y desalación.',
        'Bloque A · Cambio climático, energías renovables y espacios protegidos (Reserva de la Biosfera de Gran Canaria).',
      ],
    },
    saberesBloqueB: {
      ciclo2: [
        'Bloque B · Cambios en los transportes, objetos cotidianos y tecnología entre la época de los abuelos y el siglo XXI.',
      ],
      ciclo3: [
        'Bloque B · Innovación tecnológica para la sostenibilidad hídrica (desalación, depuración) y detección de anacronismos tecnológicos.',
      ],
    },
    saberesConocimientoMedio: {
      ciclo2: [
        'Bloque C · Cambios en los modos de vida y el paisaje del agua (presas y acequias) entre el siglo XX y hoy.',
        'Bloque C · Conocimiento de la emigración canaria a través de objetos familiares y testimonios.',
      ],
      ciclo3: [
        'Bloque C · Transformaciones del siglo XX en Gran Canaria: Puerto de La Luz, emigración canaria a América (Cuba/Venezuela) y cultura hidráulica (heredamientos, presas).',
        'Bloque C · Comprensión de la sociedad canaria contemporánea desde los procesos migratorios, los derechos humanos y la diversidad.',
      ],
    },
    saberesEmocreaValores: {
      ciclo2: [
        'EMOCREA: Empatía hacia quienes cambian de colegio, barrio o país y gestos cotidianos de acogida.',
        'ODS 6 y 11 · Cuidado responsable del agua como bien común de la isla.',
      ],
      ciclo3: [
        'EMOCREA: Conexión emocional entre la memoria familiar migrante y la acogida intercultural presente.',
        'Valores Cívicos: Derechos humanos, lucha contra estereotipos y compromiso con la Agenda Canaria 2030.',
      ],
    },
    criteriosCodificados: {
      ciclo2: [
        {
          code: 'CMN.2.6.2',
          ce: 'CE6',
          text: 'Proponer hábitos sencillos de ahorro de agua y cuidado del entorno en la escuela y el hogar (ODS 6).',
        },
        {
          code: 'CMN.2.7.2',
          ce: 'CE7',
          text: 'Diferenciar objetos y modos de vida del siglo XX respecto a la actualidad valorando la memoria familiar.',
        },
        {
          code: 'CMN.2.9.2',
          ce: 'CE9',
          text: 'Participar en acuerdos de aula para acoger con respeto a cualquier persona nueva.',
        },
      ],
      ciclo3: [
        {
          code: 'CMN.3.6.2',
          ce: 'CE6',
          text: 'Explicar el ciclo integral del agua insular (lluvia horizontal, presas, desalación) y defender medidas de sostenibilidad (Agenda Canaria 2030).',
        },
        {
          code: 'CMN.3.7.2',
          ce: 'CE7',
          text: 'Explicar la emigración canaria y el desarrollo del Puerto de La Luz como claves de la Gran Canaria contemporánea.',
        },
        {
          code: 'CMN.3.8.2',
          ce: 'CE8',
          text: 'Mostrar actitud crítica frente a estereotipos migratorios vinculando memoria histórica familiar y derechos humanos.',
        },
      ],
    },
    criteriosEvaluacion: {
      ciclo2: [
        'Diferenciar objetos y modos de vida del siglo XX respecto a la actualidad valorando la memoria familiar.',
        'Proponer acciones concretas de acogida y cuidado del agua en su entorno escolar.',
      ],
      ciclo3: [
        'Explicar los procesos migratorios y la gestión sostenible del agua como claves de la Gran Canaria actual.',
        'Mostrar actitud crítica frente a estereotipos migratorios vinculando memoria histórica y derechos humanos.',
      ],
    },
    preguntasAsamblea: [
      '¿Hay en tu familia alguna historia de abuelos o familiares que emigraron o llegaron de otro lugar?',
      '¿Qué acciones concretas podemos acordar como grupo para cuidar el agua y acoger bien a quien llega nuevo?',
    ],
  },
];

export const SCIENTIFIC_PRECISION_NOTES: ScientificPrecisionNote[] = [
  {
    id: 'tamaran-canarii',
    topic: '«Tamarán» y «canarii»',
    roomRef: 'Sala 1 · Época Aborigen',
    clarification:
      '«Tamarán» se emplea como recurso literario y divulgativo tradicional; la filología actual señala que probablemente designaba un palmeral o lugar concreto y no a toda la isla. Igualmente, «canarii» procede de fuentes latinas (Plinio) y convive en la historiografía actual con «antiguos canarios» o población amazigh de Gran Canaria.',
  },
  {
    id: 'cronologia-pintaderas',
    topic: 'Datación aborigen, pintaderas e Ídolo de Chil (Tara)',
    roomRef: 'Sala 1 · Época Aborigen',
    clarification:
      'Las dataciones radiocarbónicas recientes sitúan el poblamiento consolidado de Gran Canaria entre los siglos III y XV. Sobre las pintaderas, el sellado de silos es la hipótesis más difundida, pero la arqueología mantiene abiertas también hipótesis decorativas o identitarias. La célebre figurilla conocida como «Ídolo de Tara» se denomina actualmente «Ídolo de Chil» en la literatura museográfica.',
  },
  {
    id: 'calatayud',
    topic: 'Pacto de Calatayud (hacia 1481–1482)',
    roomRef: 'Sala 2 · Conquista y Encuentro',
    clarification:
      'La cronología exacta (1481–1482) y el alcance documental del pacto atribuido a Tenesor Semidán son objeto de debate historiográfico; en Primaria se trabaja como ejemplo de diplomacia y negociación dentro de un proceso complejo de conquista y mestizaje.',
  },
  {
    id: 'vanderdoes-sextante',
    topic: 'Armada de Pieter van der Does (1599) y sextante náutico',
    roomRef: 'Sala 3 · Siglos XVI–XIX',
    clarification:
      'A diferencia del corsario Francis Drake (1595), Pieter van der Does mandaba una armada oficial de las Provincias Unidas que logró bombardear el Castillo de la Luz, tomar e incendiar Las Palmas antes de ser derrotada en la Batalla de El Batán (Monte Lentiscal). Por su parte, el sextante del Juego de Sombras representa la navegación de los siglos XVIII–XIX; en 1599 se utilizaban el astrolabio náutico y la ballestilla.',
  },
  {
    id: 'silbo',
    topic: 'Lenguaje silbado en Canarias',
    roomRef: 'Glosario · Patrimonio',
    clarification:
      'El bien declarado Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO es el Silbo Gomero. En Gran Canaria existió históricamente lenguaje silbado y hoy existen proyectos educativos de recuperación que complementan el patrimonio común del archipiélago.',
  },
  {
    id: 'lluvia-horizontal-biosfera',
    topic: 'Lluvia horizontal, Morro de la Agujereada y Reserva de la Biosfera',
    roomRef: 'Atlas · Bloque A (Medio Natural)',
    clarification:
      'El punto más alto de Gran Canaria es el Morro de la Agujereada (1.956 m), ligeramente superior al Pico de las Nieves (1.949 m). La lluvia horizontal ocurre por condensación de la niebla de los alisios sobre la vegetación de medianías (monteverde y pinar) y complementa la recarga de los acuíferos volcánicos.',
  },
];

export const LOMLOE_COMPETENCY_RUBRIC: CompetencyRubricRow[] = [
  {
    id: 'rub-medio-natural',
    dimension: 'Medio natural, relieve, clima y ecosistemas (Bloque A)',
    competencies: 'CE2 · CE5 · STEM',
    iniciado:
      'Identifica elementos aislados del paisaje de Gran Canaria con apoyo constante.',
    enProceso:
      'Reconoce el origen volcánico, los vientos alisios y algunos ecosistemas canarios apoyándose en el Atlas.',
    adquirido:
      'Explica con claridad cómo el relieve volcánico, los alisios y la lluvia horizontal condicionan los ecosistemas y la vida humana en la isla.',
    avanzado:
      'Formula hipótesis rigurosas en el Atlas Natural conectando geología, biodiversidad endémica y conservación de la Reserva de la Biosfera.',
  },
  {
    id: 'rub-patrimonio',
    dimension: 'Tiempo histórico, cronología y fuentes de Gran Canaria (Bloque C)',
    competencies: 'CE7 · CCEC · CC',
    iniciado:
      'Reconoce elementos aislados del pasado isleño con ayuda constante de pistas o del docente.',
    enProceso:
      'Identifica etapas y objetos históricos principales (pintaderas, Real de Las Palmas, fortificaciones, Puerto de La Luz) usando pistas parciales.',
    adquirido:
      'Ordena hechos cronológicamente en la Línea del Tiempo, usa correctamente décadas/siglos y explica el valor de las fuentes materiales.',
    avanzado:
      'Relaciona causas y consecuencias entre las cuatro etapas y conecta el patrimonio histórico con la identidad actual de Gran Canaria.',
  },
  {
    id: 'rub-critico',
    dimension: 'Pensamiento crítico ante sesgos, bulos y anacronismos (Bloque B y C)',
    competencies: 'CE2 · CE8 · CE9 · CCL · CD',
    iniciado:
      'Confunde con frecuencia hechos verificables, prejuicios o elementos anacrónicos.',
    enProceso:
      'Detecta prejuicios y anacronismos sencillos cuando recibe orientaciones o pistas visuales.',
    adquirido:
      'Distingue con autonomía datos comprobables de opiniones sesgadas, rumores sin fuente y anacronismos históricos.',
    avanzado:
      'Argumenta por qué es necesario contrastar múltiples fuentes tanto en el estudio del pasado como ante noticias digitales actuales.',
  },
  {
    id: 'rub-emocrea',
    dimension: 'Alfabetización emocional y empatía histórica (EMOCREA)',
    competencies: 'CE8 · CPSAA · CC',
    iniciado:
      'Nombra emociones básicas de forma genérica sin vincularlas a la situación de los personajes.',
    enProceso:
      'Identifica emociones compartidas y elige acuerdos respetuosos apoyándose en frases guiadas.',
    adquirido:
      'Reconoce perspectivas diversas en situaciones de conflicto, regula su respuesta y redacta reflexiones coherentes en el Diario.',
    avanzado:
      'Transfiere los aprendizajes empáticos del pasado a compromisos concretos de convivencia y acogida en su aula.',
  },
  {
    id: 'rub-sostenibilidad',
    dimension: 'Acción humana, igualdad y sostenibilidad (Agenda Canaria 2030)',
    competencies: 'CE6 · CE9 · CC · STEM',
    iniciado:
      'Participa de forma puntual en los retos transversales sin relacionarlos con su entorno cotidiano.',
    enProceso:
      'Comprende los principios básicos de igualdad, paz, cuidado del agua y protección del bosque en los ejemplos planteados.',
    adquirido:
      'Resuelve las misiones transversales y propone acciones responsables de ahorro hídrico, respeto ambiental y coeducación.',
    avanzado:
      'Lidera propuestas cooperativas en la asamblea conectando la cultura hidráulica, la Selva de Doramas y la migración canaria con los ODS.',
  },
];

function pctToLevel(
  pct: number
): 'Iniciado' | 'En proceso' | 'Adquirido' | 'Avanzado' {
  if (pct >= 85) return 'Avanzado';
  if (pct >= 60) return 'Adquirido';
  if (pct >= 30) return 'En proceso';
  return 'Iniciado';
}

/**
 * Translates student in-game evidence into an orientative LOMLOE evaluation
 * across the 6 core Specific Competencies of Conocimiento del Medio (CE2-CE9).
 */
export function evaluateSpecificCompetencies(
  state: ExpeditionState,
  _cycle: CycleId
): CompetencyEvaluationResult[] {
  const clues = ROOMS_DATA.filter((r) => state.progress[r.id].clueFound).length;
  const p1s = ROOMS_DATA.filter((r) => state.progress[r.id].puzzle1Solved).length;
  const p2s = ROOMS_DATA.filter((r) => state.progress[r.id].puzzle2Solved).length;
  const shadows = ROOMS_DATA.filter(
    (r) => state.progress[r.id].shadowSolved
  ).length;
  const empathies = ROOMS_DATA.filter(
    (r) => state.progress[r.id].empathySolved
  ).length;
  const transversals = ROOMS_DATA.filter(
    (r) => state.progress[r.id].transversalSolved
  ).length;
  const collectibles = ROOMS_DATA.filter(
    (r) => state.progress[r.id].collectibleFound
  ).length;
  const journals = ROOMS_DATA.filter((r) => Boolean(state.journal[r.id])).length;
  const atlasCount = state.atlasLayersCompleted?.length ?? 0;
  const hasRelieve = state.atlasLayersCompleted?.includes('relieve') ?? false;
  const hasEcosistemas =
    state.atlasLayersCompleted?.includes('ecosistemas') ?? false;
  const hasAgua = state.atlasLayersCompleted?.includes('agua') ?? false;
  const hasPatrimonio =
    state.atlasLayersCompleted?.includes('patrimonio') ?? false;
  const timelineDone = Boolean(state.timelineSolved);
  const totalHints = ROOMS_DATA.reduce(
    (acc, r) =>
      acc +
      state.progress[r.id].hintsUsed.puzzle1 +
      state.progress[r.id].hintsUsed.puzzle2,
    0
  );

  // CE2: Indagación científica e histórica (hallazgos, indagaciones del Atlas, enigmas con autonomía)
  const ce2Raw =
    ((clues / 4) * 30 +
      (atlasCount / 4) * 40 +
      ((p1s + p2s) / 8) * 30) -
    Math.min(10, Math.max(0, totalHints - 4) * 1.5);
  const ce2Pct = Math.max(0, Math.min(100, Math.round(ce2Raw)));

  // CE5: Medio natural, relieve, ecosistemas y clima insular
  const ce5Parts =
    Number(hasRelieve) * 24 +
    Number(hasEcosistemas) * 24 +
    Number(hasAgua) * 24 +
    Number(state.progress.pirateria.puzzle1Solved) * 14 +
    Number(state.progress.sigloXX.puzzle2Solved) * 14;
  const ce5Pct = Math.min(100, Math.round(ce5Parts));

  // CE6: Acción humana, sostenibilidad y Agenda Canaria 2030
  const ce6Parts =
    (transversals / 4) * 44 +
    Number(hasEcosistemas) * 18 +
    Number(hasAgua) * 18 +
    Number(hasPatrimonio) * 10 +
    Number(state.progress.sigloXX.puzzle2Solved) * 10;
  const ce6Pct = Math.min(100, Math.round(ce6Parts));

  // CE7: Tiempo histórico, cronología y fuentes
  const ce7Parts =
    ((p1s + p2s) / 8) * 42 +
    (shadows / 4) * 24 +
    (timelineDone ? 24 : 0) +
    (collectibles / 4) * 10;
  const ce7Pct = Math.min(100, Math.round(ce7Parts));

  // CE8: Diversidad cultural, igualdad y empatía (EMOCREA)
  const ce8Parts =
    (empathies / 4) * 48 +
    (journals / 4) * 26 +
    Number(state.progress.conquista.puzzle2Solved) * 14 +
    Number(state.progress.aborigenes.transversalSolved) * 12;
  const ce8Pct = Math.min(100, Math.round(ce8Parts));

  // CE9: Participación ciudadana, verificación frente a bulos y compromiso
  const ce9Parts =
    (transversals / 4) * 42 +
    (empathies / 4) * 26 +
    Number(hasPatrimonio) * 18 +
    Number(state.progress.pirateria.transversalSolved) * 14;
  const ce9Pct = Math.min(100, Math.round(ce9Parts));

  const mapDef = (id: SpecificCompetencyDefinition['id']) =>
    SPECIFIC_COMPETENCIES_CMN.find((c) => c.id === id)!;

  return [
    {
      id: 'CE2',
      shortTitle: mapDef('CE2').shortTitle,
      descriptors: mapDef('CE2').descriptors,
      percentage: ce2Pct,
      level: pctToLevel(ce2Pct),
      evidence: `${clues}/4 hallazgos · ${atlasCount}/4 indagaciones del Atlas · ${
        p1s + p2s
      }/8 enigmas (${totalHints} pistas)`,
    },
    {
      id: 'CE5',
      shortTitle: mapDef('CE5').shortTitle,
      descriptors: mapDef('CE5').descriptors,
      percentage: ce5Pct,
      level: pctToLevel(ce5Pct),
      evidence: `Atlas Natural: Relieve (${hasRelieve ? 'sí' : 'pend.'}), Ecosistemas (${
        hasEcosistemas ? 'sí' : 'pend.'
      }), Alisios/Agua (${hasAgua ? 'sí' : 'pend.'})`,
    },
    {
      id: 'CE6',
      shortTitle: mapDef('CE6').shortTitle,
      descriptors: mapDef('CE6').descriptors,
      percentage: ce6Pct,
      level: pctToLevel(ce6Pct),
      evidence: `${transversals}/4 Misiones 2030 · Agua insular (${
        state.progress.sigloXX.puzzle2Solved ? 'resuelto' : 'pend.'
      }) · Atlas ecosocial`,
    },
    {
      id: 'CE7',
      shortTitle: mapDef('CE7').shortTitle,
      descriptors: mapDef('CE7').descriptors,
      percentage: ce7Pct,
      level: pctToLevel(ce7Pct),
      evidence: `${p1s + p2s}/8 enigmas · ${shadows}/4 sombras · Línea del Tiempo (${
        timelineDone ? 'completada' : 'pend.'
      })`,
    },
    {
      id: 'CE8',
      shortTitle: mapDef('CE8').shortTitle,
      descriptors: mapDef('CE8').descriptors,
      percentage: ce8Pct,
      level: pctToLevel(ce8Pct),
      evidence: `${empathies}/4 dilemas empáticos · ${journals}/4 reflexiones en el Diario · Contraste de prejuicios`,
    },
    {
      id: 'CE9',
      shortTitle: mapDef('CE9').shortTitle,
      descriptors: mapDef('CE9').descriptors,
      percentage: ce9Pct,
      level: pctToLevel(ce9Pct),
      evidence: `${transversals}/4 retos cívicos · Verificación de bulos · Compromiso Reserva Biosfera`,
    },
  ];
}
