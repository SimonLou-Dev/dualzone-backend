import { test } from '@japa/runner'
import PermissionService from '#services/playerManagement/permission_service'
import Permission from '#models/permission'
import { UserFactory } from '#database/factories/user'
import Role from '#models/role'
import RoleService from '#services/playerManagement/role_service'

test.group('Perm and role service test', () => {
  test('Check String to perm conversion basic', async ({ assert }) => {
    let perm = await Permission.findBy('name', 'ticket:viewAll')
    if (perm === null) {
      assert.isTrue(false, 'Migration not runned')
      return
    }

    const finded = await PermissionService.getPermissionFromString('ticket:viewAll')

    assert.isTrue(finded.length === 1)
    assert.isTrue(finded[0].id === perm.id)
  })

  test('Check String to perm conversion scope Wildcard', async ({ assert }) => {
    let perm = await Permission.query().whereLike('name', 'ticket%')
    if (perm === null) {
      assert.isTrue(false, 'Migration not runned')
      return
    }

    const finded = await PermissionService.getPermissionFromString('ticket:*')

    assert.isTrue(finded.length === perm.length)
    assert.equal(JSON.stringify(perm), JSON.stringify(finded))
  })

  test('Check String to perm conversion Wildcard', async ({ assert }) => {
    let perm = await Permission.findBy('name', '*')
    if (perm === null) {
      assert.isTrue(false, 'Migration not runned')
      return
    }
    const finded = await PermissionService.getPermissionFromString('*')
    assert.isTrue(finded.length === 1)
    assert.isTrue(perm.id === finded[0].id)
  })

  test('Check perm resolution through role basics', async ({ assert }) => {
    let user = await UserFactory.create()
    let role = await Role.findBy('name', 'user')
    if (role === null) {
      assert.isTrue(false, 'Migration not runned')
      return
    }
    await RoleService.setUserRole(user, role)
    await role.load('permissions')

    assert.isTrue(await PermissionService.userCan(user, 'ticket:open'))
    assert.isTrue(await PermissionService.userCan(user, 'ticket:open', 'ticket:view'))

    assert.isFalse(await PermissionService.userCan(user, 'ticket:write'))
    assert.isFalse(await PermissionService.userCan(user, 'ticket:view', 'ticket:write'))
    assert.isFalse(await PermissionService.userCan(user, 'ticket:*'))
    assert.isFalse(await PermissionService.userCan(user, '*'))
  })

  test('Check perm resolution through role scope Wildcard', async ({ assert }) => {
    let user = await UserFactory.create()
    let role = await Role.findBy('name', 'moderator')
    if (role === null) {
      assert.isTrue(false, 'Migration not runned')
      return
    }
    await RoleService.setUserRole(user, role)
    await role.load('permissions')

    assert.isTrue(await PermissionService.userCan(user, 'ticket:open'))
    assert.isTrue(await PermissionService.userCan(user, 'ticket:viewAll', 'ticket:close'))
    assert.isTrue(await PermissionService.userCan(user, 'ticket:*'))

    assert.isFalse(await PermissionService.userCan(user, '*'))
  })

  test('Check perm resolution through role Wildcard', async ({ assert }) => {
    let user = await UserFactory.create()
    let role = await Role.findBy('name', 'administrator')
    if (role === null) {
      assert.isTrue(false, 'Migration not runned')
      return
    }
    await RoleService.setUserRole(user, role)
    await role.load('permissions')

    assert.isTrue(await PermissionService.userCan(user, 'ticket:open'))
    assert.isTrue(await PermissionService.userCan(user, 'ticket:viewAll', 'ticket:close'))
    assert.isTrue(await PermissionService.userCan(user, 'ticket:*'))
    assert.isTrue(await PermissionService.userCan(user, '*'))
  })
})
