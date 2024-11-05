import factory from '@adonisjs/lucid/factories'
import Ticket from '#models/ticket'

export const TicketFactory = factory
  .define(Ticket, async ({ faker }) => {
    return {}
  })
  .build()
