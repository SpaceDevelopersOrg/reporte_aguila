import type { FimEvent } from '../../types'

const now = Date.now()
const minute = 60_000
const hour = 60 * minute
const day = 24 * hour

const at = (offsetMs: number) => new Date(now + offsetMs).toISOString()

const updated = at(-2 * day)

export const events: FimEvent[] = [
  {
    id: 'ev-talentos',
    title: 'Noche de Talentos Águila',
    description:
      'Escenario abierto para la comunidad FIM: música en vivo, poesía, stand-up y danza. Participa o ven a apoyar a tus compañeras y compañeros. Entrada libre con credencial.',
    category: 'cultural',
    startsAt: at(2 * hour),
    endsAt: at(2 * hour + 3 * hour),
    location: 'Auditorio FIM',
    organizerId: 'org-cultura',
    tags: ['música', 'danza', 'comunidad'],
    updatedAt: updated,
  },
  {
    id: 'ev-cine-club',
    title: 'Cine Club: Ciencia Ficción Mexicana',
    description:
      'Proyección y charla posterior sobre cine de ciencia ficción hecho en México. Palomitas incluidas.',
    category: 'cultural',
    startsAt: at(8 * hour),
    endsAt: at(8 * hour + 2 * hour),
    location: 'Sala Audiovisual, Edificio B',
    organizerId: 'org-sociedad',
    tags: ['cine', 'charla'],
    updatedAt: updated,
  },
  {
    id: 'ev-interfacultades-futbol',
    title: 'Interfacultades: Águilas vs. FCA',
    description:
      'Partido inaugural del torneo interfacultades. Ven a apoyar al equipo representativo de la FIM.',
    category: 'sports',
    startsAt: at(1 * day + 4 * hour),
    endsAt: at(1 * day + 6 * hour),
    location: 'Cancha de Fútbol UAS',
    organizerId: 'org-deportes',
    tags: ['fútbol', 'torneo'],
    updatedAt: updated,
  },
  {
    id: 'ev-torneo-basquet',
    title: 'Torneo Interno de Basquetbol 3x3',
    description:
      'Inscripciones por equipos de 3 integrantes. Premios para los tres primeros lugares. Cupo limitado.',
    category: 'sports',
    startsAt: at(2 * day + 2 * hour),
    endsAt: at(2 * day + 6 * hour),
    location: 'Canchas FIM',
    organizerId: 'org-deportes',
    tags: ['basquetbol', 'torneo'],
    updatedAt: updated,
  },
  {
    id: 'ev-torneo-robotica',
    title: 'Torneo Interno de Robótica',
    description:
      'Construye tu robot seguidor de línea y compite con equipos de todos los semestres. Taller de apoyo previo.',
    category: 'cultural',
    startsAt: at(4 * day + 3 * hour),
    endsAt: at(4 * day + 8 * hour),
    location: 'Laboratorio de Electrónica',
    organizerId: 'org-robotica',
    tags: ['robótica', 'tecnología'],
    updatedAt: updated,
  },
  {
    id: 'ev-muestra-teatro',
    title: 'Muestra de Teatro Universitario',
    description:
      'El Taller de Teatro FIM presenta su montaje semestral. Función única con foro abierto al final.',
    category: 'cultural',
    startsAt: at(6 * day + 5 * hour),
    endsAt: at(6 * day + 7 * hour),
    location: 'Teatro de Casa de la Cultura',
    organizerId: 'org-cultura',
    tags: ['teatro', 'arte'],
    updatedAt: updated,
  },
  {
    id: 'ev-torneo-voleibol',
    title: 'Copa Águila de Voleibol',
    description:
      'Encuentro amistoso entre selecciones de la FIM y la Facultad de Medicina. Ambiente familiar.',
    category: 'sports',
    startsAt: at(8 * day + 3 * hour),
    endsAt: at(8 * day + 6 * hour),
    location: 'Cancha de Voleibol FIM',
    organizerId: 'org-deportes',
    tags: ['voleibol', 'amistoso'],
    updatedAt: updated,
  },
  {
    id: 'ev-expo-foto',
    title: 'Exposición: Mochis a través del Lente',
    description:
      'Muestra fotográfica del Círculo de Fotografía. Recorrido guiado por las y los autores de las obras.',
    category: 'cultural',
    startsAt: at(10 * day + 4 * hour),
    endsAt: at(10 * day + 9 * hour),
    location: 'Pasillo Central FIM',
    organizerId: 'org-cultura',
    tags: ['fotografía', 'exposición'],
    updatedAt: updated,
  },
  {
    id: 'ev-carrera-aguila',
    title: 'Carrera Atlética Águila 5K',
    description:
      'Carrera recreativa de 5 km por el campus. Kit con playera, número e hidratación. Inscripción previa.',
    category: 'sports',
    startsAt: at(12 * day + 1 * hour),
    endsAt: at(12 * day + 4 * hour),
    location: 'Acceso Principal FIM',
    organizerId: 'org-deportes',
    tags: ['atletismo', 'recreación'],
    updatedAt: updated,
  },
  {
    id: 'ev-brigada-servicio',
    title: 'Brigada de Servicio Comunitario',
    description:
      'Jornada de apoyo en colonias cercanas: limpieza, pintura y talleres. Se otorgan créditos de servicio social.',
    category: 'cultural',
    startsAt: at(15 * day + 4 * hour),
    endsAt: at(15 * day + 10 * hour),
    location: 'Salida desde Explanada FIM',
    organizerId: 'org-sociedad',
    tags: ['servicio', 'comunidad'],
    updatedAt: updated,
  },
  {
    id: 'ev-bienvenida',
    title: 'Bienvenida a Nuevo Ingreso',
    description:
      'Feria de clubes, actividades deportivas y culturales para las y los estudiantes de nuevo ingreso.',
    category: 'cultural',
    startsAt: at(18 * day + 3 * hour),
    endsAt: at(18 * day + 7 * hour),
    location: 'Explanada FIM',
    organizerId: 'org-sociedad',
    tags: ['bienvenida', 'feria'],
    updatedAt: updated,
  },
  {
    id: 'ev-festival-primavera',
    title: 'Festival Cultural de Primavera',
    description:
      'Jornada completa con bandas locales, danza folclórica, gastronomía y bazar de emprendedores FIM.',
    category: 'cultural',
    startsAt: at(21 * day + 4 * hour),
    endsAt: at(21 * day + 11 * hour),
    location: 'Explanada FIM',
    organizerId: 'org-cultura',
    tags: ['festival', 'música', 'gastronomía'],
    updatedAt: updated,
  },
  {
    id: 'ev-taller-ajedrez',
    title: 'Taller de Ajedrez para Principiantes',
    description:
      'Aprende las bases del ajedrez con la comunidad. Tableros disponibles; trae el tuyo si prefieres.',
    category: 'cultural',
    startsAt: at(24 * day + 5 * hour),
    endsAt: at(24 * day + 7 * hour),
    location: 'Biblioteca FIM',
    organizerId: 'org-tutorias',
    tags: ['ajedrez', 'taller'],
    updatedAt: updated,
  },
  {
    id: 'ev-torneo-futbol-playa',
    title: 'Torneo Relámpago de Fútbol Playa',
    description:
      'Eliminatorias de un día en formato rápido. Equipos mixtos bienvenidos.',
    category: 'sports',
    startsAt: at(27 * day + 3 * hour),
    endsAt: at(27 * day + 8 * hour),
    location: 'Canchas FIM',
    organizerId: 'org-deportes',
    tags: ['fútbol', 'playa'],
    updatedAt: updated,
  },
  {
    id: 'ev-concierto-acustico',
    title: 'Concierto Acústico de Fin de Semestre',
    description:
      'Cierre de semestre con el ensamble acústico del Club de Música. Noche de covers y composiciones originales.',
    category: 'cultural',
    startsAt: at(30 * day + 6 * hour),
    endsAt: at(30 * day + 8 * hour),
    location: 'Auditorio FIM',
    organizerId: 'org-cultura',
    tags: ['música', 'concierto'],
    updatedAt: updated,
  },
]
