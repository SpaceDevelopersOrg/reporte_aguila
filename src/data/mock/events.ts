import type { FimEvent } from '../../types'

const day = 24 * 60 * 60 * 1000

const todayAt = (hour: number) => {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const updated = new Date(Date.now() - day).toISOString()

export const events: FimEvent[] = [
  {
    id: 'ev-club-literatura',
    title: 'Sesión del Club de Literatura',
    description:
      'Encuentro del Club de Literatura para compartir lecturas, comentar textos y proponer las próximas obras del círculo. Abierto a toda la comunidad FIM.',
    category: 'cultural',
    startsAt: todayAt(16),
    endsAt: todayAt(17),
    location: 'Aula 7',
    organizerId: 'org-reporte-aguila',
    tags: ['literatura', 'lectura', 'club'],
    updatedAt: updated,
  },
  {
    id: 'ev-sesion-basquet',
    title: 'Sesión de Basquetbol',
    description:
      'Entrenamiento y partido amistoso de basquetbol en la Cancha de la FIM. Trae tu uniforme y ven a apoyar al equipo Águilas.',
    category: 'sports',
    startsAt: todayAt(18),
    endsAt: todayAt(19),
    location: 'Cancha de la FIM',
    organizerId: 'org-reporte-aguila',
    tags: ['basquetbol', 'entrenamiento'],
    updatedAt: updated,
  },
]
