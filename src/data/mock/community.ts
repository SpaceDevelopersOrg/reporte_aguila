import type { CommunityOrg } from '../../types'

export const community: CommunityOrg[] = [
  {
    id: 'club-musica',
    name: 'Club de Música Águila',
    type: 'club',
    description:
      'Ensayos abiertos de banda, coro y ensamble acústico. Espacio para músicos de todos los semestres.',
    contact: 'musica.fim@uas.edu.mx',
    eventIds: ['ev-talentos', 'ev-festival-primavera'],
  },
  {
    id: 'club-teatro',
    name: 'Taller de Teatro FIM',
    type: 'club',
    description:
      'Montajes escénicos y lectura dramatizada. Bienvenidas todas las carreras de la facultad.',
    contact: 'teatro.fim@uas.edu.mx',
    eventIds: ['ev-muestra-teatro'],
  },
  {
    id: 'club-foto',
    name: 'Círculo de Fotografía',
    type: 'club',
    description:
      'Salidas fotográficas por Mochis y exposición anual de los trabajos de la comunidad.',
    contact: 'foto.fim@uas.edu.mx',
    eventIds: ['ev-expo-foto'],
  },
  {
    id: 'club-robotica',
    name: 'Club de Robótica',
    type: 'club',
    description:
      'Diseño y construcción de robots para competencias regionales. Talleres de electrónica y programación.',
    contact: 'robotica.fim@uas.edu.mx',
    eventIds: ['ev-torneo-robotica'],
  },
  {
    id: 'team-futbol',
    name: 'Águilas Fútbol',
    type: 'sports',
    description: 'Equipo representativo de fútbol de la FIM. Entrenamientos y torneos interfacultades.',
    contact: 'futbol.fim@uas.edu.mx',
    eventIds: ['ev-interfacultades-futbol'],
  },
  {
    id: 'team-basquet',
    name: 'Águilas Basquetbol',
    type: 'sports',
    description: 'Selección de basquetbol varonil y femenil. Temporada de la liga universitaria.',
    contact: 'basquet.fim@uas.edu.mx',
    eventIds: ['ev-torneo-basquet'],
  },
  {
    id: 'team-voleibol',
    name: 'Águilas Voleibol',
    type: 'sports',
    description: 'Entrenamientos y partidos amistosos. Convocatoria abierta a nuevos integrantes.',
    contact: 'voleibol.fim@uas.edu.mx',
    eventIds: ['ev-torneo-voleibol'],
  },
  {
    id: 'org-cultura',
    name: 'Coordinación de Cultura FIM',
    type: 'organizer',
    description:
      'Organiza festivales, muestras artísticas y actividades de vinculación cultural para la facultad.',
    contact: 'cultura@fim.uas.edu.mx',
    eventIds: ['ev-talentos', 'ev-muestra-teatro', 'ev-expo-foto', 'ev-festival-primavera'],
  },
  {
    id: 'org-deportes',
    name: 'Coordinación de Deportes FIM',
    type: 'organizer',
    description:
      'Coordina las disciplinas deportivas, torneos internos y la representación de la facultad.',
    contact: 'deportes@fim.uas.edu.mx',
    eventIds: [
      'ev-interfacultades-futbol',
      'ev-torneo-basquet',
      'ev-torneo-voleibol',
      'ev-carrera-aguila',
    ],
  },
  {
    id: 'org-sociedad',
    name: 'Sociedad de Alumnos FIM',
    type: 'organizer',
    description:
      'Representa al estudiantado y organiza actividades de integración, bienvenida y servicio.',
    contact: 'sociedad.alumnos@fim.uas.edu.mx',
    eventIds: ['ev-bienvenida', 'ev-brigada-servicio', 'ev-cine-club'],
  },
]
