import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user'
import Role from '#models/role'
import RoleService from '#services/playerManagement/role_service'
import { TicketFactory } from '#database/factories/ticket_factory'
import Ticket from '#models/ticket'
import User from '#models/user'
import { randomUUID } from 'node:crypto'

test.group('Ticket api resource test', (group) => {
  let user = new User()
  let admin = new User()
  let adminRole: Role | null = null

  group.setup(async () => {
    user = await UserFactory.create()
    admin = await UserFactory.create()
    adminRole = await Role.findBy('name', 'administrator')
    if (adminRole === null) throw new Error('Admin role not found')
    await RoleService.addUserRole(admin, adminRole)
  })

  test('Retrieve all ticket (as other user)', async ({ client, assert }) => {
    await TicketFactory.with('sender').create()

    const req = await client.get('/tickets').loginAs(user)

    req.assertStatus(200)
    assert.equal(req.response.body.length, 0)
  })

  test('Retrieve all ticket (as user)', async ({ client, assert }) => {
    let ticket: Ticket = await TicketFactory.with('sender').create()
    const req = await client.get('/tickets').loginAs(ticket.sender)

    req.assertStatus(200)
    req.assertBodyContains([
      {
        id: ticket.id,
      },
    ])
    assert.equal(req.response.body.length, 1)
  })

  test('Retrieve all ticket (as admin)', async ({ client }) => {
    const tickets = await Ticket.query().where('terminated', false)
    const count = tickets.length

    const req = await client.get('/tickets').loginAs(admin)

    req.assertStatus(200)
    req.assertBodyContains([
      {
        id: tickets[count - 1].id,
      },
    ])
  })

  test('Retrieve specific ticket (as other user)', async ({ client }) => {
    const ticket = await TicketFactory.with('sender').create()

    const req = await client.get(`/tickets/${ticket.id}`).loginAs(user)

    req.assertStatus(403)
  })

  test('Retrieve specific ticket (as user)', async ({ client }) => {
    let ticket: Ticket = await TicketFactory.with('sender').create()
    const req = await client.get(`/tickets/${ticket.id}`).loginAs(ticket.sender)

    req.assertStatus(200)
    req.assertBodyContains({
      id: ticket.id,
    })
  })

  test('Retrieve specific ticket (as member)', async ({ client }) => {
    let ticket: Ticket = await TicketFactory.with('sender').with('members', 2).create()
    let memberNotSender = new User()
    ticket.members.forEach((tmember) => {
      if (tmember.id !== undefined && tmember.id !== ticket.senderId) {
        memberNotSender = tmember
        return
      }
    })

    const req = await client.get(`/tickets/${ticket.id}`).loginAs(memberNotSender)

    req.assertStatus(200)
    req.assertBodyContains({
      id: ticket.id,
    })
  })

  test('Retrieve specific ticket (as admin)', async ({ client }) => {
    let ticket: Ticket = await TicketFactory.with('sender').create()

    const req = await client.get(`/tickets/${ticket.id}`).loginAs(admin)

    req.assertStatus(200)
    req.assertBodyContains({
      id: ticket.id,
    })
  })

  test('Create ticket', async ({ client }) => {
    const req = await client.post('/tickets').loginAs(user).json({
      message: "I'm a ticket",
      title: 'Je suis un titre',
    })

    req.assertStatus(200)
  })

  test('Add message (as sender)', async ({ client }) => {
    const ticket = await TicketFactory.with('sender').create()
    await ticket.load('sender')

    const req = await client.put(`tickets/${ticket.id}/message`).loginAs(ticket.sender).json({
      message: "I'm a new message",
    })

    req.assertStatus(200)
    req.assertBodyContains({
      id: ticket.id,
    })
  })

  test('Add message (as member)', async ({ client }) => {
    const ticket = await TicketFactory.with('sender').with('members', 2).create()
    await ticket.load('members')

    let memberNotSender = new User()
    ticket.members.forEach((tmember) => {
      if (tmember.id !== ticket.senderId) {
        memberNotSender = tmember
        return
      }
    })

    const req = await client.put(`tickets/${ticket.id}/message`).loginAs(memberNotSender).json({
      message: "I'm a new message for a member",
    })

    req.assertStatus(200)
    req.assertBodyContains({
      id: ticket.id,
    })
  })

  test('Add message (as non member)', async ({ client }) => {
    const ticket = await TicketFactory.with('sender').with('members', 2).create()

    const req = await client.put(`tickets/${ticket.id}/message`).loginAs(user).json({
      message: "I'm a new message for a non member",
    })

    req.assertStatus(403)
  })

  test('Add message (as admin)', async ({ client }) => {
    const ticket = await TicketFactory.with('sender').with('members', 2).create()

    const req = await client.put(`tickets/${ticket.id}/message`).loginAs(admin).json({
      message: "I'm a new message for a admin member",
    })

    req.assertStatus(200)
    req.assertBodyContains({
      id: ticket.id,
    })
  })

  test('Add member (as sender)', async ({ client }) => {
    const ticket = await TicketFactory.with('sender').create()
    const member = await UserFactory.create()
    await ticket.load('sender')

    const req = await client.put(`tickets/${ticket.id}/add-member`).loginAs(ticket.sender).json({
      userId: member.id,
    })

    req.assertStatus(200)
    req.assertBodyContains({
      id: ticket.id,
      members: [
        {
          id: member.id,
        },
      ],
    })
  })

  test('Add member (as member)', async ({ client }) => {
    const ticket = await TicketFactory.with('sender').with('members', 2).create()
    const member = await UserFactory.create()
    await ticket.load('members')

    let memberNotSender = new User()
    ticket.members.forEach((tmember) => {
      if (tmember.id !== ticket.senderId) {
        memberNotSender = tmember
        return
      }
    })

    const req = await client.put(`tickets/${ticket.id}/add-member`).loginAs(memberNotSender).json({
      userId: member.id,
    })

    req.assertStatus(403)
  })

  test('Add member (as non member)', async ({ client }) => {
    const ticket = await TicketFactory.with('sender').with('members', 2).create()
    const member = await UserFactory.create()

    const req = await client.put(`tickets/${ticket.id}/add-member`).loginAs(user).json({
      userId: member.id,
    })

    req.assertStatus(403)
  })

  test('Add member (as admin)', async ({ client }) => {
    const ticket = await TicketFactory.with('sender').with('members', 2).create()
    const member = await UserFactory.create()

    const req = await client.put(`tickets/${ticket.id}/add-member`).loginAs(admin).json({
      userId: member.id,
    })

    req.assertStatus(200)
    req.assertBodyContains({
      id: ticket.id,
      members: [
        {
          id: member.id,
        },
      ],
    })
  })

  test('Close ticket (as other user)', async ({ client }) => {
    const ticket = await TicketFactory.with('sender').create()

    const req = await client.patch(`/tickets/${ticket.id}`).loginAs(user)

    req.assertStatus(403)
  })

  test('Close ticket (as user)', async ({ client }) => {
    let ticket: Ticket = await TicketFactory.with('sender').create()
    const req = await client.patch(`/tickets/${ticket.id}`).loginAs(ticket.sender)

    req.assertStatus(200)
    req.assertBodyContains({
      id: ticket.id,
    })
  })

  test('Close ticket (as member)', async ({ client }) => {
    let ticket: Ticket = await TicketFactory.with('sender').with('members', 2).create()
    let memberNotSender = new User()
    ticket.members.forEach((tmember) => {
      if (tmember.id !== undefined && tmember.id !== ticket.senderId) {
        memberNotSender = tmember
        return
      }
    })

    const req = await client.patch(`/tickets/${ticket.id}`).loginAs(memberNotSender)

    req.assertStatus(403)
  })

  test('Close ticket (as admin)', async ({ client }) => {
    let ticket: Ticket = await TicketFactory.with('sender').create()

    const req = await client.patch(`/tickets/${ticket.id}`).loginAs(admin)

    req.assertStatus(200)
    req.assertBodyContains({
      id: ticket.id,
    })
  })

  test('Create ticket (as user)', async ({ client }) => {
    const req = await client.post('/tickets').loginAs(user).json({
      message: "I'm a ticket",
      title: 'Je suis un titre',
    })

    req.assertStatus(200)
    req.assertBodyContains({
      title: 'Je suis un titre',
      messages: [
        {
          message: "I'm a ticket",
        },
      ],
      sender: {
        id: user.id,
      },
      members: [
        {
          id: user.id,
        },
      ],
    })
  })
})

