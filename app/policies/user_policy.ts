import User from '#models/user'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import PermissionService from '#services/playerManagement/permission_service'

export default class UserPolicy extends BasePolicy {
  view(user: User, target: User): AuthorizerResponse {
    if (user.id === target.id) return true
    else return PermissionService.userCan(user, 'user:view')
  }

  @allowGuest()
  create() {
    return true
  }

  update(user: User, target: User): AuthorizerResponse {
    if (user.id === target.id) return true
    else return PermissionService.userCan(user, 'user:edit')
  }

  delete(): AuthorizerResponse {
    return false
  }

  viewAny(user: User): AuthorizerResponse {
    return PermissionService.userCan(user, 'user:list')
  }
}
