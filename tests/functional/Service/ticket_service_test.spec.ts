import { test } from '@japa/runner'
import User from '#models/user'
import { UserFactory } from '#database/factories/user'
import TicketService from '#services/playerManagement/ticket_service'
import Ticket from '#models/ticket'
import emitter from '@adonisjs/core/services/emitter'
import TicketCreated from '#events/playerManager/ticket_created'
import TicketMemberJoined from '#events/playerManager/ticket_member_joined'
import TicketMessageSended from '#events/playerManager/ticket_message_sended'

test.group('Ticket service test', () => {
  test('Create ticket', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    let user: User = await UserFactory.create()
    let ticket = await TicketService.createTicket(user, 'title', 'message')
    event.assertEmitted(TicketCreated)
    event.assertEmitted(TicketMemberJoined)
    event.assertEmitted(TicketMessageSended)
  })
  test('Add member to ticket', async ({ cleanup }) => {
    let user: User = await UserFactory.create()
    let user2: User = await UserFactory.create()
    let ticket = await TicketService.createTicket(user2, 'title', 'message')
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    await TicketService.addMember(ticket, user)

    event.assertEmitted(TicketMemberJoined)
  })
  test('Send message to ticket', async ({ cleanup }) => {
    let user: User = await UserFactory.create()
    let ticket = await TicketService.createTicket(user, 'title', 'message')
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    await TicketService.sendMessage(ticket, user, 'message')

    event.assertEmitted(TicketMessageSended)

  })
})
