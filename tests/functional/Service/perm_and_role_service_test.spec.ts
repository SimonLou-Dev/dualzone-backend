import { test } from '@japa/runner'
import PermissionService from '#services/playerManagement/permission_service'
import Permission from '#models/permission'
import logger from "@adonisjs/core/services/logger";

test.group('Perm and role service test', (group) => {
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
})
