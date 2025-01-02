import Ticket from '#models/ticket'
import { BaseEvent } from '@adonisjs/core/events'
import transmit from '@adonisjs/transmit/services/main'

export default class TicketClosed extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public ticket: Ticket) {
    super()
    ticket.load('members')
    transmit.broadcast(`tickets/${ticket.id}`, {
      event: 'ticketClosed',
      data: { ticketId: ticket.id },
    })
    ticket.members.forEach((member) => {
      transmit.broadcast(`users/${member.id}/notify`, {
        message: 'Le ticket ' + ticket.title + ' a été fermé',
      })
    })
  }
}
