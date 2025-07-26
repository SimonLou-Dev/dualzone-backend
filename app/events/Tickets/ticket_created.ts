import Ticket from '#models/ticket'
import User from '#models/user'
import { BaseEvent } from '@adonisjs/core/events'
import transmit from '@adonisjs/transmit/services/main'

export default class TicketCreated extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public ticket: Ticket,
    public user: User
  ) {
    super()
    transmit.broadcast(`users/${user.id}/notify`, {
      message: 'Vôtre ticket a été crée',
    })
  }
}