test.group('Ticket api resource test (not authed)', (group) => {
  let ticket = new Ticket()

  group.setup(async () => {
    ticket = await TicketFactory.with('sender').create()
  })

  test('Retrieve all ticket', async ({ client }) => {
    const req = await client.get('/tickets')

    req.assertStatus(401)
  })

  test('Retrieve specific ticket', async ({ client }) => {
    const req = await client.get(`/tickets/${ticket.id}`)

    req.assertStatus(401)
  })

  test('Add member to a ticket', async ({ client }) => {
    const req = await client.put(`/tickets/${ticket.id}/add-member`)

    req.assertStatus(401)
  })

  test('Add message to a ticket', async ({ client }) => {
    const req = await client.put(`/tickets/${ticket.id}/message`)

    req.assertStatus(401)
  })

  test('Close a ticket', async ({ client }) => {
    const req = await client.patch(`/tickets/${ticket.id}`)

    req.assertStatus(401)
  })

  test('Create a ticket', async ({ client }) => {
    const req = await client.post(`/tickets`)

    req.assertStatus(401)
  })
})

test.group('Ticket api resource test (validator)', (group) => {
  let admin = new User()
  let adminRole: Role | null = null
  let ticket = new Ticket()

  group.setup(async () => {
    admin = await UserFactory.create()
    adminRole = await Role.findBy('name', 'administrator')
    ticket = await TicketFactory.with('sender').create()
    if (adminRole === null) throw new Error('Admin role not found')
    await RoleService.addUserRole(admin, adminRole)
  })

  test('Create ticket minLength test ', async ({ client }) => {
    const req = await client.post('/tickets').loginAs(admin).json({
      message: 'a',
      title: 'Je',
    })

    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'message',
          rule: 'minLength',
        },
        {
          field: 'title',
          rule: 'minLength',
        },
      ],
    })
  })

  test('Create ticket maxLength test ', async ({ client }) => {
    const req = await client
      .post('/tickets')
      .loginAs(admin)
      .json({
        message: 'a'.repeat(20),
        title: 'a'.repeat(201),
      })

    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'title',
          rule: 'maxLength',
        },
      ],
    })
  })

  test('Add ticket message minLength test ', async ({ client }) => {
    const req = await client
      .put(`/tickets/${ticket.id}/message`)
      .loginAs(admin)
      .json({
        message: 'a'.repeat(9),
      })

    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'message',
          rule: 'minLength',
        },
      ],
    })
  })

  test('Add ticket member validator test ', async ({ client }) => {
    const requuid = await client
      .put(`/tickets/${ticket.id}/add-member`)
      .loginAs(admin)
      .json({
        userId: 'a'.repeat(9),
      })

    requuid.assertStatus(422)
    requuid.assertBodyContains({
      errors: [
        {
          field: 'userId',
          rule: 'uuid',
        },
      ],
    })

    let fakeuuid = randomUUID()
    let userFake = await User.findBy('id', fakeuuid)
    while (userFake !== null) {
      fakeuuid = randomUUID()
      userFake = await User.findBy('id', fakeuuid)
    }

    const reqUsernotexist = await client
      .put(`/tickets/${ticket.id}/add-member`)
      .loginAs(admin)
      .json({
        userId: fakeuuid,
      })

    reqUsernotexist.assertStatus(422)
    reqUsernotexist.assertBodyContains({
      errors: [
        {
          field: 'userId',
          rule: 'database.exists',
        },
      ],
    })
  })
})
