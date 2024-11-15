import Permission from '#models/permission'
import { array } from '@adonisjs/validator/build/src/validations/primitives/array.js'

export default class PermissionService {
  private static wildcard = '*'
  private static scope = ':'

  public static async userCan(permission: string): Promise<boolean> {



    return false
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
    perm = perm.normalize('NFD').replace(/[^*:]/gim, '')
    let perms: Permission[] = []

    if (perm.localeCompare(this.wildcard)) perms.concat(await Permission.query().where('name', '*'))
    else if (perm.endsWith(':*'))
      perms.concat(await Permission.query().whereLike('name', perm.replace(':*', '')))
    else perms.concat(await Permission.query().where('name', perm))

    return perms
  }

  private static async fetchUserPerms(user: User){
    
  }
}
