import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import PermissionService from '#services/playerManagement/permission_service'

export default class SanctionPolicy extends BasePolicy {
  async list(user: User): Promise<AuthorizerResponse> {
    return await PermissionService.userCan(user, 'sanction:viewAll')
  }

  async warn(user: User): Promise<AuthorizerResponse> {
    return await PermissionService.userCan(user, 'sanction:warn')
  }

  async banTemp(user: User): Promise<AuthorizerResponse> {
    return await PermissionService.userCan(user, 'sanction:ban:temp')
  }

  async banPerm(user: User): Promise<AuthorizerResponse> {
    return await PermissionService.userCan(user, 'sanction:ban:perm')
  }

  async update(user: User): Promise<AuthorizerResponse> {
    return await PermissionService.userCan(user, 'sanction:update')
  }

  async delete(user: User): Promise<AuthorizerResponse> {
    return await PermissionService.userCan(user, 'sanction:delete')
  }
}
