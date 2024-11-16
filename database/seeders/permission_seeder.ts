import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Permission from '#models/permission'
import Role from '#models/role'
import RoleService from '#services/playerManagement/role_service'

export default class extends BaseSeeder {
  async run() {
    await this.createRoles('user', 'moderator', 'administrator')
    await this.createPerms(
      '*',
      'ticket:viewAll',
      'ticket:view',
      'ticket:close',
      'ticket:write',
      'ticket:open'
    )

    const user = await Role.findBy('name', 'user')
    const modo = await Role.findBy('name', 'moderator')
    const admin = await Role.findBy('name', 'administrator')

    if (user === null || modo === null || admin === null) return

    await RoleService.addPermsToRole(user, ['ticket:view', 'ticket:open'])
    await RoleService.addPermToRole(modo, 'ticket:*')
    await RoleService.addPermToRole(admin, '*')
  }

  async createPerms(...names: string[]) {
    let perms: Object[] = []

    names.forEach((name) =>
      perms.push({
        name: name,
      })
    )

    await Permission.createMany(perms)
  }

  async createRoles(...names: string[]) {
    let roles: Object[] = []

    names.forEach((name) =>
      roles.push({
        name: name,
      })
    )

    await Role.createMany(roles)
  }
}
