import { CycleId } from '../types/game';

export type HistoricalGlossaryTheme =
  | 'Época Aborigen'
  | 'Conquista'
  | 'Piratería'
  | 'Siglo XX'
  | 'Conceptos clave';

export interface HistoricalGlossaryEntry {
  id: string;
  term: string;
  letter: string;
  theme: HistoricalGlossaryTheme;
  definition: Record<CycleId, string>;
  inGranCanaria: string;
  oneLineSummary: string;
  relatedIds: string[];
}

export const HISTORICAL_GLOSSARY_ENTRIES: HistoricalGlossaryEntry[] = [
  {
    id: 'aborigen',
    term: 'Aborigen',
    letter: 'A',
    theme: 'Época Aborigen',
    definition: {
      ciclo2:
        'Persona que pertenece al primer pueblo que habitó un lugar desde tiempos muy antiguos, antes de la llegada de otros pueblos.',
      ciclo3:
        'Habitante originario de un territorio antes de su colonización o conquista. En Gran Canaria, los aborígenes eran los antiguos canarii, de origen norteafricano bereber.',
    },
    inGranCanaria:
      'Los antiguos canarii vivían en cuevas y casas de piedra seca en lugares como Gáldar, Telde y Guayadeque.',
    oneLineSummary: 'Primeros habitantes de una tierra desde la antigüedad.',
    relatedIds: ['prehispanico', 'guanarteme', 'gofio'],
  },
  {
    id: 'arqueologia',
    term: 'Arqueología',
    letter: 'A',
    theme: 'Conceptos clave',
    definition: {
      ciclo2:
        'Ciencia que estudia el pasado buscando y analizando objetos antiguos que dejaron las personas, como vasijas, casas o herramientas.',
      ciclo3:
        'Disciplina científica que reconstruye la vida de sociedades pasadas mediante el estudio cuidadoso de sus restos materiales y yacimientos.',
    },
    inGranCanaria:
      'Gracias a la arqueología se descubrió la Cueva Pintada de Gáldar y se sabe cómo vivían los canarii.',
    oneLineSummary: 'Estudiar el pasado a través de los objetos que dejó la gente.',
    relatedIds: ['fuente-historica', 'patrimonio', 'aborigen'],
  },
  {
    id: 'atalaya',
    term: 'Atalaya',
    letter: 'A',
    theme: 'Piratería',
    definition: {
      ciclo2:
        'Torre alta situada en la costa o en una montaña desde donde los vigías observaban el mar para avisar si llegaban barcos peligrosos.',
      ciclo3:
        'Torre de vigilancia estratégica levantada en puntos elevados o costeros para controlar el horizonte marítimo y dar la alarma temprana mediante fuego o campanas.',
    },
    inGranCanaria:
      'El Castillo de San Cristóbal funcionó como atalaya costera frente a los ataques piratas en Las Palmas de Gran Canaria.',
    oneLineSummary: 'Torre de vigilancia para observar el horizonte y avisar.',
    relatedIds: ['pirata', 'corsario'],
  },
  {
    id: 'canarismo',
    term: 'Canarismo',
    letter: 'C',
    theme: 'Conceptos clave',
    definition: {
      ciclo2:
        'Palabra o expresión propia de las Islas Canarias que forma parte de nuestra manera de hablar y de nuestra cultura.',
      ciclo3:
        'Vocablo o giro lingüístico característico del español hablado en Canarias, fruto del legado aborigen, andaluz, portugués y latinoamericano.',
    },
    inGranCanaria:
      'Palabras como «guagua», «gofio», «baifo», «alpispa» o «perenquén» son canarismos muy usados cada día.',
    oneLineSummary: 'Palabra especial que pertenece al habla de Canarias.',
    relatedIds: ['mestizaje', 'patrimonio', 'gofio'],
  },
  {
    id: 'carabela',
    term: 'Carabela',
    letter: 'C',
    theme: 'Conquista',
    definition: {
      ciclo2:
        'Barco antiguo de madera y velas grandes, rápido y fácil de dirigir, usado en el siglo XV para viajar por el océano Atlántico.',
      ciclo3:
        'Embarcación ligera de los siglos XV y XVI que combinaba velas latinas y cuadradas, permitiendo navegar largas distancias oceánicas y explorar rutas atlánticas.',
    },
    inGranCanaria:
      'Las carabelas hacían escala en Gran Canaria para reparar sus cascos y cargar agua y alimentos rumbo a América.',
    oneLineSummary: 'Barco de vela rápido usado en los viajes del siglo XV.',
    relatedIds: ['conquista', 'pirata'],
  },
  {
    id: 'colonizacion',
    term: 'Colonización',
    letter: 'C',
    theme: 'Conquista',
    definition: {
      ciclo2:
        'Proceso en el que personas llegadas de otro lugar se quedan a vivir en una tierra nueva y organizan allí pueblos, leyes y cultivos.',
      ciclo3:
        'Asentamiento estable de población foránea en un territorio conquistado, implantando nuevas instituciones, lengua, economía y organización social.',
    },
    inGranCanaria:
      'Tras 1483 se fundaron poblaciones nuevas, se repartieron tierras y aguas, y se introdujo el cultivo de la caña de azúcar.',
    oneLineSummary: 'Instalarse y organizar una nueva sociedad en un territorio.',
    relatedIds: ['conquista', 'mestizaje'],
  },
  {
    id: 'conquista',
    term: 'Conquista',
    letter: 'C',
    theme: 'Conquista',
    definition: {
      ciclo2:
        'Momento de la historia en que un reino o ejército entra en un territorio y pasa a gobernarlo, cambiando la vida de quienes ya vivían allí.',
      ciclo3:
        'Proceso militar y político por el cual un poder exterior somete un territorio. La conquista castellana de Gran Canaria duró cinco años, entre 1478 y 1483.',
    },
    inGranCanaria:
      'En Gran Canaria hubo resistencia aborigen y también pactos diplomáticos, como el Pacto de Calatayud (hacia 1481–1482), antes de finalizar la conquista en 1483.',
    oneLineSummary: 'Toma de control de un territorio por parte de otro reino.',
    relatedIds: ['colonizacion', 'mestizaje', 'carabela'],
  },
  {
    id: 'corsario',
    term: 'Corsario',
    letter: 'C',
    theme: 'Piratería',
    definition: {
      ciclo2:
        'Navegante armado que atacaba barcos y costas con permiso escrito de un rey o reina de otro país.',
      ciclo3:
        'Marino que actuaba con una «patente de corso», una autorización oficial de su gobierno para atacar barcos y puertos de naciones rivales.',
    },
    inGranCanaria:
      'El corsario inglés Francis Drake fue rechazado en la costa en 1595. En 1599, la armada oficial holandesa de Pieter van der Does llegó a tomar e incendiar Las Palmas, pero fue derrotada tierra adentro en la Batalla de El Batán.',
    oneLineSummary: 'Pirata con permiso oficial de un gobierno para atacar.',
    relatedIds: ['pirata', 'atalaya'],
  },
  {
    id: 'cronologia',
    term: 'Cronología',
    letter: 'C',
    theme: 'Conceptos clave',
    definition: {
      ciclo2:
        'Orden en el que ocurrieron los hechos en el tiempo, desde lo más antiguo hasta lo más reciente.',
      ciclo3:
        'Ciencia y método que ordena los acontecimientos históricos en una secuencia temporal precisa mediante fechas, siglos y épocas.',
    },
    inGranCanaria:
      'En tu Diario puedes ver la línea de tiempo cronológica: Época Aborigen → Conquista → Piratería → Siglo XX.',
    oneLineSummary: 'Colocar los hechos históricos en orden desde antes hasta hoy.',
    relatedIds: ['siglo', 'fuente-historica'],
  },
  {
    id: 'emigracion',
    term: 'Emigración',
    letter: 'E',
    theme: 'Siglo XX',
    definition: {
      ciclo2:
        'Viaje que hacen personas o familias cuando dejan su tierra para irse a vivir y trabajar a otro lugar buscando un futuro mejor.',
      ciclo3:
        'Desplazamiento de población desde su lugar de origen hacia otro país o región por motivos económicos, laborales, familiares o sociales.',
    },
    inGranCanaria:
      'Durante el siglo XX, miles de familias canarias emigraron en barco hacia Cuba, Venezuela y otros países de América.',
    oneLineSummary: 'Marcharse del lugar donde naciste para vivir en otro país.',
    relatedIds: ['puerto-luz', 'mestizaje'],
  },
  {
    id: 'fuente-historica',
    term: 'Fuente histórica',
    letter: 'F',
    theme: 'Conceptos clave',
    definition: {
      ciclo2:
        'Cualquier pista que nos ayuda a conocer el pasado: una foto antigua, una carta, una vasija, un edificio o la historia que cuenta un abuelo.',
      ciclo3:
        'Todo vestigio material, escrito, gráfico u oral que proporciona información verificable para investigar y reconstruir hechos del pasado.',
    },
    inGranCanaria:
      'Una pintadera de Gáldar, una crónica de 1478 y una maleta de 1952 son fuentes históricas de Gran Canaria.',
    oneLineSummary: 'Pista del pasado (objeto, escrito o relato) que nos da información.',
    relatedIds: ['arqueologia', 'cronologia', 'patrimonio'],
  },
  {
    id: 'gofio',
    term: 'Gofio',
    letter: 'G',
    theme: 'Época Aborigen',
    definition: {
      ciclo2:
        'Harina nutritiva hecha de cereales tostados (como cebada, trigo o millo) que ya preparaban los antiguos canarios y seguimos comiendo hoy.',
      ciclo3:
        'Alimento tradicional de origen prehispánico obtenido al tostar y moler cereales en molinos de piedra; fue la base alimentaria de Canarias durante siglos.',
    },
    inGranCanaria:
      'Los canarii tostaban cebada y la molían a mano; hoy el gofio sigue presente en desayunos, escaldones y postres canarios.',
    oneLineSummary: 'Harina de grano tostado heredada de los antiguos canarios.',
    relatedIds: ['aborigen', 'canarismo'],
  },
  {
    id: 'guanarteme',
    term: 'Guanarteme',
    letter: 'G',
    theme: 'Época Aborigen',
    definition: {
      ciclo2:
        'Persona que gobernaba uno de los dos grandes territorios antiguos de Gran Canaria (Agáldar o Telde) con la ayuda de un consejo.',
      ciclo3:
        'Máxima autoridad política de cada uno de los dos guanartematos de la Gran Canaria prehispánica, asesorado por la asamblea del Sábor.',
    },
    inGranCanaria:
      'Gáldar y Telde fueron las dos grandes sedes de los guanartemes en la isla antes de la conquista.',
    oneLineSummary: 'Gobernante de uno de los dos reinos antiguos de Gran Canaria.',
    relatedIds: ['aborigen', 'prehispanico'],
  },
  {
    id: 'heredamiento',
    term: 'Heredamiento de aguas',
    letter: 'H',
    theme: 'Siglo XX',
    definition: {
      ciclo2:
        'Grupo de vecinos y agricultores que se organizaban juntos para repartir el agua de las presas y acequias de forma justa.',
      ciclo3:
        'Institución histórica comunitaria de Canarias encargada de administrar, canalizar y repartir por turnos el agua escasa mediante acequias y cantoneras.',
    },
    inGranCanaria:
      'Gracias a las presas, estanques y acequias, el agua de las cumbres llegaba a las huertas de toda Gran Canaria.',
    oneLineSummary: 'Organización comunitaria para cuidar y repartir el agua.',
    relatedIds: ['patrimonio', 'emigracion'],
  },
  {
    id: 'mestizaje',
    term: 'Mestizaje',
    letter: 'M',
    theme: 'Conquista',
    definition: {
      ciclo2:
        'Unión y convivencia de personas, costumbres, palabras y músicas de distintas culturas que juntas crean algo nuevo y rico.',
      ciclo3:
        'Proceso biológico y cultural de encuentro e intercambio entre pueblos diferentes, origen de la identidad plural y abierta de Canarias.',
    },
    inGranCanaria:
      'El folclore, la gastronomía y las palabras de Gran Canaria nacen del encuentro entre lo aborigen, lo europeo, lo africano y lo americano.',
    oneLineSummary: 'Mezcla y encuentro de culturas que enriquecen un lugar.',
    relatedIds: ['conquista', 'canarismo', 'emigracion'],
  },
  {
    id: 'patrimonio',
    term: 'Patrimonio',
    letter: 'P',
    theme: 'Conceptos clave',
    definition: {
      ciclo2:
        'Conjunto de tesoros de la historia, la cultura y la naturaleza que heredamos del pasado y debemos cuidar para el futuro.',
      ciclo3:
        'Bienes materiales (monumentos, yacimientos, paisajes) e inmateriales (habla, música, tradiciones) heredados colectivamente que requieren protección.',
    },
    inGranCanaria:
      'Risco Caído, la Cueva Pintada, Vegueta, el timple y nuestras palabras son patrimonio de Gran Canaria; en Canarias destaca además el Silbo Gomero (Patrimonio de la UNESCO) y las iniciativas de recuperación del lenguaje silbado en la isla.',
    oneLineSummary: 'Herencia cultural y natural que debemos proteger entre todos.',
    relatedIds: ['arqueologia', 'fuente-historica', 'canarismo'],
  },
  {
    id: 'pirata',
    term: 'Pirata',
    letter: 'P',
    theme: 'Piratería',
    definition: {
      ciclo2:
        'Marinero que navegaba sin permiso de ningún rey para asaltar barcos y robar tesoros o mercancías en el mar y en las costas.',
      ciclo3:
        'Bandido marítimo que actuaba por cuenta propia, fuera de la ley, atacando rutas comerciales y puertos atlánticos para apoderarse de cargamentos.',
    },
    inGranCanaria:
      'Como Gran Canaria estaba en medio de las rutas del Atlántico, piratas y corsarios intentaron atacarla varias veces entre los siglos XVI y XVIII.',
    oneLineSummary: 'Asaltante del mar que atacaba barcos y puertos por su cuenta.',
    relatedIds: ['corsario', 'atalaya', 'carabela'],
  },
  {
    id: 'prehispanico',
    term: 'Prehispánico',
    letter: 'P',
    theme: 'Época Aborigen',
    definition: {
      ciclo2:
        'Todo lo que ocurrió o existió en las islas antes de que llegaran los castellanos en el siglo XV.',
      ciclo3:
        'Periodo histórico y cultural anterior a la llegada y conquista europea de las Islas Canarias, protagonizado por los pueblos aborígenes.',
    },
    inGranCanaria:
      'El Cenobio de Valerón y las pintaderas de barro son ejemplos únicos del pasado prehispánico de Gran Canaria.',
    oneLineSummary: 'Anterior a la llegada de los europeos a las islas.',
    relatedIds: ['aborigen', 'guanarteme', 'conquista'],
  },
  {
    id: 'puerto-luz',
    term: 'Puerto de La Luz',
    letter: 'P',
    theme: 'Siglo XX',
    definition: {
      ciclo2:
        'Gran puerto de Las Palmas de Gran Canaria donde llegaban y salían barcos de vapor de todo el mundo con mercancías y viajeros.',
      ciclo3:
        'Infraestructura portuaria clave construida desde finales del siglo XIX que convirtió a Gran Canaria en estación estratégica de carbón, comercio y emigración en el Atlántico.',
    },
    inGranCanaria:
      'El crecimiento del Puerto de La Luz transformó los barrios cercanos y abrió Gran Canaria al comercio internacional en el siglo XX.',
    oneLineSummary: 'Gran puerto atlántico que conectó Gran Canaria con el mundo.',
    relatedIds: ['emigracion', 'heredamiento'],
  },
  {
    id: 'siglo',
    term: 'Siglo',
    letter: 'S',
    theme: 'Conceptos clave',
    definition: {
      ciclo2:
        'Periodo de tiempo que dura exactamente 100 años. Se suele escribir con números romanos, como siglo XV o siglo XX.',
      ciclo3:
        'Unidad cronológica de cien años utilizada para situar grandes épocas históricas; por ejemplo, el año 1478 pertenece al siglo XV y 1952 al siglo XX.',
    },
    inGranCanaria:
      'En esta aventura viajas por más de quince siglos de historia de Gran Canaria en solo cuatro salas.',
    oneLineSummary: 'Conjunto de 100 años usado para medir la historia.',
    relatedIds: ['cronologia', 'fuente-historica'],
  },
];
