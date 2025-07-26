import User from '#models/user'
import Role from '#models/role'
import Permission from '#models/permission'
import UserRolesChanged from '#events/Permissions/user_roles_changed'
import PermissionService from '#services/playerManagement/permission_service'
import RolesUpdated from '#events/Permissions/roles_updated'

export default class RoleService {
  public static async setUserRole(user: User, role: Role) {
    await user.load('roles')

    const uRoles = await user.roles

    for (const uRole of uRoles) {
      await user.related('roles').detach([uRole.id])
    }
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
    await user.load('roles')
    return user.roles
  }

  public static async getRolePerm(role: Role): Promise<Permission[]> {
    await role.load('permissions')
    return role.permissions
  }

  public static async addPermsToRole(role: Role, ...perms: string[]) {
    for (const perm of perms) {
      let permsModel = await PermissionService.getPermissionFromString(perm)

      const permsId = PermissionService.getPermissionIdFromPermissionList(permsModel)

      for (const item of permsId) {
        await role.related('permissions').attach([item])
      }
    }
    await role.save()
    await RolesUpdated.dispatch(role)
  }

  public static async removePermsToRole(role: Role, ...perms: string[]) {
    for (const perm of perms) {
      let permsModel = await PermissionService.getPermissionFromString(perm)

      const permsId = PermissionService.getPermissionIdFromPermissionList(permsModel)

      for (const item of permsId) {
        await role.related('permissions').detach([item])
      }
    }
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
