import factory from '@adonisjs/lucid/factories'
import TicketMessage from '#models/ticket_message'
import { UserFactory } from '#database/factories/user'

export const TicketMessageFactory = factory
  .define(TicketMessage, async ({ faker }) => {
    let user = await UserFactory.create()

    return {
      message: faker.lorem.lines(2),
      senderId: user.id,
    }
  })
  .build()
