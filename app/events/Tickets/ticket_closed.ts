import Ticket from '#models/ticket'
import { BaseEvent } from '@adonisjs/core/events'

export default class TicketClosed extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public ticket: Ticket) {
    super()
  }
}