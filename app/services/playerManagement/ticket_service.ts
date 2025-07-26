import TicketCreated from '#events/Tickets/ticket_created'
import TicketMemberJoined from '#events/Tickets/ticket_member_joined'
import TicketMessageSended from '#events/Tickets/ticket_message_sended'
import Ticket from '#models/ticket'
import User from '#models/user'
import TicketMessage from '#models/ticket_message'
import PermissionService from '#services/playerManagement/permission_service'
import UserNotBelongsToTicketException from '#exceptions/Service/PlayerManagement/user_not_belongs_to_ticket_exception'
import TicketClosed from '#events/Tickets/ticket_closed'

export default class TicketService {
  public static async createTicket(user: User, title: string, message: string) {
    let ticket = await Ticket.create({
      title,
      senderId: user.id,
    })
    await this.addMember(ticket, user)
    await this.sendMessage(ticket, user, message)
    await ticket.load('members')
    await ticket.load('messages')
    await ticket.load('sender')
    await TicketCreated.dispatch(ticket, user)
    return ticket
  }
  public static async addMember(ticket: Ticket, user: User) {
    await ticket.load('members')
    let membersid = ticket.members.map((member) => member.id)

    if (membersid.includes(user.id)) {
      return
    }

    await ticket.related('members').attach([user.id])
    await ticket.save()
    await TicketMemberJoined.dispatch(user, ticket)
  }
  public static async sendMessage(ticket: Ticket, user: User, message: string) {
    await ticket.load('members')
    let membersid = ticket.members.map((member) => member.id)
    if (
      !membersid.includes(user.id) &&
      !(await PermissionService.userCan(user, 'ticket:viewAll'))
    ) {
      throw new UserNotBelongsToTicketException(user, ticket)
    }

    let msg: TicketMessage = new TicketMessage()
    msg.message = message
    msg.senderId = user.id

    await ticket.related('messages').save(msg)
    await ticket.save()
    await TicketMessageSended.dispatch(ticket, user, message)
  }

  public static async getAllMyTicket(user: User): Promise<Ticket[]> {
    let tickets = await Ticket.query()
      .where('terminated', false)
      .whereHas('members', (builder) => {
        builder.where('sender_id', user.id)
      })

    return tickets
  }

  public static async closeTicket(ticket: Ticket) {
    ticket.terminated = true
    await ticket.save()
    await TicketClosed.dispatch(ticket)
  }

  public static async getAllTicket(user: User): Promise<Ticket[]> {
    let tickets: Ticket[] = []
    if (await PermissionService.userCan(user, 'ticket:viewAll'))
      tickets = await Ticket.query().where('terminated', false)
    else {
      tickets = await this.getAllMyTicket(user)
    }
    return tickets
  }

  public static async getTicket(ticketId: number) {
    let ticket = await Ticket.findOrFail(ticketId)
    await ticket.load('messages')
    await ticket.load('members')
    for (let message of ticket.messages) {
      await message.load('sender')
    }
    return ticket
  }

  public static async getAdminTicket(): Promise<Ticket[]> {
    let tickets = await Ticket.query().where('terminated', false)
    return tickets
  }
}
