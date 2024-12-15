import { Exception } from '@adonisjs/core/exceptions'
import User from '#models/user'
import Ticket from '#models/ticket'

export default class UserNotBelongsToTicketException extends Exception {
  constructor(player: User, ticket: Ticket) {
    super(`User ${player.id} isn't member of ticket ${ticket.id}`)
  }

  static status = 500
}
