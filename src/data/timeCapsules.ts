import { CycleId, ExpeditionState, RoomId, RoomProgress } from '../types/game';
import capsuleAborigenesImg from '../assets/images/capsule_aborigenes_1795536371930.webp';
import capsuleConquistaImg from '../assets/images/capsule_conquista_1795536376300.webp';
import capsulePirateriaImg from '../assets/images/capsule_pirateria_1795536373351.webp';
import capsuleSigloXxImg from '../assets/images/capsule_siglo_xx_1795536374289.webp';

export interface TimeCapsuleDefinition {
  roomId: RoomId;
  capsuleNumber: number;
  title: string;
  eventTag: string;
  historicalDate: string;
  location: string;
  imagePath: string;
  imageAlt: string;
  summary: Record<CycleId, string>;
  spotDetails: string[];
  requiredChallenges: number;
}

export const TIME_CAPSULES: TimeCapsuleDefinition[] = [
  {
    roomId: 'aborigenes',
    capsuleNumber: 1,
    title: 'Vida comunitaria y artesanía en Agáldar',
    eventTag: 'Poblado canarii · Época prehispánica',
    historicalDate: 'Siglo XIV (antes de 1478)',
    location: 'Agáldar · Norte de Gran Canaria',
    imagePath: capsuleAborigenesImg,
    imageAlt:
      'Ilustración histórica del poblado aborigen de Agáldar en Gran Canaria con cuevas, casas de piedra, alfarería, pintaderas y cosecha de cebada.',
    summary: {
      ciclo2:
        'En el antiguo poblado de Agáldar, las familias aborígenes vivían en casas de piedra y cuevas excavadas en la roca volcánica. Trabajaban en equipo para cosechar cebada, preparar gofio, modelar vasijas de barro y estampar pintaderas geométricas.',
      ciclo3:
        'Antes de la llegada de los europeos, Agáldar era una de las grandes sedes del guanartemato de Gran Canaria. Su organización comunitaria combinaba agricultura en terrazas, alfarería sin torno, almacenamiento colectivo en graneros y el uso de pintaderas de barro (posibles sellos de granero o marcas de identidad).',
    },
    spotDetails: [
      'Las alfareras moldean vasijas de barro a mano y estampan diseños geométricos con pintaderas.',
      'Las cuevas excavadas en la ladera convivían con casas de piedra seca cubiertas con techos vegetales.',
      'En el valle se ven cultivos de cebada, palmeras canarias y dragos bajo las cumbres volcánicas.',
    ],
    requiredChallenges: 2,
  },
  {
    roomId: 'conquista',
    capsuleNumber: 2,
    title: 'Fundación del Real de Las Palmas',
    eventTag: 'Origen de la ciudad · Siglo XV',
    historicalDate: '24 de junio de 1478',
    location: 'Desembocadura del barranco de Guiniguada',
    imagePath: capsuleConquistaImg,
    imageAlt:
      'Ilustración histórica de la fundación del Real de Las Palmas junto al palmeral del barranco de Guiniguada en 1478, con carabelas en la bahía y primeras construcciones.',
    summary: {
      ciclo2:
        'El 24 de junio de 1478 se levantó el campamento del Real de Las Palmas junto al palmeral y al agua del barranco de Guiniguada. Con el paso del tiempo, aquellas primeras casas y ermitas dieron origen al barrio histórico de Vegueta.',
      ciclo3:
        'La fundación del Real de Las Palmas junto a la desembocadura del Guiniguada aprovechó el agua dulce del barranco y el abrigo natural de la costa para las carabelas. Este asentamiento marcó el inicio del trazado urbano de Vegueta y el contacto profundo entre la población aborigen y la llegada de nuevos pobladores.',
    },
    spotDetails: [
      'El barranco de Guiniguada llevaba agua dulce rodeado de un gran palmeral que dio nombre a Las Palmas.',
      'En la bahía fondean tres carabelas que traían suministros, mapas y expedicionarios desde la Península.',
      'En primer plano se construyen las primeras casas de piedra, la ermita inicial y se trazan los planos del asentamiento.',
    ],
    requiredChallenges: 2,
  },
  {
    roomId: 'pirateria',
    capsuleNumber: 3,
    title: 'La noche de las almenaras en San Cristóbal',
    eventTag: 'Defensa costera atlántica · Siglo XVI',
    historicalDate: 'Junio de 1599',
    location: 'Castillo de San Cristóbal · Bahía de Las Palmas',
    imagePath: capsulePirateriaImg,
    imageAlt:
      'Ilustración histórica del Castillo de San Cristóbal al anochecer en 1599, con fuegos de aviso en las torres costeras y naves de la armada holandesa en el horizonte atlántico.',
    summary: {
      ciclo2:
        'Cuando se divisaban barcos enemigos en el horizonte del Atlántico, los vigías encendían grandes hogueras llamadas almenaras desde las torres y castillos. Así toda la costa se avisaba en pocos minutos y el vecindario se protegía unido.',
      ciclo3:
        'En junio de 1599, la gran armada oficial de las Provincias Unidas comandada por Pieter van der Does atacó Las Palmas de Gran Canaria. Aunque logró desembarcar e incendiar la ciudad tras bombardear el Castillo de la Luz, las señales de alerta y la resistencia solidaria de la isla permitieron derrotarla en la Batalla de El Batán.',
    },
    spotDetails: [
      'El torreón circular del Castillo de San Cristóbal se levantaba sobre la roca basáltica bañada por el mar.',
      'Las almenaras encendidas en cadena transmitían el aviso a lo largo de la bahía mucho más rápido que un mensajero.',
      'Las familias se reúnen con faroles junto al malecón, recordando que la cooperación vecinal fue clave ante el peligro.',
    ],
    requiredChallenges: 2,
  },
  {
    roomId: 'sigloXX',
    capsuleNumber: 4,
    title: 'Embarque y comercio en el Puerto de La Luz',
    eventTag: 'Memoria migratoria y portuaria · Siglo XX',
    historicalDate: 'Década de 1950 (1952)',
    location: 'Puerto de La Luz · Las Palmas de Gran Canaria',
    imagePath: capsuleSigloXxImg,
    imageAlt:
      'Ilustración histórica del Puerto de La Luz en 1952 con un gran barco de pasajeros, familias despidiéndose con pañuelos, maletas de cuero y cajas de plátanos y tomates.',
    summary: {
      ciclo2:
        'A mediados del siglo XX, el Puerto de La Luz era un puente lleno de vida. Desde sus muelles salían barcos cargados de plátanos y tomates de Gran Canaria, y también muchas familias que viajaban hacia Venezuela o Cuba en busca de un futuro mejor.',
      ciclo3:
        'En los años cincuenta, el Puerto de La Luz consolidó a Gran Canaria como enclave estratégico entre Europa, África y América. Sus muelles fueron escenario de dos historias paralelas: el auge exportador del plátano y el tomate canario y la emigración de miles de familias que despidieron a sus seres queridos con pañuelos blancos.',
    },
    spotDetails: [
      'Las familias agitan pañuelos blancos desde el muelle junto a sus maletas de cuero y baúles de viaje.',
      'A la derecha se apilan cajas de madera con plátanos y tomates de Canarias listos para embarcar con las grúas.',
      'El gran buque de pasajeros simboliza el vínculo histórico y afectivo entre Gran Canaria y América Latina.',
    ],
    requiredChallenges: 2,
  },
];

export function getTimeCapsuleByRoom(roomId: RoomId): TimeCapsuleDefinition {
  return (
    TIME_CAPSULES.find((c) => c.roomId === roomId) ?? TIME_CAPSULES[0]
  );
}

export function evaluateTimeCapsuleProgress(
  roomId: RoomId,
  progress: RoomProgress
): { completed: number; required: number; unlocked: boolean } {
  const capsule = getTimeCapsuleByRoom(roomId);
  const completed =
    Number(progress.puzzle1Solved) +
    Number(progress.puzzle2Solved) +
    Number(progress.empathySolved) +
    Number(progress.shadowSolved) +
    Number(progress.transversalSolved);
  const required = capsule.requiredChallenges;
  return {
    completed,
    required,
    unlocked: completed >= required,
  };
}

export function getUnlockedTimeCapsuleRoomIds(
  state: ExpeditionState
): RoomId[] {
  return TIME_CAPSULES.filter(
    (c) => evaluateTimeCapsuleProgress(c.roomId, state.progress[c.roomId]).unlocked
  ).map((c) => c.roomId);
}
