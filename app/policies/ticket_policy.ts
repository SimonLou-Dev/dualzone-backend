import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import PermissionService from '#services/playerManagement/permission_service'
import Ticket from '#models/ticket'

export default class TicketPolicy extends BasePolicy {
  async index(user: User): Promise<AuthorizerResponse> {
    return await PermissionService.userCan(user, 'ticket:viewAll')
  }

  async show(user: User, target: Ticket): Promise<AuthorizerResponse> {
    await target.load('members')
    await target.load('sender')


    if (target.members.map((member) => member.id).includes(user.id)) return true
    else if (target.sender.id === user.id) return true
    else return await PermissionService.userCan(user, 'ticket:viewAll')
  }

  async addMember(user: User, target: Ticket): Promise<AuthorizerResponse> {
    await target.load('sender')

    if (target.sender.id === user.id) return true
    else return await PermissionService.userCan(user, 'ticket:viewAll')
  }

  async close(user: User, target: Ticket): Promise<AuthorizerResponse> {
    await target.load('sender')

    if (target.sender.id === user.id) return true
    else return await PermissionService.userCan(user, 'ticket:close')
  }

  async write(user: User, target: Ticket): Promise<AuthorizerResponse> {
    await target.load('members')
    await target.load('sender')

    if (target.members.map((member) => member.id).includes(user.id)) return true
    else if (target.sender.id === user.id) return true
    else return await PermissionService.userCan(user, 'ticket:write')
  }
}
