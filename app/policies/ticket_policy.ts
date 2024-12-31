import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import PermissionService from '#services/playerManagement/permission_service'
import Ticket from '#models/ticket'

export default class TicketPolicy extends BasePolicy {
  index(user: User): AuthorizerResponse {
    return PermissionService.userCan(user, 'ticket:viewAll')
  }

  show(user: User, target: Ticket): AuthorizerResponse {
    target.load('members')
    target.load('sender')

    if (target.members.map((member) => member.id).includes(user.id)) return true
    else if (target.sender.id === user.id) return true
    else return PermissionService.userCan(user, 'ticket:viewAll')
  }

  addMember(user: User, target: Ticket): AuthorizerResponse {
    target.load('sender')

    if (target.sender.id === user.id) return true
    else return PermissionService.userCan(user, 'ticket:viewAll')
  }

  close(user: User, target: Ticket): AuthorizerResponse {
    target.load('sender')

    if (target.sender.id === user.id) return true
    else return PermissionService.userCan(user, 'ticket:close')
  }

  write(user: User, target: Ticket): AuthorizerResponse {
    target.load('members')
    target.load('sender')

    if (target.members.map((member) => member.id).includes(user.id)) return true
    else if (target.sender.id === user.id) return true
    else return PermissionService.userCan(user, 'ticket:write')
  }
}
