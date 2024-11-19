import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user'
import Role from '#models/role'
import RoleService from '#services/playerManagement/role_service'

test.group('User resource test', async () => {
  const user = await UserFactory.create()
  const admin = await UserFactory.create()
  const adminRole = await Role.findBy('name', 'administrator')
  if (adminRole === null) throw new Error('Admin role not found')
  await RoleService.addUserRole(admin, adminRole)

  test('Getting Authed user infos', async ({ client }) => {
    const req = await client.get('/auth').loginAs(user)

    req.assertStatus(200)
    req.assertBodyContains({
      user: {
        id: user.id,
      },
    })
  })

  test('Update current user (as user)', async ({ client }) => {
    const req = await client
      .put('/users/' + user.id)
      .loginAs(user)
      .json({
        id: user.id,
        pseudo: 'glegle',
        steamId: user.steamId,
        trustScore: user.trustScore,
        userImage: user.userImage,
      })

    req.assertStatus(200)
    req.assertBodyContains({
      id: user.id,
    })
  })

  test('Update other user (as user)', async ({ client }) => {
    const req = await client
      .put('/users/' + admin.id)
      .loginAs(user)
      .json({
        id: admin.id,
        pseudo: 'glegle',
        steamId: user.steamId,
        trustScore: user.trustScore,
        userImage: user.userImage,
      })

    req.assertStatus(403)
  })

  test('Update other user (as user)', async ({ client }) => {
    const req = await client
      .put('/users/' + user.id)
      .loginAs(admin)
      .json({
        id: user.id,
        pseudo: 'gleglegle',
        steamId: user.steamId,
        trustScore: user.trustScore,
        userImage: user.userImage,
      })

    req.assertStatus(200)
  })

  test('Getting all users (as user)', async ({ client }) => {
    const req = await client.get('/users').loginAs(user)

    req.assertStatus(403)
  })

  test('Getting all users (as admin)', async ({ client }) => {
    const req = await client.get('/users').loginAs(admin)

    req.assertStatus(200)
  })

  test('Getting other user by id (as user)', async ({ client }) => {
    const req = await client.get('/users/' + admin.id).loginAs(user)

    req.assertStatus(403)
  })

  test('Getting other user by id (as admin)', async ({ client }) => {
    const req = await client.get('/users/' + user.id).loginAs(admin)

    req.assertStatus(200)
  })
})

test.group('User resource test (not authed)', async () => {
  const user = await UserFactory.create()

  test('Getting Authed user infos (NA)', async ({ client }) => {
    const req = await client.get('/auth')

    req.assertStatus(401)
  })

  test('Update user (NA)', async ({ client }) => {
    const req = await client.put('/users/' + user.id).json({
      id: user.id,
      pseudo: 'glegle',
      steamId: user.steamId,
      trustScore: user.trustScore,
      userImage: user.userImage,
    })

    req.assertStatus(401)
  })

  test('Getting all users (NA)', async ({ client }) => {
    const req = await client.get('/users')

    req.assertStatus(401)
  })
})
