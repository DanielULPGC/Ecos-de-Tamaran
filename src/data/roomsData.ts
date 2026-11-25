import { RoomData } from '../types/game';
import titleDeskImg from '../assets/images/title_gran_canaria_desk_1795510912080.webp';
import room1Img from '../assets/images/room_1_cueva_canarii_1795510911609.webp';
import room2Img from '../assets/images/room_2_archivo_guiniguada_1795510910907.webp';
import room3Img from '../assets/images/room_3_atalaya_san_cristobal_1795510911678.webp';
import room4Img from '../assets/images/room_4_muelle_la_luz_1795510911207.webp';

export const TITLE_ART_PATH = titleDeskImg;

export const ROOMS_DATA: RoomData[] = [
  {
    id: 'aborigenes',
    number: 1,
    epoch: 'Época Aborigen',
    years: 'Siglos III – XV',
    title: 'La Cueva de los Canarii',
    location: 'Agáldar y Cenobio de Valerón · Gran Canaria',
    mapZoneLabel: 'Norte · Gáldar',
    imagePath: room1Img,
    fallbackGradient: 'linear-gradient(135deg, #3c2f27 0%, #634a39 50%, #2d3e36 100%)',
    arrivalNarrative: {
      ciclo2:
        '¡Hola desde Gáldar! Toca los puntos de la cueva para reunir 3 sellos y viajar a la siguiente época.',
      ciclo3:
        'Estás en una cueva de Agáldar. Explora el friso, las vasijas y el valle para conseguir los 3 sellos.',
    },
    transitionSummary:
      '¡Zona Norte iluminada! Descubriste las pintaderas, el granero colectivo y cómo compartir con justicia.',
    hotspots: [
      {
        id: 'r1-puzzle1',
        kind: 'puzzle1',
        label: 'Mural geométrico y pintadera',
        shortLabel: 'Pintadera',
        x: 26,
        y: 41,
      },
      {
        id: 'r1-puzzle2',
        kind: 'puzzle2',
        label: 'Vasijas y granero colectivo',
        shortLabel: 'Granero',
        x: 41,
        y: 66,
      },
      {
        id: 'r1-clue',
        kind: 'clue',
        label: 'Cesto de palma y grano tostado',
        shortLabel: 'Hallazgo',
        x: 28,
        y: 84,
      },
      {
        id: 'r1-empathy',
        kind: 'empathy',
        label: 'Voces del valle de Agáldar',
        shortLabel: 'Dilema',
        x: 80,
        y: 53,
      },
    ],
    clue: {
      id: 'c1-gofio',
      title: 'Cesto de palma y cebada tostada',
      itemLabel: 'Cesto de gofio',
      subtitle: 'Hallazgo · Agáldar',
      text: {
        ciclo2:
          '¡Aquí hay cebada tostada para hacer gofio y una pintadera de barro en forma de cruz, un sello geométrico de los antiguos canarios!',
        ciclo3:
          'Cebada tostada (base del gofio) junto a una pintadera simétrica. En el Cenobio de Valerón guardaban las cosechas de toda la aldea.',
      },
      historicalNote:
        'Una de las hipótesis arqueológicas principales es que las pintaderas servían para marcar silos, además de posibles usos decorativos o de identidad.',
    },
    puzzle1: {
      id: 'r1-p1',
      sealTitle: 'Sello de la Pintadera',
      title: 'Talla la pintadera de Gáldar',
      intro: {
        ciclo2:
          'Toca las casillas de barro para dibujar la cruz protectora siguiendo las 3 pistas.',
        ciclo3:
          'Activa las casillas exactas para tallar el anillo geométrico de la Cueva Pintada.',
      },
      mechanic: 'pattern-grid',
      payload: {
        ciclo2: {
          kind: 'pattern-grid',
          gridSize: 3,
          targetPattern: [1, 3, 4, 5, 7],
          referenceNote: 'Cruz simétrica de 5 triángulos.',
          rowClues: [
            'Fila 1: solo el centro.',
            'Fila 2: las 3 casillas.',
            'Fila 3: solo el centro.',
          ],
        },
        ciclo3: {
          kind: 'pattern-grid',
          gridSize: 4,
          targetPattern: [1, 2, 4, 7, 8, 11, 13, 14],
          referenceNote: 'Anillo geométrico de 8 marcas (sin esquinas ni centro).',
          rowClues: [
            'Fila 1: columnas 2 y 3.',
            'Fila 2: bordes 1 y 4.',
            'Fila 3: bordes 1 y 4.',
            'Fila 4: columnas 2 y 3.',
          ],
        },
      },
      hints: {
        ciclo2: {
          level1: 'Tiene forma de signo más (+) justo en el centro.',
          level2: 'Deja las 4 esquinas vacías y pinta toda la fila del medio.',
          level3: 'Pinta centro arriba, las 3 del centro y centro abajo (5 marcas).',
        },
        ciclo3: {
          level1: 'Forma un anillo alrededor del cuadrado central vacío.',
          level2: 'Las 4 esquinas y las 4 casillas interiores quedan apagadas.',
          level3: 'Fila 1: 2 y 3 · Filas 2 y 3: 1 y 4 · Fila 4: 2 y 3.',
        },
      },
      successMessage: '¡Pintadera tallada! Sello aborigen desbloqueado.',
    },
    puzzle2: {
      id: 'r1-p2',
      sealTitle: 'Sello del Granero',
      title: 'Conecta los tesoros canarii',
      intro: {
        ciclo2: 'Toca un elemento a la izquierda y únelo con su función a la derecha.',
        ciclo3: 'Empareja cada nombre patrimonial de Gran Canaria con su función histórica.',
      },
      mechanic: 'pair-match',
      payload: {
        ciclo2: {
          kind: 'pair-match',
          leftHeading: 'Elemento',
          rightHeading: '¿Para qué servía?',
          pairs: [
            {
              id: 'gofio',
              left: 'Gofio de cebada',
              right: 'Alimento de grano tostado y molido en piedra',
            },
            {
              id: 'cenobio',
              left: 'Cenobio de Valerón',
              right: 'Granero excavado en la roca para guardar cosechas',
            },
            {
              id: 'pintadera',
              left: 'Pintadera de barro',
              right: 'Sello geométrico usado para marcar silos o decorar',
            },
          ],
        },
        ciclo3: {
          kind: 'pair-match',
          leftHeading: 'Patrimonio',
          rightHeading: 'Huella en Gran Canaria',
          pairs: [
            {
              id: 'cenobio3',
              left: 'Cenobio de Valerón',
              right: 'Más de 300 silos comunitarios en un risco volcánico',
            },
            {
              id: 'agalda',
              left: 'Agáldar y Telde',
              right: 'Los dos grandes guanartematos de la isla',
            },
            {
              id: 'gofio3',
              left: 'Molino de mano',
              right: 'Moler cebada tostada para hacer gofio',
            },
            {
              id: 'cueva',
              left: 'Cueva Pintada',
              right: 'Cámara decorada con frisos geométricos en Gáldar',
            },
          ],
        },
      },
      hints: {
        ciclo2: {
          level1: 'Recuerda el cesto: el grano tostado es el gofio.',
          level2: 'Valerón es el granero gigante excavado en la roca.',
          level3: 'Gofio → grano · Valerón → granero · Pintadera → sello.',
        },
        ciclo3: {
          level1: 'Agáldar y Telde eran centros de gobierno (guanartematos).',
          level2: 'Valerón reúne cientos de silos y Cueva Pintada los frisos.',
          level3: 'Valerón → 300 silos · Agáldar/Telde → guanartematos · Molino → gofio · Cueva → frisos.',
        },
      },
      successMessage: '¡Granero organizado! Todas las parejas encajan.',
    },
    empathy: {
      id: 'r1-emp',
      sealTitle: 'Sello de la Empatía',
      title: 'Sequía en Agáldar',
      setting: 'Falta lluvia y queda poco grano en el granero común. Escucha a ambos:',
      voices: [
        {
          name: 'Arminda',
          role: 'Alfarera de Agáldar',
          quote: {
            ciclo2: '«Nuestro huerto se secó. Si no compartimos el grano, mis hijas pasarán hambre».',
            ciclo3: '«Hicimos las vasijas para todos, pero la sequía arrasó nuestro huerto. Necesitamos apoyo común».',
          },
          feelingClue: 'Mira a sus hijas con voz temblorosa.',
        },
        {
          name: 'Bentejuí',
          role: 'Guardián del silo',
          quote: {
            ciclo2: '«Quiero ayudar, pero si gastamos todo hoy, no quedarán semillas para plantar».',
            ciclo3: '«No niego ayuda, pero sin racionar ni guardar semillas, toda la aldea pasará hambre el próximo año».',
          },
          feelingClue: 'Revisa el nivel del grano muy tenso.',
        },
      ],
      emotionPrompt: '¿Qué emoción comparten en el fondo los dos?',
      emotionChoices: [
        {
          id: 'preocupacion',
          shortLabel: 'Preocupación',
          label: 'Preocupación por su comunidad',
          description: 'Temen que falte comida para las familias.',
          face: 'preocupacion',
          isRecommended: true,
        },
        {
          id: 'enfado',
          shortLabel: 'Egoísmo',
          label: 'Enfado y egoísmo',
          description: 'No quieren ayudar a nadie.',
          face: 'enfado',
        },
        {
          id: 'indiferencia',
          shortLabel: 'Aburrimiento',
          label: 'Indiferencia total',
          description: 'Les da igual la sequía.',
          face: 'indiferencia',
        },
      ],
      criticalQuestion: {
        ciclo2: '¿Qué solución es justa para hoy y para mañana?',
        ciclo3: 'Con pensamiento crítico, ¿cómo resolvemos el reparto sostenible?',
      },
      criticalChoices: [
        {
          id: 'crit-1',
          label: 'Guardar semillas fijas y repartir el resto según necesidad.',
          isBest: true,
          feedback: '¡Genial! Cuidas a las familias hoy y aseguras la cosecha futura.',
        },
        {
          id: 'crit-2',
          label: 'Dar la razón solo a quien grite más fuerte.',
          isBest: false,
          feedback: 'Gritar no da la razón; pensar juntos sí.',
        },
        {
          id: 'crit-3',
          label: 'Cerrar el granero y que nadie comparta nada.',
          isBest: false,
          feedback: 'En una isla, cooperar es la clave para salir adelante.',
        },
      ],
      criticalChoicesCiclo3: [
        {
          id: 'crit3-1',
          label: 'Reservar una cuota fija de semillas para sembrar y repartir el resto según la necesidad de cada familia.',
          isBest: true,
          feedback: '¡Excelente equilibrio! Protege a las familias vulnerables hoy sin comprometer la cosecha del próximo año.',
        },
        {
          id: 'crit3-2',
          label: 'Repartir todo el grano ahora mismo sin guardar semillas para evitar cualquier sufrimiento hoy.',
          isBest: false,
          feedback: 'Nace de una buena intención solidaria, pero sin semillas para la próxima siembra toda la aldea quedaría en riesgo el año siguiente.',
        },
        {
          id: 'crit3-3',
          label: 'Repartir solo entre quienes aportaron más cebada al silo en la cosecha anterior.',
          isBest: false,
          feedback: 'Parece proporcional, pero ignora que una sequía desigual dejaría sin sustento a familias que aportaron otros oficios esenciales como la alfarería.',
        },
      ],
      decisionPrompt: 'Elige tu acuerdo para el valle:',
      decisionChoices: [
        {
          id: 'dec-acuerdo',
          label: 'Turnos de reparto justo + reserva segura de semillas.',
          feedback: '¡Equilibrio perfecto entre empatía y previsión!',
        },
        {
          id: 'dec-intercambio',
          label: 'Compartir grano mientras cada familia aporta su oficio.',
          feedback: '¡Gran trabajo en equipo comunitario!',
        },
      ],
      reflectionPrompt: {
        ciclo2: 'Toca una frase rápida o escribe tu idea sobre compartir con justicia:',
        ciclo3: 'Registra tu idea en el diario sobre cómo cuidar recursos compartidos:',
      },
      guidedStarters: [
        'Escuchar a todos ayuda a encontrar soluciones justas.',
        'Compartir cuidando el futuro hace feliz a toda la comunidad.',
        'Cuando cooperamos en clase, nadie se queda atrás.',
      ],
    },
  },
  {
    id: 'conquista',
    number: 2,
    epoch: 'Conquista y Encuentro de Culturas',
    years: '1478 – 1483',
    title: 'El Archivo del Real de Las Palmas',
    location: 'Barranco de Guiniguada · Gran Canaria',
    mapZoneLabel: 'Este · Guiniguada',
    imagePath: room2Img,
    fallbackGradient: 'linear-gradient(135deg, #2d3642 0%, #524739 50%, #2a3e4d 100%)',
    arrivalNarrative: {
      ciclo2:
        '¡Te damos la bienvenida a 1478 en el Guiniguada! Ordena la historia, detecta prejuicios y escucha dos miradas.',
      ciclo3:
        'Archivo de 1478–1483. Ordena los hechos, separa pruebas de prejuicios y analiza dos testimonios.',
    },
    transitionSummary:
      '¡Barranco de Guiniguada iluminado! Ya sabes contrastar fuentes históricas y escuchar distintas versiones.',
    hotspots: [
      {
        id: 'r2-puzzle1',
        kind: 'puzzle1',
        label: 'Mapa y línea del tiempo',
        shortLabel: 'Cronología',
        x: 83,
        y: 52,
      },
      {
        id: 'r2-puzzle2',
        kind: 'puzzle2',
        label: 'Crónicas cruzadas',
        shortLabel: 'Crónicas',
        x: 20,
        y: 70,
      },
      {
        id: 'r2-clue',
        kind: 'clue',
        label: 'Nota del archivero',
        shortLabel: 'Hallazgo',
        x: 29,
        y: 38,
      },
      {
        id: 'r2-empathy',
        kind: 'empathy',
        label: 'Mirador del Guiniguada',
        shortLabel: 'Dilema',
        x: 52,
        y: 50,
      },
    ],
    clue: {
      id: 'c2-bando',
      title: 'Nota secreta del archivero',
      itemLabel: 'Nota de fechas',
      subtitle: 'Archivo · 1483',
      text: {
        ciclo2:
          'Fechas clave: Antes de 1478 vivían los canarii → 1478 campamento del Guiniguada → 1483 fin de la conquista.',
        ciclo3:
          'Secuencia: Antes de 1478 (guanartematos) → 1478 (Real de Las Palmas) → hacia 1481–1482 (Pacto de Calatayud) → 1483 (Ansite).',
      },
      historicalNote:
        'Un hecho tiene fecha o prueba real; un prejuicio desprecia a un grupo entero sin pruebas.',
    },
    puzzle1: {
      id: 'r2-p1',
      sealTitle: 'Sello de la Cronología',
      title: 'Ordena la línea del tiempo',
      intro: {
        ciclo2: 'Usa las flechas para colocar las 3 tarjetas de la más antigua a la más reciente.',
        ciclo3: 'Ordena los 4 hitos del siglo XV en Gran Canaria del más antiguo al más reciente.',
      },
      mechanic: 'sequence-order',
      payload: {
        ciclo2: {
          kind: 'sequence-order',
          items: [
            {
              id: 's2-b',
              label: '1478 · Campamento del Guiniguada',
              detail: 'Llegan las naves junto al palmeral de Las Palmas.',
              order: 1,
            },
            {
              id: 's2-c',
              label: '1483 · Nueva sociedad mestiza',
              detail: 'Terminan los combates y se mezclan tradiciones.',
              order: 2,
            },
            {
              id: 's2-a',
              label: 'Antes de 1478 · Guanartematos',
              detail: 'Los antiguos canarios viven en Agáldar y Telde.',
              order: 0,
            },
          ],
        },
        ciclo3: {
          kind: 'sequence-order',
          items: [
            {
              id: 's3-c',
              label: '1481–1482 · Pacto de Calatayud',
              detail: 'Tenesor Semidán busca acuerdos diplomáticos ante la Corona.',
              order: 2,
            },
            {
              id: 's3-a',
              label: 'Antes de 1478 · Agáldar y Telde',
              detail: 'Sociedad aborigen con gobierno y graneros propios.',
              order: 0,
            },
            {
              id: 's3-d',
              label: '1483 · Ansite y mestizaje',
              detail: 'Cierra la conquista y nace una sociedad diversa.',
              order: 3,
            },
            {
              id: 's3-b',
              label: '1478 · Real de Las Palmas',
              detail: 'Primer campamento junto al barranco de Guiniguada.',
              order: 1,
            },
          ],
        },
      },
      hints: {
        ciclo2: {
          level1: 'Mira el número del año al principio de cada tarjeta.',
          level2: 'Empieza siempre por "Antes de 1478".',
          level3: 'Orden: Antes de 1478 → 1478 → 1483.',
        },
        ciclo3: {
          level1: 'Revisa la nota colgada en la pared del archivo.',
          level2: '1481–1482 (Calatayud) va entre 1478 y 1483.',
          level3: 'Orden: Antes de 1478 → 1478 → 1481–1482 → 1483.',
        },
      },
      successMessage: '¡Cronología perfecta! El archivo se ha ordenado.',
    },
    puzzle2: {
      id: 'r2-p2',
      sealTitle: 'Sello Crítico',
      title: 'Detector de hechos y prejuicios',
      intro: {
        ciclo2: 'Pulsa si cada frase es un "Hecho comprobable" o una "Opinión o prejuicio".',
        ciclo3: 'Evalúa cada fragmento histórico: ¿es un dato verificable o un sesgo/prejuicio?',
      },
      mechanic: 'fact-vs-bias',
      payload: {
        ciclo2: {
          kind: 'fact-vs-bias',
          statements: [
            {
              id: 'fb1',
              source: 'Crónica del puerto',
              quote: 'En 1478 se montó un campamento junto al barranco de Guiniguada.',
              category: 'hecho',
              explanation: 'Fecha y lugar comprobables.',
            },
            {
              id: 'fb2',
              source: 'Carta de un soldado',
              quote: 'No saben organizarse porque hablan otra lengua.',
              category: 'opinion',
              explanation: 'Prejuicio sin fundamento.',
            },
            {
              id: 'fb3',
              source: 'Arqueología',
              quote: 'Cultivaban cebada y guardaban grano en silos de piedra.',
              category: 'hecho',
              explanation: 'Demostrado por restos reales.',
            },
            {
              id: 'fb4',
              source: 'Diario viejo',
              quote: 'Solo nuestras casas valen y las demás no sirven.',
              category: 'opinion',
              explanation: 'Opinión injusta sin respeto cultural.',
            },
          ],
        },
        ciclo3: {
          kind: 'fact-vs-bias',
          statements: [
            {
              id: 'fb3-1',
              source: 'Acta de fundación',
              quote: 'El 24 de junio de 1478 nació el Real de Las Palmas junto al Guiniguada.',
              category: 'hecho',
              explanation: 'Dato histórico documentado.',
            },
            {
              id: 'fb3-2',
              source: 'Carta de 1480',
              quote: 'Todos los isleños son incapaces de llegar a acuerdos de paz.',
              category: 'opinion',
              explanation: 'Generalización falsa desmentida por los pactos.',
            },
            {
              id: 'fb3-3',
              source: 'Toponimia',
              quote: 'Nombres como Telde, Gáldar y Arucas conservan raíces aborígenes.',
              category: 'hecho',
              explanation: 'Hecho lingüístico actual y comprobable.',
            },
            {
              id: 'fb3-4',
              source: 'Panfleto anónimo',
              quote: 'Defienden su tierra únicamente por terquedad.',
              category: 'opinion',
              explanation: 'Juicio parcial que ignora su perspectiva.',
            },
            {
              id: 'fb3-5',
              source: 'Crónica comparada',
              quote: 'Hubo conflictos armados, pero también pactos y convivencia mestiza.',
              category: 'hecho',
              explanation: 'Síntesis contrastada por diversas fuentes.',
            },
          ],
        },
      },
      hints: {
        ciclo2: {
          level1: 'Si desprecia a otras personas por su lengua o costumbres, es un prejuicio.',
          level2: 'Las fechas (1478) y los restos de cebada son hechos comprobables.',
          level3: 'Hechos: 1 y 3 · Prejuicios: 2 y 4.',
        },
        ciclo3: {
          level1: 'Fíjate en palabras exageradas como "todos" o "únicamente": señalan prejuicios.',
          level2: 'Fechas, topónimos (Telde, Gáldar) y síntesis contrastadas son hechos.',
          level3: 'Hechos: 1, 3 y 5 · Prejuicios: 2 y 4.',
        },
      },
      successMessage: '¡Mente crítica activada! Sabes detectar prejuicios en las fuentes.',
    },
    empathy: {
      id: 'r2-emp',
      sealTitle: 'Sello de la Empatía',
      title: 'Dos miradas en el barranco',
      setting: 'Año 1482. Antes de una tregua, escuchas dos testimonios muy humanos:',
      voices: [
        {
          name: 'Guayarmina',
          role: 'Joven canarii',
          quote: {
            ciclo2: '«Aquí nacieron mis abuelos. Me duele que quieran borrar nuestra lengua y costumbres».',
            ciclo3: '«Cada risco tiene nombre en nuestra lengua. Nos angustia perder nuestra libertad y memoria».',
          },
          feelingClue: 'Aprieta su colgante volcánico con tristeza.',
        },
        {
          name: 'Mateo',
          role: 'Joven carpintero',
          quote: {
            ciclo2: '«Vine a trabajar para mi familia y temo la guerra. Ojalá hablemos en paz».',
            ciclo3: '«No vine a destruir hogares, sino a buscar sustento. Quiero paz y aprender de quienes conocen esta isla».',
          },
          feelingClue: 'Baja sus herramientas buscando diálogo.',
        },
      ],
      emotionPrompt: '¿Qué emoción profunda une a Guayarmina y a Mateo?',
      emotionChoices: [
        {
          id: 'anhelo',
          shortLabel: 'Dolor y paz',
          label: 'Dolor por el conflicto y deseo de respeto',
          description: 'Ambos sufren con la guerra y quieren vivir en paz.',
          face: 'anoranza',
          isRecommended: true,
        },
        {
          id: 'alegria',
          shortLabel: 'Alegría',
          label: 'Alegría por luchar',
          description: 'Ninguno disfruta con el enfrentamiento.',
          face: 'alegria',
        },
        {
          id: 'desprecio',
          shortLabel: 'Desprecio',
          label: 'Enfado sin ganas de hablar',
          description: 'Ambos desean ser escuchados.',
          face: 'enfado',
        },
      ],
      criticalQuestion: {
        ciclo2: '¿Por qué debemos escuchar a los dos lados de la historia?',
        ciclo3: '¿Qué perdemos si leemos la historia desde un solo bando?',
      },
      criticalChoices: [
        {
          id: 'c2-best',
          label: 'Perdemos la voz, la cultura y la verdad de parte de la población.',
          isBest: true,
          feedback: '¡Exacto! Contrastar voces nos da una memoria justa y completa.',
        },
        {
          id: 'c2-b',
          label: 'Nada, una sola versión siempre cuenta toda la verdad.',
          isBest: false,
          feedback: 'Cada crónica muestra solo un punto de vista.',
        },
        {
          id: 'c2-c',
          label: 'Solo hace el libro más corto.',
          isBest: false,
          feedback: 'Lo importante es comprender con justicia y rigor.',
        },
      ],
      criticalChoicesCiclo3: [
        {
          id: 'c2-3-best',
          label: 'Perdemos la perspectiva, los derechos y el legado cultural de parte de la población, generando una memoria incompleta.',
          isBest: true,
          feedback: '¡Exacto! El rigor histórico exige contrastar fuentes diversas para comprender causas, consecuencias y vivencias de todas las partes.',
        },
        {
          id: 'c2-3-b',
          label: 'Basta con leer las crónicas escritas oficiales, porque son los únicos documentos con fechas exactas.',
          isBest: false,
          feedback: 'Las crónicas aportan fechas valiosas, pero fueron redactadas desde un solo bando; la arqueología y la toponimia completan la otra mitad de la historia.',
        },
        {
          id: 'c2-3-c',
          label: 'Conviene centrarse solo en los pactos de paz para evitar hablar de conflictos difíciles en clase.',
          isBest: false,
          feedback: 'Omitir los conflictos impide entender por qué fueron necesarios los acuerdos y el respeto a los derechos humanos.',
        },
      ],
      decisionPrompt: 'Como mediador o mediadora, ¿qué regla propones primero?',
      decisionChoices: [
        {
          id: 'd2-respeto',
          label: 'Proteger la lengua, los nombres de la tierra y a todas las familias.',
          feedback: '¡Respetar la identidad es la base de la convivencia!',
        },
        {
          id: 'd2-dialogo',
          label: 'Crear un consejo mixto donde las dos culturas decidan juntas.',
          feedback: '¡La mediación transforma conflictos en acuerdos!',
        },
      ],
      reflectionPrompt: {
        ciclo2: 'Toca una idea o escribe cómo respetar culturas distintas en tu colegio:',
        ciclo3: 'Anota qué valor tiene la diversidad cultural hoy en Gran Canaria:',
      },
      guidedStarters: [
        'Escuchar las dos versiones ayuda a entender mejor a los demás.',
        'Respetar otras lenguas y costumbres enriquece nuestra clase.',
        'Recordar las raíces aborígenes nos ayuda a cuidar nuestra identidad.',
      ],
    },
  },
  {
    id: 'pirateria',
    number: 3,
    epoch: 'Piratería y Puente Atlántico',
    years: 'Siglos XVI – XIX',
    title: 'La Atalaya de San Cristóbal',
    location: 'Costa de Las Palmas · Castillo de la Luz',
    mapZoneLabel: 'Costa · San Cristóbal',
    imagePath: room3Img,
    fallbackGradient: 'linear-gradient(135deg, #1a334a 0%, #3d4854 52%, #594433 100%)',
    arrivalNarrative: {
      ciclo2:
        '¡Alerta en 1599! Velas en el mar: envía la señal de aviso, revisa el comercio y calma los rumores.',
      ciclo3:
        'Torre costera de 1599. Activa la alerta al Castillo de la Luz ante la armada de Van der Does, analiza el comercio atlántico y frena el pánico.',
    },
    transitionSummary:
      '¡Costa de San Cristóbal iluminada! Activaste la alerta ante la armada de 1599 y recordaste cómo el vecindario cooperó hasta la victoria en El Batán.',
    hotspots: [
      {
        id: 'r3-puzzle1',
        kind: 'puzzle1',
        label: 'Mesa de navegación y brújula',
        shortLabel: 'Almenaras',
        x: 52,
        y: 62,
      },
      {
        id: 'r3-puzzle2',
        kind: 'puzzle2',
        label: 'Cajas de azúcar y cochinilla',
        shortLabel: 'Comercio',
        x: 81,
        y: 54,
      },
      {
        id: 'r3-clue',
        kind: 'clue',
        label: 'Brasero de señales',
        shortLabel: 'Hallazgo',
        x: 15,
        y: 65,
      },
      {
        id: 'r3-empathy',
        kind: 'empathy',
        label: 'Horizonte de la bahía',
        shortLabel: 'Dilema',
        x: 24,
        y: 34,
      },
    ],
    clue: {
      id: 'c3-brasero',
      title: 'Código secreto del vigía',
      itemLabel: 'Código de fuego',
      subtitle: 'Torreón · Junio 1599',
      text: {
        ciclo2:
          'Protocolo de aviso: Rumbo NORTE → DOS fuegos de aviso → hacia el Castillo de la Luz.',
        ciclo3:
          'Armada holandesa de Van der Does por el NORESTE → encender DOS hogueras con humo denso → avisar al Castillo de la Luz.',
      },
      historicalNote:
        'En junio de 1599, la armada holandesa llegó a desembarcar e incendiar Las Palmas, pero las señales y la unión vecinal permitieron derrotarla en la Batalla de El Batán.',
    },
    puzzle1: {
      id: 'r3-p1',
      sealTitle: 'Sello de la Atalaya',
      title: 'Envía la señal de almenara',
      intro: {
        ciclo2: 'Elige los 3 ajustes correctos para avisar rápido a la ciudad.',
        ciclo3: 'Configura rumbo, señal de fuego y fortaleza receptora según el protocolo de 1599.',
      },
      mechanic: 'compass-code',
      payload: {
        ciclo2: {
          kind: 'compass-code',
          directions: ['Norte', 'Sur', 'Este', 'Oeste'],
          correctDirection: 'Norte',
          signalOptions: [
            {
              id: 'uno',
              label: 'Un fuego pequeño',
              description: 'Barco amigo.',
            },
            {
              id: 'dos',
              label: 'Dos fuegos de aviso',
              description: 'Alerta de barcos desconocidos.',
            },
            {
              id: 'ninguno',
              label: 'Sin fuego',
              description: 'Mar en calma.',
            },
          ],
          correctSignalId: 'dos',
          watchtowerOptions: [
            'Castillo de la Luz',
            'Cueva de Valerón',
            'Roque Nublo',
          ],
          correctWatchtower: 'Castillo de la Luz',
        },
        ciclo3: {
          kind: 'compass-code',
          directions: ['Norte', 'Noreste', 'Sureste', 'Suroeste'],
          correctDirection: 'Noreste',
          signalOptions: [
            {
              id: 'uno',
              label: 'Una hoguera clara',
              description: 'Barco de correo.',
            },
            {
              id: 'dos',
              label: 'Dos hogueras con humo',
              description: 'Alerta de armada enemiga.',
            },
            {
              id: 'tres',
              label: 'Tres faroles verdes',
              description: 'Aviso de tormenta.',
            },
          ],
          correctSignalId: 'dos',
          watchtowerOptions: [
            'Castillo de la Luz',
            'Real de Agáldar',
            'Presa de Soria',
          ],
          correctWatchtower: 'Castillo de la Luz',
        },
      },
      hints: {
        ciclo2: {
          level1: 'Toca el brasero de la izquierda para leer el código exacto.',
          level2: 'Vienen del Norte y avisas al castillo costero de Las Palmas.',
          level3: 'Elige: Norte · Dos fuegos de aviso · Castillo de la Luz.',
        },
        ciclo3: {
          level1: 'El brasero de la izquierda guarda el protocolo de 1599.',
          level2: 'Rumbo Noreste hacia Las Isletas y alerta de armada enemiga.',
          level3: 'Elige: Noreste · Dos hogueras con humo · Castillo de la Luz.',
        },
      },
      successMessage: '¡Señal enviada! El Castillo de la Luz alerta a la ciudad para organizarse.',
    },
    puzzle2: {
      id: 'r3-p2',
      sealTitle: 'Sello Atlántico',
      title: 'Balanza del comercio en el mar',
      intro: {
        ciclo2: 'Une cada producto histórico de Gran Canaria con su utilidad.',
        ciclo3: 'Relaciona cada ciclo comercial atlántico con su huella en la isla.',
      },
      mechanic: 'pair-match',
      payload: {
        ciclo2: {
          kind: 'pair-match',
          leftHeading: 'Producto',
          rightHeading: 'Importancia',
          pairs: [
            {
              id: 'azucar',
              left: 'Caña de azúcar',
              right: 'Primer gran cultivo de exportación en la isla',
            },
            {
              id: 'cochinilla',
              left: 'Cochinilla de tunera',
              right: 'Insecto que daba un famoso tinte rojo carmín',
            },
            {
              id: 'puerto',
              left: 'Escala atlántica',
              right: 'Parada de barcos por agua y comida rumbo a América',
            },
          ],
        },
        ciclo3: {
          kind: 'pair-match',
          leftHeading: 'Ciclo comercial',
          rightHeading: 'Impacto histórico',
          pairs: [
            {
              id: 'azucar3',
              left: 'Ingenios de azúcar',
              right: 'Impulsaron acequias y comercio europeo en el s. XVI',
            },
            {
              id: 'vino3',
              left: 'Vinos canarios',
              right: 'Exportados a Europa y América en los ss. XVII–XVIII',
            },
            {
              id: 'cochinilla3',
              left: 'Tinte de cochinilla',
              right: 'Motor del s. XIX antes de los tintes sintéticos',
            },
            {
              id: 'puente3',
              left: 'Puente tricontinental',
              right: 'Intercambio cultural entre América, África y Europa',
            },
          ],
        },
      },
      hints: {
        ciclo2: {
          level1: 'Mira los frascos rojos de la derecha: son de cochinilla.',
          level2: 'Los barcos rumbo a América paraban en la isla a por agua.',
          level3: 'Azúcar → primer cultivo · Cochinilla → tinte rojo · Escala → barcos a América.',
        },
        ciclo3: {
          level1: 'Recuerda el orden: azúcar (XVI), vino (XVII–XVIII), cochinilla (XIX).',
          level2: 'Canarias conectaba tres continentes en el Atlántico.',
          level3: 'Azúcar → s. XVI · Vinos → XVII–XVIII · Cochinilla → s. XIX · Puente → 3 continentes.',
        },
      },
      successMessage: '¡Comercio atlántico descifrado! Gran Canaria conectó tres continentes.',
    },
    empathy: {
      id: 'r3-emp',
      sealTitle: 'Sello de la Empatía',
      title: 'Campanas y rumores en Vegueta',
      setting: 'Suenan las campanas y corren rumores que asustan a la gente. Escucha:',
      voices: [
        {
          name: 'Catalina',
          role: 'Comerciante',
          quote: {
            ciclo2: '«¡Dicen que ya están en la plaza! ¡Tengo mucho miedo y quiero salir corriendo!»',
            ciclo3: '«Gritan que desembarcaron mil soldados ya mismo. ¡El pánico no me deja pensar!»',
          },
          feelingClue: 'Respira muy rápido y tiembla.',
        },
        {
          name: 'Sebastián',
          role: 'Pescador',
          quote: {
            ciclo2: '«Respira despacio: los barcos aún están lejos. Ayudemos a la abuela María a subir».',
            ciclo3: '«Es un bulo, las naves siguen lejos. Con calma pondremos a salvo a niños y mayores».',
          },
          feelingClue: 'Habla tranquilo y tiende la mano.',
        },
      ],
      emotionPrompt: '¿Qué emoción bloquea a Catalina en este instante?',
      emotionChoices: [
        {
          id: 'panico',
          shortLabel: 'Miedo',
          label: 'Miedo intenso por un rumor sin comprobar',
          description: 'El pánico acelera el pulso y confunde.',
          face: 'miedo',
          isRecommended: true,
        },
        {
          id: 'calma',
          shortLabel: 'Calma',
          label: 'Tranquilidad y calma',
          description: 'Catalina está muy asustada, no tranquila.',
          face: 'calma',
        },
        {
          id: 'orgullo',
          shortLabel: 'Alegría',
          label: 'Alegría por la alarma',
          description: 'Las campanas le dan miedo.',
          face: 'alegria',
        },
      ],
      criticalQuestion: {
        ciclo2: 'Si oyes un rumor que da miedo, ¿qué haces primero?',
        ciclo3: '¿Cómo frena el pensamiento crítico los bulos de 1599 y de hoy?',
      },
      criticalChoices: [
        {
          id: 'c3-best',
          label: 'Respirar, comprobar la fuente oficial y cuidar a las personas.',
          isBest: true,
          feedback: '¡Bravo! La calma y comprobar los datos salvan del pánico.',
        },
        {
          id: 'c3-b',
          label: 'Repetirlo gritando más fuerte por toda la calle.',
          isBest: false,
          feedback: 'Difundir rumores sin comprobar empeora el miedo.',
        },
        {
          id: 'c3-c',
          label: 'Ignorar también la señal real de la torre.',
          isBest: false,
          feedback: 'Hay que distinguir rumores falsos de avisos oficiales reales.',
        },
      ],
      criticalChoicesCiclo3: [
        {
          id: 'c3-3-best',
          label: 'Mantener la calma, contrastar la señal oficial de la atalaya y organizar la ayuda sin amplificar rumores.',
          isBest: true,
          feedback: '¡Exacto! Verificar fuentes fiables evita la parálisis por pánico y permite actuar con eficacia ante un peligro real.',
        },
        {
          id: 'c3-3-b',
          label: 'Difundir cualquier rumor alarmante «por si acaso» para que la gente salga corriendo cuanto antes.',
          isBest: false,
          feedback: 'Avisar sin contrastar puede provocar estampidas y desorientar a niños y mayores; proteger exige información precisa.',
        },
        {
          id: 'c3-3-c',
          label: 'Desconfiar de toda alarma (incluso la oficial) para que nadie se asuste en la plaza.',
          isBest: false,
          feedback: 'El pensamiento crítico no consiste en negar cualquier aviso, sino en distinguir fuentes fiables de rumores sin comprobar.',
        },
      ],
      decisionPrompt: '¿Cómo actúas con el vecindario?',
      decisionChoices: [
        {
          id: 'd3-calma',
          label: 'Calmar a Catalina y evacuar en grupo ayudando a los mayores.',
          feedback: '¡El cuidado mutuo vence al miedo!',
        },
        {
          id: 'd3-cadena',
          label: 'Avisar calle por calle con datos reales y sin bulos.',
          feedback: '¡Información clara = seguridad para todos!',
        },
      ],
      reflectionPrompt: {
        ciclo2: 'Toca una frase o escribe qué te ayuda a calmarte si tienes miedo:',
        ciclo3: 'Anota qué puedes hacer hoy ante noticias falsas que generan miedo:',
      },
      guidedStarters: [
        'Respirar profundo me ayuda a pensar mejor cuando siento miedo.',
        'Antes de compartir un rumor debo comprobar si es verdad.',
        'Mantener la calma nos permite ayudar a quienes lo necesitan.',
      ],
    },
  },
  {
    id: 'sigloXX',
    number: 4,
    epoch: 'Siglo XX y Memoria Viva',
    years: '1900 – Actualidad',
    title: 'El Muelle de La Luz y la Memoria Viva',
    location: 'Puerto de La Luz y Cumbres · Gran Canaria',
    mapZoneLabel: 'Puerto y Cumbres',
    imagePath: room4Img,
    fallbackGradient: 'linear-gradient(135deg, #1d3c57 0%, #4b5d67 52%, #6b533b 100%)',
    arrivalNarrative: {
      ciclo2:
        '¡Última sala! Revisa la maleta de 1952, abre la red del agua y completa el último sello.',
      ciclo3:
        'Gran Canaria del siglo XX a hoy. Descifra la maleta migrante, el circuito del agua y el espejo del muelle.',
    },
    transitionSummary:
      '¡Toda Gran Canaria brilla! Completaste el Cuaderno del Tiempo con historia, empatía y pensamiento crítico.',
    hotspots: [
      {
        id: 'r4-puzzle1',
        kind: 'puzzle1',
        label: 'Maleta de 1952 y postales',
        shortLabel: 'Maleta',
        x: 20,
        y: 74,
      },
      {
        id: 'r4-puzzle2',
        kind: 'puzzle2',
        label: 'Relieve de presas y acequias',
        shortLabel: 'Agua',
        x: 40,
        y: 37,
      },
      {
        id: 'r4-clue',
        kind: 'clue',
        label: 'Cuaderno del escritorio',
        shortLabel: 'Hallazgo',
        x: 87,
        y: 76,
      },
      {
        id: 'r4-empathy',
        kind: 'empathy',
        label: 'Balcón del Puerto de La Luz',
        shortLabel: 'Dilema',
        x: 82,
        y: 44,
      },
    ],
    clue: {
      id: 'c4-notas',
      title: 'Carta familiar de 1952',
      itemLabel: 'Carta de 1952',
      subtitle: 'Puerto de La Luz · 1952',
      text: {
        ciclo2:
          'En 1952 las familias viajaban en barco a Venezuela con cartas en papel y mantas. El agua baja: Cumbre → Presas → Acequias → Campos.',
        ciclo3:
          'Miles de canarios emigraron desde La Luz a Venezuela/Cuba con cartas y pasajes en papel. El agua fluye: Alisios/Cumbre → Presas → Heredamientos/Acequias → Vegas.',
      },
      historicalNote:
        'Canarias fue tierra de emigración y hoy es también tierra de acogida.',
    },
    puzzle1: {
      id: 'r4-p1',
      sealTitle: 'Sello de la Memoria',
      title: 'Prepara la maleta de 1952',
      intro: {
        ciclo2: 'Toca los 3 objetos reales de 1952 y deja fuera los inventos modernos.',
        ciclo3: 'Selecciona los 4 recuerdos auténticos de 1952 y descarta los 2 anacronismos.',
      },
      mechanic: 'suitcase-select',
      payload: {
        ciclo2: {
          kind: 'suitcase-select',
          requiredCount: 3,
          items: [
            {
              id: 'i-carta',
              title: 'Cartas y foto en blanco y negro',
              description: 'Recuerdo de los abuelos de Teror.',
              isHistorical: true,
              reason: 'Así se comunicaban las familias en 1952.',
            },
            {
              id: 'i-movil',
              title: 'Teléfono móvil con USB',
              description: 'Mensajes instantáneos.',
              isHistorical: false,
              reason: 'No existía en 1952.',
            },
            {
              id: 'i-billete',
              title: 'Billete de barco a Venezuela',
              description: 'Salida desde el Puerto de La Luz.',
              isHistorical: true,
              reason: 'Muchos canarios viajaron en barco a América.',
            },
            {
              id: 'i-manta',
              title: 'Manta tejida y gofio',
              description: 'Abrigo y sabor de la isla.',
              isHistorical: true,
              reason: 'Recuerdos reales de la travesía.',
            },
            {
              id: 'i-tarjeta',
              title: 'Billete digital con código QR',
              description: 'Escaneable en pantalla.',
              isHistorical: false,
              reason: 'El código QR es del siglo XXI.',
            },
          ],
        },
        ciclo3: {
          kind: 'suitcase-select',
          requiredCount: 4,
          items: [
            {
              id: 'i3-pasaje',
              title: 'Pasaje Puerto de La Luz – La Guaira',
              description: 'Travesía marítima hacia Venezuela.',
              isHistorical: true,
              reason: 'Destino clave de la emigración canaria.',
            },
            {
              id: 'i3-cartas',
              title: 'Fajo de cartas y postal de Vegueta',
              description: 'Correo postal en papel.',
              isHistorical: true,
              reason: 'Principal lazo con la familia.',
            },
            {
              id: 'i3-tablet',
              title: 'Tableta con mapas GPS',
              description: 'Pantalla táctil moderna.',
              isHistorical: false,
              reason: 'Anacronismo del siglo XXI.',
            },
            {
              id: 'i3-oficio',
              title: 'Libreta de direcciones de paisanos',
              description: 'Red de apoyo familiar en América.',
              isHistorical: true,
              reason: 'Ayudaba a encontrar hogar y trabajo.',
            },
            {
              id: 'i3-chal',
              title: 'Manta de lana y lata con semillas',
              description: 'Objetos de apego de la tierra.',
              isHistorical: true,
              reason: 'Mantenían viva la identidad isleña.',
            },
            {
              id: 'i3-dron',
              title: 'Cámara dron recargable',
              description: 'Aparato volador de vídeo.',
              isHistorical: false,
              reason: 'Anacronismo moderno.',
            },
          ],
        },
      },
      hints: {
        ciclo2: {
          level1: 'Saca de la maleta los aparatos electrónicos modernos.',
          level2: 'En 1952 no había móviles ni códigos QR.',
          level3: 'Elige: Cartas y foto · Billete de barco · Manta y gofio.',
        },
        ciclo3: {
          level1: 'Hay 2 inventos tecnológicos del siglo XXI colados.',
          level2: 'Descarta la tableta GPS y el dron.',
          level3: 'Elige: Pasaje a La Guaira · Cartas · Libreta de paisanos · Manta y semillas.',
        },
      },
      successMessage: '¡Maleta lista! Has cuidado la memoria de la emigración canaria.',
    },
    puzzle2: {
      id: 'r4-p2',
      sealTitle: 'Sello del Agua',
      title: 'Abre la red del agua',
      intro: {
        ciclo2: 'Toca los 4 pasos en orden (1 → 4) desde la nube hasta la huerta.',
        ciclo3: 'Activa en orden (1 → 4) el circuito hidráulico sostenible de Gran Canaria.',
      },
      mechanic: 'water-flow',
      payload: {
        ciclo2: {
          kind: 'water-flow',
          nodes: [
            {
              id: 'w-acequia',
              title: 'Acequias y canales',
              role: 'Llevan el agua por las laderas.',
              correctStep: 3,
            },
            {
              id: 'w-cumbre',
              title: 'Lluvia y nubes en la cumbre',
              role: 'Las montañas recogen la humedad.',
              correctStep: 1,
            },
            {
              id: 'w-huerta',
              title: 'Campos y ahorro en casa',
              role: 'Riego y uso responsable.',
              correctStep: 4,
            },
            {
              id: 'w-presa',
              title: 'Presas y estanques',
              role: 'Guardan el agua de lluvia.',
              correctStep: 2,
            },
          ],
        },
        ciclo3: {
          kind: 'water-flow',
          nodes: [
            {
              id: 'w3-hered',
              title: 'Heredamientos y acequias',
              role: 'Reparten los turnos de agua en comunidad.',
              correctStep: 3,
            },
            {
              id: 'w3-presa',
              title: 'Presas y galerías',
              role: 'Almacenan y extraen agua del subsuelo.',
              correctStep: 2,
            },
            {
              id: 'w3-vega',
              title: 'Vegas y uso sostenible',
              role: 'Riego, desalación y ahorro ciudadano.',
              correctStep: 4,
            },
            {
              id: 'w3-alisios',
              title: 'Alisios y cumbres húmedas',
              role: 'Recargan barrancos y acuíferos.',
              correctStep: 1,
            },
          ],
        },
      },
      hints: {
        ciclo2: {
          level1: 'Todo empieza arriba, con la lluvia en las montañas.',
          level2: '1 Cumbre → 2 Presas → 3 Acequias → 4 Campos.',
          level3: 'Pulsa: Lluvia en la cumbre → Presas → Acequias → Campos.',
        },
        ciclo3: {
          level1: 'Sigue la gravedad: clima → almacenamiento → reparto → consumo.',
          level2: 'Los heredamientos y acequias son el paso 3.',
          level3: 'Pulsa: Alisios → Presas y galerías → Heredamientos → Vegas.',
        },
      },
      successMessage: '¡El agua vuelve a fluir por Gran Canaria!',
    },
    empathy: {
      id: 'r4-emp',
      sealTitle: 'Sello de la Empatía',
      title: 'El espejo del muelle',
      setting: 'Dos voces separadas por 70 años en el mismo puerto:',
      voices: [
        {
          name: 'Carmita (1952)',
          role: 'Emigrante de 10 años',
          quote: {
            ciclo2: '«Viajo en barco a Venezuela. Ojalá allí algún niño me invite a jugar el primer día».',
            ciclo3: '«Dejo mi calle y el mar de aquí. Tengo miedo de que se burlen de mi acento en mi nuevo colegio».',
          },
          feelingClue: 'Abraza su maleta mirando el muelle.',
        },
        {
          name: 'Youssef (Hoy)',
          role: 'Alumno recién llegado',
          quote: {
            ciclo2: '«Llegué hace dos semanas a Gran Canaria. Me hace muy feliz cuando alguien me sonríe y pregunta cómo estoy».',
            ciclo3: '«Mi familia buscó una vida tranquila, como tantas familias canarias antes. Cuando me escuchan sin prejuicios, me siento en casa».',
          },
          feelingClue: 'Sonríe tímido en la puerta del colegio.',
        },
      ],
      emotionPrompt: '¿Qué emoción une a Carmita en 1952 con Youssef hoy?',
      emotionChoices: [
        {
          id: 'puente',
          shortLabel: 'Añoranza',
          label: 'Añoranza y ganas de sentirse acogidos',
          description: 'Cambiar de lugar ilusiona y da nervios; la acogida lo cambia todo.',
          face: 'anoranza',
          isRecommended: true,
        },
        {
          id: 'diferencia',
          shortLabel: 'Indiferencia',
          label: 'No sienten nada parecido',
          description: 'Sus emociones al viajar son muy parecidas.',
          face: 'indiferencia',
        },
        {
          id: 'enfado4',
          shortLabel: 'Enfado',
          label: 'Enfado con todo el colegio',
          description: 'Ambos desean hacer amistades.',
          face: 'enfado',
        },
      ],
      criticalQuestion: {
        ciclo2: 'Si alguien se burla de un compañero nuevo, ¿qué nos recuerda nuestra historia?',
        ciclo3: '¿Cómo desmonta prejuicios recordar la emigración canaria?',
      },
      criticalChoices: [
        {
          id: 'c4-best',
          label: 'Muchas familias canarias también necesitaron hospitalidad fuera; todos merecemos respeto.',
          isBest: true,
          feedback: '¡Preciosa conexión entre memoria histórica y empatía!',
        },
        {
          id: 'c4-b',
          label: 'El pasado no tiene nada que ver con hoy.',
          isBest: false,
          feedback: 'Conocer el pasado nos hace más empáticos hoy.',
        },
        {
          id: 'c4-c',
          label: 'Mejor no hablar con quien tenga otro acento.',
          isBest: false,
          feedback: 'La diversidad de acentos e historias nos enriquece.',
        },
      ],
      criticalChoicesCiclo3: [
        {
          id: 'c4-3-best',
          label: 'Demuestra que migrar es una experiencia humana compartida: miles de familias canarias también necesitaron acogida y trato digno fuera.',
          isBest: true,
          feedback: '¡Magnífica síntesis! Conectar la memoria familiar con el presente desmonta estereotipos y fortalece los derechos humanos.',
        },
        {
          id: 'c4-3-b',
          label: 'Solo sirve como curiosidad familiar, porque las migraciones de hoy son totalmente distintas a las de 1952.',
          isBest: false,
          feedback: 'Aunque cambien los medios de transporte y las rutas, el deseo de seguridad, trabajo y acogida humana sigue siendo el mismo.',
        },
        {
          id: 'c4-3-c',
          label: 'Lo mejor para evitar conflictos es que cada persona recién llegada oculte su acento y costumbres hasta adaptarse.',
          isBest: false,
          feedback: 'La verdadera integración respeta la identidad de origen mientras construye normas comunes de convivencia.',
        },
      ],
      decisionPrompt: 'Elige tu compromiso para tu colegio:',
      decisionChoices: [
        {
          id: 'd4-acogida',
          label: 'Ser guía de bienvenida e invitar a participar a quien llegue nuevo.',
          feedback: '¡Un pequeño gesto que cambia el día a cualquiera!',
        },
        {
          id: 'd4-memoria',
          label: 'Frenar burlas con respeto y valorar las historias de cada familia.',
          feedback: '¡Valentía empática y pensamiento crítico en acción!',
        },
      ],
      reflectionPrompt: {
        ciclo2: 'Elige o escribe tu mensaje final del Cuaderno de Tamarán:',
        ciclo3: 'Cierra tu diario: ¿cómo te ayudan la historia y la empatía en tu día a día?',
      },
      guidedStarters: [
        'Recordar que nuestras familias emigraron me anima a acoger con cariño.',
        'La empatía y el pensamiento crítico hacen mi colegio más feliz.',
        'Mi compromiso es escuchar sin prejuicios y cuidar nuestra isla.',
      ],
    },
  },
];
