import Permission from '#models/permission'
import RoleService from '#services/playerManagement/role_service'
import User from '#models/user'

export default class PermissionService {
  private static wildcard = '*'
  private static scope = ':'
  private static scopeWildcard = this.scope + this.wildcard

  public static async userCan(user: User, ...perms: string[]): Promise<boolean> {
    //Initializing vars
    let userMustHaveperms: Permission[] = []
    let userHasRight = false

    //Resolve required perms
    for (const perm of perms) {
      userMustHaveperms = userMustHaveperms.concat(await this.resolvPerm(perm))
    }
    //Check if resolved perms has a size
    if (userMustHaveperms.length === 0) return false
    //Retrieve user perms
    const userPerms: Permission[] = await this.fetchUserPerms(user)

    //Check if user has at least 1 perm
    if (userPerms.length === 0) return false
    //Check for wildcar perm
    let userHasWildcard = userPerms.find((o) => o.name === '*') !== undefined
    if (userHasWildcard) return true

    //Check perm One by One
    for (const reqPerm of userMustHaveperms) {
      let test = userPerms.find((o) => o.id === reqPerm.id)

      if (test !== undefined) userHasRight = true
      else return false
    }

    return userHasRight
  }

  public static async getAllUserPermsString(user: User): Promise<string[]> {
    let perms: Permission[] = await this.fetchUserPerms(user)
    let permsString: string[] = []

    perms.map((perm) => {
      permsString.push(perm.name)
    })
    return permsString
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
        await Permission.query().whereLike('name', perm.replace(this.scopeWildcard, '%'))
      )
    else perms = perms.concat(await Permission.query().where('name', perm))

    return perms
  }

  private static async fetchUserPerms(user: User): Promise<Permission[]> {
    //TODO implement caching

    let perms: Permission[] = []
    const roles = await RoleService.getUserRoles(user)
    for (const role of roles) perms = perms.concat(await RoleService.getRolePerm(role))

    return perms
  }
}
