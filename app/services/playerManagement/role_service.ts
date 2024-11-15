import User from '#models/user'
import Role from '#models/role'
import Permission from '#models/permission'
import UserRolesChanged from '#events/Permissions/user_roles_changed'
import PermissionService from '#services/playerManagement/permission_service'
import RolesUpdated from '#events/Permissions/roles_updated'

export default class RoleService {
  public static async setUserRole(user: User, role: Role) {
    user.roles.map(async (cRole) => {
      await user.related('roles').detach([cRole.id])
    })
    await user.related('roles').attach([role.id])
    await user.save()
    await UserRolesChanged.dispatch(user)
  }

  public static async addUserRole(user: User, role: Role) {
    await user.related('roles').attach([role.id])
    await user.save()
    await UserRolesChanged.dispatch(user)
  }

  public static async removeUserRole(user: User, role: Role) {
    await user.related('roles').detach([role.id])
    await user.save()
    await UserRolesChanged.dispatch(user)
  }

  public static async getUserRoles(user: User): Promise<Role[]> {
    return user.roles
  }

  public static async getRolePerm(role: Role): Promise<Permission[]> {
    return role.permissions
  }

  public static async addPermToRole(role: Role, perm: string) {
    var perms = await PermissionService.getPermissionFromString(perm)
    await role
      .related('permissions')
      .attach(PermissionService.getPermissionIdFromPermissionList(perms))
    await role.save()
    await RolesUpdated.dispatch(role)
  }

  public static async addPermsToRole(role: Role, perms: string[]) {
    let permsList: Permission[] = []
    perms.map(async (perm) =>
      permsList.concat(await PermissionService.getPermissionFromString(perm))
    )
    await role
      .related('permissions')
      .attach(PermissionService.getPermissionIdFromPermissionList(permsList))
    await role.save()
    await RolesUpdated.dispatch(role)
  }

  public static async removePermToRole(role: Role, perm: string) {
    var perms = await PermissionService.getPermissionFromString(perm)
    await role
      .related('permissions')
      .detach(PermissionService.getPermissionIdFromPermissionList(perms))
    await role.save()
    await RolesUpdated.dispatch(role)
  }

  public static async removePermsToRole(role: Role, perms: string[]) {
    let permsList: Permission[] = []
    perms.map(async (perm) =>
      permsList.concat(await PermissionService.getPermissionFromString(perm))
    )
    await role
      .related('permissions')
      .detach(PermissionService.getPermissionIdFromPermissionList(permsList))
    await role.save()
    await RolesUpdated.dispatch(role)
  }

  public static async heritPermToRole(source: Role, target: Role) {
    await this.clearRolePerms(target)
    await target
      .related('permissions')
      .attach(PermissionService.getPermissionIdFromPermissionList(source.permissions))
    await target.save()
    await RolesUpdated.dispatch(target)
  }

  public static async clearRolePerms(role: Role) {
    await role
      .related('permissions')
      .detach(PermissionService.getPermissionIdFromPermissionList(role.permissions))
    await role.save()
    await RolesUpdated.dispatch(role)
  }
}
