import factory from '@adonisjs/lucid/factories'
import Ticket from '#models/ticket'
import { UserFactory } from '#database/factories/user'
import { TicketMessageFactory } from '#database/factories/ticket_message_factory'
import TicketMessage from '#models/ticket_message'
import User from '#models/user'
import { FactoryContextContract } from '@adonisjs/lucid/types/factory'

export const TicketFactory = factory
  .define(Ticket, async ({ faker }) => {
    return {
      title: faker.book.title(),
    }
  })
  .state('terminated', (ticket) => (ticket.terminated = true))
  .relation('sender', () => UserFactory)
  .relation('messages', () => TicketMessageFactory)
  .relation('members', () => UserFactory)
  .after('create', async (_facto, model, ctx) => {
    //Parse message and check
    await createFirstMessage(model, ctx)
    await checkIfCreatorIsMember(model)
    await CheckIfTicketMessageSendersAreMembers(model)
  })
  .build()

const createFirstMessage = async (ticket: Ticket, ctx: FactoryContextContract) => {
  await ticket.load('sender')
  let user = ticket.sender
  let message = new TicketMessage()
  message.message = ctx.faker.lorem.lines(2)
  message.senderId = user.id
  await ticket.related('messages').save(message)
}

const checkIfCreatorIsMember = async (ticket: Ticket) => {
  await ticket.load('sender')
  await ticket.load('members')
  let sender: User = ticket.sender
  let members: User[] = ticket.members
  if (!members.includes(sender)) {
    ticket.related('members').attach([sender.id])
  }
}

const CheckIfTicketMessageSendersAreMembers = async (model: Ticket) => {
  await model.load('messages')
  await model.load('members')
  let messages: TicketMessage[] = model.messages

  for (let message of messages) {
    await message.load('sender')

    if (!model.members.includes(message.sender)) {
      model.related('members').attach([message.sender.id])
    }
  }
}
