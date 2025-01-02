import Ticket from '#models/ticket'
import User from '#models/user'
import { BaseEvent } from '@adonisjs/core/events'
import transmit from '@adonisjs/transmit/services/main'

export default class TicketMemberJoined extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public member: User,
    public ticket: Ticket
  ) {
    super()
    ticket.load('members')

    transmit.broadcast(`tickets/${ticket.id}`, {
      event: 'ticketMemberJoined',
      data: { ticketId: ticket.id, member: member.pseudo },
    })

    ticket.members.forEach((tmember) => {
      if (tmember.id !== this.member.id)
        transmit.broadcast(`users/${tmember.id}/notify`, {
          message: this.member.pseudo + ' a été ajouté au ticket ' + ticket.title,
        })
      else
        transmit.broadcast(`users/${tmember.id}/notify`, {
          message: 'Vous avez rejoint le ticket ' + ticket.title,
        })
    })
  }
}
