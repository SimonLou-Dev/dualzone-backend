import User from '#models/user'
import Role from '#models/role'
import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user'
import RoleService from '#services/playerManagement/role_service'
import { SanctionFactory } from '#database/factories/sanction_factory'
import Sanction from '#models/sanction'

test.group('Sanction api ressource test', (group) => {
  let admin = new User()
  let user = new User()
  let adminRole: Role | null = null

  group.setup(async () => {
    admin = await UserFactory.create()
    user = await UserFactory.create()
    adminRole = await Role.findBy('name', 'administrator')
    if (adminRole === null) throw new Error('Admin role not found')
    await RoleService.addUserRole(admin, adminRole)
  })

  test('List sanction (as admin)', async ({ client }) => {
    let player = await UserFactory.create()
    await SanctionFactory.merge([
      {
        userId: player.id,
        adminId: admin.id,
      },
      {
        userId: player.id,
        adminId: admin.id,
      },
      {
        userId: player.id,
        adminId: admin.id,
      },
    ]).createMany(3)

    const req = await client.get(`/users/${player.id}/sanctions`).loginAs(admin)
    req.assertStatus(200)
  })

  test('List sanction (as user)', async ({ client }) => {
    let player = await UserFactory.create()
    await SanctionFactory.merge([
      {
        userId: player.id,
        adminId: admin.id,
      },
      {
        userId: player.id,
        adminId: admin.id,
      },
      {
        userId: player.id,
        adminId: admin.id,
      },
    ]).createMany(3)

    const req = await client.get(`/users/${player.id}/sanctions`).loginAs(user)
    req.assertStatus(403)
  })

  test('Add warn (as admin)', async ({ client }) => {
    let player = await UserFactory.create()
    const reason = 'Comportement inapproprié'

    const req = await client
      .post(`users/${player.id}/sanctions/warn`)
      .loginAs(admin)
      .json({ reason })
    req.assertStatus(200)
  })

  test('Add warn (as user)', async ({ client }) => {
    let player = await UserFactory.create()
    const reason = 'Comportement inapproprié'

    const req = await client
      .post(`users/${player.id}/sanctions/warn`)
      .loginAs(user)
      .json({ reason })
    req.assertStatus(403)
  })

  test('Add ban (as admin)', async ({ client }) => {
    let player = await UserFactory.create()
    const reason = 'Comportement inapproprié'

    const req = await client
      .post(`users/${player.id}/sanctions/ban`)
      .loginAs(admin)
      .json({ reason, duration: 1 })
    req.assertStatus(200)
  })

  test('Add ban (as user)', async ({ client }) => {
    let player = await UserFactory.create()
    const reason = 'Comportement inapproprié'

    const req = await client
      .post(`users/${player.id}/sanctions/ban`)
      .loginAs(user)
      .json({ reason, duration: 1 })
    req.assertStatus(403)
  })

  test('Update sanction (as admin)', async ({ client }) => {
    let sanction: Sanction = await SanctionFactory.with('user').with('admin').create()
    const reason = 'Comportement inapproprié'

    const req = await client
      .put(`/sanctions/${sanction.id}`)
      .loginAs(admin)
      .json({ reason, duration: 1 })
    req.assertStatus(200)
  })

  test('Update sanction (as user)', async ({ client }) => {
    let sanction: Sanction = await SanctionFactory.with('user').with('admin').create()
    const reason = 'Comportement inapproprié'

    const req = await client
      .put(`/sanctions/${sanction.id}`)
      .loginAs(user)
      .json({ reason, duration: 1 })
    req.assertStatus(403)
  })

  test('Delete sanction (as admin)', async ({ client }) => {
    let sanction: Sanction = await SanctionFactory.with('user').with('admin').create()
    const reason = 'Comportement inapproprié'

    const req = await client.delete(`/sanctions/${sanction.id}`).loginAs(admin).json({ reason })
    req.assertStatus(200)
  })

  test('Delete sanction (as user)', async ({ client }) => {
    let sanction: Sanction = await SanctionFactory.with('user').with('admin').create()
    const reason = 'Comportement inapproprié'

    const req = await client.delete(`/sanctions/${sanction.id}`).loginAs(user).json({ reason })
    req.assertStatus(403)
  })
})

