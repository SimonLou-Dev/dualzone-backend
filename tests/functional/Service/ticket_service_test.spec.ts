import { test } from '@japa/runner'
import User from '#models/user'
import { UserFactory } from '#database/factories/user'
import TicketService from '#services/playerManagement/ticket_service'
import emitter from '@adonisjs/core/services/emitter'
import TicketCreated from '#events/Tickets/ticket_created'
import TicketMemberJoined from '#events/Tickets/ticket_member_joined'
import TicketMessageSended from '#events/Tickets/ticket_message_sended'
import { TicketFactory } from '#database/factories/ticket_factory'
import TicketClosed from '#events/Tickets/ticket_closed'
import Ticket from '#models/ticket'

test.group('Ticket service test', () => {
  test('Create ticket', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    let user: User = await UserFactory.create()
    await TicketService.createTicket(user, 'title', 'message')
    event.assertEmitted(TicketCreated)
    event.assertEmitted(TicketMemberJoined)
    event.assertEmitted(TicketMessageSended)
  })
  test('Add member to ticket', async ({ cleanup }) => {
    let user: User = await UserFactory.create()
    let ticket = await TicketFactory.with('sender').create()
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    await TicketService.addMember(ticket, user)

    event.assertEmitted(TicketMemberJoined)
  })
  test('Send message to ticket', async ({ cleanup }) => {
    let ticket = await TicketFactory.with('sender').with('members', 1).create()
    await ticket.load('members')
    let user: User = ticket.members[1]
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    await TicketService.sendMessage(ticket, user, 'message')

    event.assertEmitted(TicketMessageSended)
  })
  test('Send message to ticket with non member user', async ({ cleanup, assert }) => {
    let ticket = await TicketFactory.with('sender').create()
    let user: User = await UserFactory.create()
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    try {
      await TicketService.sendMessage(ticket, user, 'message')
    } catch (error) {
      assert.isTrue(error.name === 'UserNotBelongsToTicketException')
    }

    event.assertNotEmitted(TicketMessageSended)
  })

  test('Get all my ticket', async ({ assert }) => {
    let ticket = await TicketFactory.with('sender', 1).create()
    await ticket.load('sender')
    let tickets = await TicketService.getAllMyTicket(ticket.sender)
    assert.equal(tickets.length, 1)
  })

  test('Terminate ticket', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })
    let ticket = await TicketFactory.with('sender').create()
    await ticket.load('sender')
    await TicketService.closeTicket(ticket)
    await ticket.load('members')
    event.assertEmitted(TicketClosed)
  })

  test('Get all ticket but some are terminated', async ({ assert }) => {
    let user: User = await UserFactory.create()
    await TicketFactory.merge({ senderId: user.id }).createMany(2)
    await TicketFactory.apply('terminated').with('sender', 1).create()

    let tickets = await TicketService.getAllMyTicket(user)
    assert.equal(tickets.length, 2)
  })

  test('Get all admin ticket', async ({ assert }) => {
    let tickets = await Ticket.query().where('terminated', false)
    let admin = await TicketService.getAdminTicket()

    assert.equal(tickets.length, admin.length)
  })

  test('Get ticket', async ({ assert }) => {
    let ticket = await TicketFactory.with('sender').with('messages', 5).with('members', 2).create()
    await ticket.load('messages')
    await ticket.load('members')
    let ticketByService = await TicketService.getTicket(ticket.id)

    assert.equal(ticketByService.id, ticket.id)
    assert.equal(ticketByService.messages.length, ticket.messages.length)
    assert.equal(ticketByService.members.length, ticket.members.length)
  })
})
