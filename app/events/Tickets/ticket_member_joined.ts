import Ticket from '#models/ticket'
import User from '#models/user'
import { BaseEvent } from '@adonisjs/core/events'

export default class TicketMemberJoined extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public member: User,
    public ticket: Ticket
  ) {
    super()
  }
}
