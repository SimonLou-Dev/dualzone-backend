import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Permission from '#models/permission'
import Role from '#models/role'
import RoleService from '#services/playerManagement/role_service'

export default class extends BaseSeeder {
  async run() {
    /*
     *
     * Dans ce fichier nous pouvons déclarer les roles et les permissions
     *
     */

    //Création des roles
    await this.createRoles('user', 'moderator', 'administrator')
    //Récupération des roles
    const admin = await Role.findBy('name', 'administrator')
    const user = await Role.findBy('name', 'user')
    const modo = await Role.findBy('name', 'moderator')
    if (user === null || modo === null || admin === null) return

    /*
     * Création des permissions
     * Cette list doit être exhaustive
     * Elle doit contenir le wildcard global (*)
     * Mais elle ne doit pas contenir les wildcard scopé (ticket:*)
     */
    await this.createPerms(
      '*',
      'ticket:viewAll',
      'ticket:view',
      'ticket:close',
      'ticket:write',
      'ticket:open',
      'user:view',
      'user:list',
      'user:edit'
    )

    //Assignation des permissions par role
    await RoleService.addPermsToRole(admin, '*')
    await RoleService.addPermsToRole(modo, 'ticket:*')
    await RoleService.addPermsToRole(user, 'ticket:view', 'ticket:open')
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
