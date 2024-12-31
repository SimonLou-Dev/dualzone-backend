// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TicketService from '#services/playerManagement/ticket_service'
import User from '#models/user'
import {addMemberValidator, createTicketMessageValidator, createTicketValidator} from '#validators/ticket'
import TicketPolicy from '#policies/ticket_policy'
import Ticket from '#models/ticket'

export default class TicketsController {
  /**
   * Display a list of resource
   */
  async index({ response, auth }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    return response.json(await TicketService.getAllTicket(user))
  }

  /**
   * Handle form submission for the create action
   */
  async store({ response, auth, request }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    const payload = await request.validateUsing(createTicketValidator)
    const ticket = await TicketService.createTicket(user, payload.title, payload.message)
    return response.json(ticket)
  }

  /**
   * Show individual record
   */
  async show({ response, params, bouncer }: HttpContextContract) {
    const ticket = await TicketService.getTicket(params.id)
    await bouncer.with(TicketPolicy).authorize('show', ticket)
    await this.loadTicket(ticket)
    return response.json(ticket)
  }

  /**
   * Handle form submission for the edit action
   */
  async postMessage({ response, auth, params, bouncer, request }: HttpContextContract) {
    const ticket = await TicketService.getTicket(params.id)
    const user: User = auth.getUserOrFail()
    const payload = await request.validateUsing(createTicketMessageValidator)
    await bouncer.with(TicketPolicy).authorize('write', ticket)
    await TicketService.sendMessage(ticket, user, payload.message)
    await this.loadTicket(ticket)
    return response.json(ticket)
  }

  async addMember({ response, params, bouncer, request }: HttpContextContract) {
    const ticket = await TicketService.getTicket(params.id)
    const data = await request.validateUsing(addMemberValidator)
    await bouncer.with(TicketPolicy).authorize('addMember', ticket)
    await TicketService.addMember(ticket, data.userId)
    await this.loadTicket(ticket)
    return response.json(ticket)
  }

  /**
   * Delete record
   */
  async close({ params, bouncer, response }: HttpContextContract) {
    const ticket = await TicketService.getTicket(params.id)
    await TicketService.closeTicket(ticket)
    await bouncer.with(TicketPolicy).authorize('close', ticket)
    return response.json(ticket)
  }

  private async loadTicket(ticket: Ticket) {
    await ticket.load('members')
    await ticket.load('sender')
    await ticket.load('messages')
    ticket.messages.forEach((message) => {
      message.load('sender')
    })
    ticket.messages.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())
  }
}
