import TicketCreated from "#events/playerManager/ticket_created";
import TicketMemberJoined from "#events/playerManager/ticket_member_joined";
import TicketMessageSended from "#events/playerManager/ticket_message_sended";
import Ticket from "#models/ticket";
import User from "#models/user";

export default class TicketService {
    public static async createTicket(user: User, title: string, message: string){
        let ticket = await Ticket.create({
            title, senderId: user.id
        })
            await this.addMember(ticket, user)
            await this.sendMessage(ticket, user, message)
            await ticket.load("members")
            await ticket.load("messages")
            await ticket.load("sender")
            await TicketCreated.dispatch(ticket, user)
            return ticket
    }
    public static async addMember(ticket: Ticket, user: User){
        await ticket.related("members").attach([user.id])
        await ticket.save()
        await TicketMemberJoined.dispatch(user, ticket)
    }
    public static async sendMessage(ticket: Ticket, user: User, message: string){
        await ticket.related("messages").attach({
            [user.id]: {
                message,
            }
        })
        await ticket.save()
        await TicketMessageSended.dispatch(ticket, user, message)
    }
}