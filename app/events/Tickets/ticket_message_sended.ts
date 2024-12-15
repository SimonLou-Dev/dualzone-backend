import Ticket from '#models/ticket'
import User from '#models/user'
import { BaseEvent } from '@adonisjs/core/events'

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
  }
}
