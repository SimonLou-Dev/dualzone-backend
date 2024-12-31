import Ticket from '#models/ticket'
import User from '#models/user'
import { BaseEvent } from '@adonisjs/core/events'
import transmit from "@adonisjs/transmit/services/main";

export default class TicketMessageSended extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public ticket: Ticket,
    public sender: User,
    public message: string
  ) {
    super()
    transmit.broadcast(`tickets/${ticket.id}`, {
      event: 'ticketMessageSent',
      data: { ticketId: ticket.id, message: message, sender: sender.pseudo },
    })
  }
}
