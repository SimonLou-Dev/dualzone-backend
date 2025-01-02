import { test } from '@japa/runner'
import User from '#models/user'
import { UserFactory } from '#database/factories/user'
import db from '@adonisjs/lucid/services/db'
import Role from '#models/role'
import RoleService from '#services/playerManagement/role_service'
import logger from '@adonisjs/core/services/logger'
import emitter from '@adonisjs/core/services/emitter'
import FriendRequestAccepted from '#events/Friends/friend_request_accepted'

test.group('Friends Controller Tests', (group) => {
  let otherUser = new User()
  let admin = new User()
  let adminRole: Role | null = null

  group.setup(async () => {
    admin = await UserFactory.create()
    otherUser = await UserFactory.create()
    adminRole = await Role.findBy('name', 'administrator')
    if (adminRole === null) throw new Error('Admin role not found')
    await RoleService.addUserRole(admin, adminRole)
  })

  test('Get list of friends (as user) [empty]', async ({ client }) => {
    let user = await UserFactory.create()
    const response = await client.get('/friends').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      friends: [],
      friendRequestSent: [],
      friendRequestReceived: [],
    })
  })

  test('Get list of friends (as user) [request, friends]', async ({ client }) => {
    let user = await UserFactory.create()
    // Create a friend relationship
    await db
      .table('player_has_friends')
      .insert([{ user_id: user.id, friend_id: otherUser.id, accepted: true }])

    // Create another user who sent a friend request
    const requestingUser = await UserFactory.create()
    await db
      .table('player_has_friends')
      .insert([{ user_id: requestingUser.id, friend_id: user.id, accepted: false }])

    const response = await client.get('/friends').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({
      friends: [
        {
          id: otherUser.id,
        },
      ],
      friendRequestSent: [],
      friendRequestReceived: [
        {
          id: requestingUser.id,
        },
      ],
    })
  })

  test('Send friend request', async ({ client }) => {
    let user = await UserFactory.create()

    const response = await client.post('/friends').loginAs(user).json({
      userId: otherUser.id,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      friends: [],
      friendRequestSent: [
        {
          id: otherUser.id,
        },
      ],
      friendRequestReceived: [],
    })
  })

  test('Send friend request (on existing request)', async ({ client, assert }) => {
    let user = await UserFactory.create()
    // Create existing friendship
    await db
      .table('player_has_friends')
      .insert([{ user_id: user.id, friend_id: otherUser.id, accepted: false }])

    const response = await client.post('/friends').loginAs(user).json({
      userId: otherUser.id,
    })

    response.assertStatus(200)
    const friendships = await db
      .from('player_has_friends')
      .where('user_id', user.id)
      .where('friend_id', otherUser.id)

    assert.equal(friendships.length, 1)
  })

  test('Send friend request accepts existing friend request', async ({
    client,
    assert,
    cleanup,
  }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    let user = await UserFactory.create()
    // Create existing friend request from other user
    await db
      .table('player_has_friends')
      .insert([{ user_id: otherUser.id, friend_id: user.id, accepted: false }])

    const response = await client.post('/friends').loginAs(user).json({
      userId: otherUser.id,
    })

    response.assertStatus(200)
    event.assertEmitted(FriendRequestAccepted)

    // Verify both friendship records exist and are accepted
    const friendships = await db
      .from('player_has_friends')
      .whereIn('user_id', [user.id, otherUser.id])
      .whereIn('friend_id', [user.id, otherUser.id])

    assert.equal(friendships.length, 2)
    logger.warn(response.body)
    response.assertBodyContains({
      friends: [
        {
          id: otherUser.id,
        },
      ],
      friendRequestSent: [],
      friendRequestReceived: [],
    })
  })

  test('Accept friend request', async ({ client, assert }) => {
    let user = await UserFactory.create()

    // Create pending friend request
    await db
      .table('player_has_friends')
      .insert([{ user_id: otherUser.id, friend_id: user.id, accepted: false }])

    const response = await client.patch(`/friends/${otherUser.id}`).loginAs(user)

    response.assertStatus(200)

    // Verify friendship is now mutual and accepted
    const friendships = await db
      .from('player_has_friends')
      .whereIn('user_id', [user.id, otherUser.id])
      .whereIn('friend_id', [user.id, otherUser.id])

    assert.equal(friendships.length, 2)
    assert.isTrue(friendships.every((f) => f.accepted))
  })

  test('Destroy removes friendship', async ({ client, assert }) => {
    let user = await UserFactory.create()
    // Create accepted friendship
    await db.table('player_has_friends').insert([
      { user_id: user.id, friend_id: otherUser.id, accepted: true },
      { user_id: otherUser.id, friend_id: user.id, accepted: true },
    ])

    const response = await client.delete(`/friends/${otherUser.id}`).loginAs(user)

    response.assertStatus(200)

    // Verify all friendship records are removed
    const friendships = await db
      .from('player_has_friends')
      .whereIn('user_id', [user.id, otherUser.id])
      .whereIn('friend_id', [user.id, otherUser.id])

    assert.equal(friendships.length, 0)
  })

  test('destroy rejects friend request', async ({ client, assert }) => {
    let user = await UserFactory.create()
    // Create pending friend request
    await db
      .table('player_has_friends')
      .insert([{ user_id: otherUser.id, friend_id: user.id, accepted: false }])

    const response = await client.delete(`/friends/${otherUser.id}`).loginAs(user)

    response.assertStatus(200)

    // Verify request is removed
    const friendships = await db
      .from('player_has_friends')
      .where('user_id', otherUser.id)
      .where('friend_id', user.id)

    assert.equal(friendships.length, 0)
  })

  test('validates user exists when sending request', async ({ client }) => {
    let user = await UserFactory.create()
    const response = await client.post('/friends').loginAs(user).json({
      userId: 'non-existent-id',
    })

    response.assertStatus(422)
  })

  test('prevents self-friend requests', async ({ client }) => {
    let user = await UserFactory.create()
    const response = await client.post('/friends').loginAs(user).json({
      userId: user.id,
    })

    response.assertStatus(422)
  })
  test('requires authentication for all endpoints', async ({ client }) => {
    const responses = await Promise.all([
      client.get('/friends'),
      client.post('/friends').json({ userId: '1' }),
      client.patch('/friends/1'),
      client.delete('/friends/1'),
    ])

    responses.forEach((response) => {
      response.assertStatus(401)
    })
  })
})
