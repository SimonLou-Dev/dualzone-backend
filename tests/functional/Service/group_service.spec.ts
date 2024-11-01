import { test } from '@japa/runner'
import GroupService from '#services/System/GroupService'
import emitter from '@adonisjs/core/services/emitter'
import GroupCreated from '#events/playerManager/group_created'
import GroupMemberJoin from '#events/playerManager/group_member_join'
import { GroupFactory } from '#database/factories/group'
import { UserFactory } from '#database/factories/user'
import User from '#models/user'
import GroupMemberLeave from '#events/playerManager/group_member_leave'
import GroupLeaderChange from '#events/playerManager/group_leader_change'
import GroupDelete from '#events/playerManager/group_delete'

const michelSteamId = '4563'
const benoitSteamId = '87516'

const michel = await User.firstOrCreate(
  {
    steamId: michelSteamId,
  },
  {
    pseudo: 'michel',
    steamToken: 'test',
    userImage: 'test',
  }
)

const benoit = await User.firstOrCreate(
  {
    steamId: benoitSteamId,
  },
  {
    pseudo: 'Benoit',
    steamToken: 'test',
    userImage: 'test',
  }
)

let group = null

test.group('Service Player Management grouping system', () => {
  //Test if we can create group
  test('Create group', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })
    //Request group creation
    group = await GroupService.createGroup(michel)

    //Assert event of group  creation and player join was emitted
    event.assertEmitted(GroupCreated)
    event.assertEmitted(GroupMemberJoin)
  })
  //Test if we can join a group
  test('Join group', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    await GroupService.addMember(group, benoit)

    event.assertEmitted(GroupMemberJoin)
  })

  test('Change leader', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    await GroupService.changeLeader(group, benoit)

    event.assertEmitted(GroupLeaderChange)
  })

  test('Leave group', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    await GroupService.removeMember(group, michel)

    event.assertEmitted(GroupMemberLeave)
  })

  test('Dissolve group', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    await GroupService.deleteGroup(group)

    event.assertEmitted(GroupDelete)
  })
})