test.group('Sanction api ressource test (unauthenticated)', (group) => {
  let user = new User()
  let sanction = new Sanction()

  group.setup(async () => {
    user = await UserFactory.create()
    sanction = await SanctionFactory.with('user').with('admin').create()
  })

  test('List sanction', async ({ client }) => {
    const req = await client.get(`/users/${user.id}/sanctions`)
    req.assertStatus(401)
  })

  test('Add wan', async ({ client }) => {
    const req = await client.post(`/users/${user.id}/sanctions/warn`)
    req.assertStatus(401)
  })

  test('Add ban', async ({ client }) => {
    const req = await client.post(`/users/${user.id}/sanctions/ban`)
    req.assertStatus(401)
  })

  test('Edit sanction', async ({ client }) => {
    const req = await client.put(`/sanctions/${sanction.id}`)
    req.assertStatus(401)
  })

  test('Delete sanction', async ({ client }) => {
    const req = await client.delete(`/sanctions/${sanction.id}`)
    req.assertStatus(401)
  })
})

test.group('Sanction api ressource test (validator)', (group) => {
  let admin = new User()
  let user = new User()
  let adminRole: Role | null = null

  group.setup(async () => {
    admin = await UserFactory.create()
    user = await UserFactory.create()
    adminRole = await Role.findBy('name', 'administrator')
    if (adminRole === null) throw new Error('Admin role not found')
    await RoleService.addUserRole(admin, adminRole)
  })

  test('Warn reason empty', async ({ client }) => {
    const req = await client.post(`users/${user.id}/sanctions/warn`).loginAs(admin).json({})
    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'reason',
          rule: 'required',
        },
      ],
    })
  })

  test('Warn reason lower thant prerequisites', async ({ client }) => {
    const req = await client
      .post(`users/${user.id}/sanctions/warn`)
      .loginAs(admin)
      .json({
        reason: 'a'.repeat(9),
      })
    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'reason',
          rule: 'minLength',
        },
      ],
    })
  })

  test('Warn reason greater thant prerequisites', async ({ client }) => {
    const req = await client
      .post(`users/${user.id}/sanctions/warn`)
      .loginAs(admin)
      .json({
        reason: 'a'.repeat(201),
      })
    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'reason',
          rule: 'maxLength',
        },
      ],
    })
  })

  test('Ban reason empty', async ({ client }) => {
    const req = await client
      .post(`users/${user.id}/sanctions/ban`)
      .loginAs(admin)
      .json({ duration: 1 })
    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'reason',
          rule: 'required',
        },
      ],
    })
  })

  test('Ban reason lower thant prerequisites', async ({ client }) => {
    const req = await client
      .post(`users/${user.id}/sanctions/ban`)
      .loginAs(admin)
      .json({
        reason: 'a'.repeat(9),
        duration: 1,
      })
    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'reason',
          rule: 'minLength',
        },
      ],
    })
  })

  test('Ban reason greater thant prerequisites', async ({ client }) => {
    const req = await client
      .post(`users/${user.id}/sanctions/ban`)
      .loginAs(admin)
      .json({
        reason: 'a'.repeat(201),
        duration: 1,
      })
    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'reason',
          rule: 'maxLength',
        },
      ],
    })
  })

  test('Ban duration empty', async ({ client }) => {
    const req = await client
      .post(`users/${user.id}/sanctions/ban`)
      .loginAs(admin)
      .json({ reason: 'a'.repeat(20) })
    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'duration',
          rule: 'required',
        },
      ],
    })
  })

  test('Update duration empty', async ({ client }) => {
    const req = await client
      .post(`users/${user.id}/sanctions/ban`)
      .loginAs(admin)
      .json({ reason: 'a'.repeat(20) })
    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'duration',
          rule: 'required',
        },
      ],
    })
  })

  test('Update reason empty', async ({ client }) => {
    const req = await client
      .post(`users/${user.id}/sanctions/ban`)
      .loginAs(admin)
      .json({ duration: 1 })
    req.assertStatus(422)
    req.assertBodyContains({
      errors: [
        {
          field: 'reason',
          rule: 'required',
        },
      ],
    })
  })
})
