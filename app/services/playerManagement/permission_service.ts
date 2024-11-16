import Permission from '#models/permission'
import RoleService from '#services/playerManagement/role_service'
import User from '#models/user'
import Role from '#models/role'
import logger from '@adonisjs/core/services/logger'

export default class PermissionService {
  private static wildcard = '*'
  private static scope = ':'
  private static scopeWildcard = this.scope + this.wildcard

  public static async userCan(user: User, ...perms: string[]): Promise<boolean> {
    let userMustHaveperms: Permission[] = []
    let userHasRight = false

    for (const perm of perms) {
      userMustHaveperms.concat(await this.resolvPerm(perm))
    }
    if (userMustHaveperms.length === 0) return false
    const userPerms: Permission[] = await this.fetchUserPerms(user)

    if (userPerms.length === 0) return false

    for (const reqPerm of userMustHaveperms) {
      let test = userPerms.find((o) => o.name === reqPerm.name)
      if (test === null) return false
      else userHasRight = true
    }

    return userHasRight
  }

  public static async getPermissionFromString(perm: string): Promise<Permission[]> {
    return await this.resolvPerm(perm)
  }

  public static getPermissionIdFromPermissionList(perms: Permission[]): number[] {
    let permsId: number[] = []

    perms.map((perm) => {
      permsId.push(perm.id)
    })
    return permsId
  }

  private static async resolvPerm(perm: string): Promise<Permission[]> {
    perm = perm.normalize('NFD').replace(/[^*:a-zA-z]/gim, '')
    let perms: Permission[] = []

    //TODO implement caching

    if (perm === this.wildcard)
      perms = perms.concat(await Permission.query().where('name', this.wildcard))
    else if (perm.endsWith(this.scopeWildcard))
      perms = perms.concat(
        await Permission.query().whereLike('name', perm.replace(this.scopeWildcard, ''))
      )
    else perms = perms.concat(await Permission.query().where('name', perm))

    return perms
  }

  private static async fetchUserPerms(user: User): Promise<Permission[]> {
    //TODO implement caching

    let perms: Permission[] = []
    const roles = await RoleService.getUserRoles(user)
    roles.map(async (role) => perms.concat(await RoleService.getRolePerm(role)))

    return perms
  }
}
