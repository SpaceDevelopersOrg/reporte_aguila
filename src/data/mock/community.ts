import type { CommunityOrg } from '../../types'

export const community: CommunityOrg[] = [
  {
    id: 'com-basquet',
    name: 'Comunidad de Basquetbol',
    type: 'sports',
    description:
      'Jugadoras y jugadores de basquetbol de la FIM. Entrenamientos, partidos amistosos y representación de la facultad.',
    contact: 'basquet.fim@uas.edu.mx',
    eventIds: ['ev-sesion-basquet'],
  },
  {
    id: 'com-voleibol',
    name: 'Comunidad de Voleibol',
    type: 'sports',
    description:
      'Equipo abierto de voleibol de la facultad. Sesiones recreativas y encuentros amistosos.',
    contact: 'voleibol.fim@uas.edu.mx',
    eventIds: [],
  },
  {
    id: 'com-literarios',
    name: 'Comunidad de Ingenieros Literarios',
    type: 'club',
    description:
      'Círculo de lectura y escritura de la FIM, vinculado al Club de Literatura. Comparte textos y participa en los encuentros.',
    contact: 'literatura.fim@uas.edu.mx',
    eventIds: ['ev-club-literatura'],
  },
]
