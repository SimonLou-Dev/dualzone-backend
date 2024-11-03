import { test } from '@japa/runner'
import emitter from '@adonisjs/core/services/emitter'
import GroupCreated from '#events/playerManager/group_created'
import GroupMemberJoin from '#events/playerManager/group_member_join'
import User from '#models/user'
import GroupMemberLeave from '#events/playerManager/group_member_leave'
import GroupLeaderChange from '#events/playerManager/group_leader_change'
import GroupDelete from '#events/playerManager/group_delete'
import Group from '#models/group'
import GroupService from '#services/system/group_service'
import { GroupFactory } from '#database/factories/group'
import { UserFactory } from '#database/factories/user'
// @ts-ignore
import logger from '@adonisjs/core/services/logger'
import PlayerAlreadyGroupedException from "#exceptions/Service/PlayerManagement/player_already_grouped_exception";
import PlayerIsNotGroupedException from "#exceptions/Service/PlayerManagement/player_is_not_grouped_exception";

test.group('Service Player Management grouping system - normal', () => {
  //Test if we can create group
  test('Create group', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    //Creating test user
    let user = await UserFactory.create()

    //Request group creation
    await GroupService.createGroup(user)
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

    //Create test group
    let JoinGroup = await GroupFactory.with('leader').create()
    //Create an other user
    let user = await UserFactory.create()

    //Request adding user to group
    await GroupService.addMember(JoinGroup, user)

    event.assertEmitted(GroupMemberJoin)
  })

  test('Change leader', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })
    //Create group with user
    let LeaderGroup = await GroupFactory.with('leader').with('members', 2).create()
    // @ts-ignore
    let NewLeader: User = LeaderGroup.$preloaded.members[1]

    //Request adding user to group
    await GroupService.changeLeader(LeaderGroup, NewLeader)

    event.assertEmitted(GroupLeaderChange)
  })

  test('Leave group', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })
    //Create group with user
    let LeaverGroup = await GroupFactory.with('leader').with('members', 2).create()
    // @ts-ignore
    let NewLeaver: User = LeaverGroup.$preloaded.members[1]
    await GroupService.removeMember(LeaverGroup, NewLeaver)

    event.assertEmitted(GroupMemberLeave)
  })

  test('Dissolve group', async ({ cleanup }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })
    let DissolveGroup = await GroupFactory.with('leader').with('members', 2).create()

    await GroupService.deleteGroup(DissolveGroup)

    event.assertEmitted(GroupDelete)
  })
})

test.group('Service Player Management grouping system - enforcing', () => {
  //Test if we can create group

  test('Create group but leader is already groupped', async ({ cleanup, assert }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    //Creating test user
    let GroupCreateEnforceing = await GroupFactory.with('leader').with('members', 1).create()
    // @ts-ignore
    let UserGroupCreateEnforceing: User = GroupCreateEnforceing.$preloaded.members[0]

    //Request group creation
    try {
      await GroupService.createGroup(UserGroupCreateEnforceing)
    } catch (error) {
      assert.isTrue(error.name === "PlayerAlreadyGroupedException")
    }

    //Assert event of group  creation and player join was emitted
    event.assertNotEmitted(GroupCreated)
    event.assertNotEmitted(GroupMemberJoin)
  })

  test('Join group but user is already groupped', async ({ cleanup, assert }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    //Creating test user
    let JoinerGroupEnforcing = await GroupFactory.with('leader').with('members', 1).create()
    let JoiningGroupEnforcing = await GroupFactory.with('leader').create()
    // @ts-ignore
    let UserJoinerGroupEnforcing: User = JoinerGroupEnforcing.$preloaded.members[0]

    //Request group creation
    try {
      await GroupService.addMember(JoiningGroupEnforcing, UserJoinerGroupEnforcing)
    } catch (error) {
      assert.isTrue(error.name === "PlayerAlreadyGroupedException")
    }

    //Assert event of group  creation and player join was emitted
    event.assertNotEmitted(GroupMemberJoin)
  })

  test('Leave group but user is not groupped', async ({ cleanup, assert }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    //Creating test user
    let UserLeaverGroupEnforcing = await UserFactory.create()
    let LeaverGroupEnforcing = await GroupFactory.with('leader').with('members', 1).create()



    //Request group creation
    try {
      await GroupService.removeMember(LeaverGroupEnforcing, UserLeaverGroupEnforcing)
    } catch (error) {
      assert.isTrue(error.name === "PlayerIsNotGroupedException")
    }

    //Assert event of group  creation and player join was emitted
    event.assertNotEmitted(GroupMemberLeave)
  })

  test('Change Leader but not groupped', async ({ cleanup, assert }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    //Creating test user
    let UserLeaverGroupEnforcing = await UserFactory.create()
    let LeaverGroupEnforcing = await GroupFactory.with('leader').with('members', 1).create()



    //Request group creation
    try {
      await GroupService.changeLeader(LeaverGroupEnforcing, UserLeaverGroupEnforcing)
    } catch (error) {
      assert.isTrue(error.name === "PlayerIsNotInSameGroupException")
    }

    //Assert event of group  creation and player join was emitted
    event.assertNotEmitted(GroupMemberLeave)
  })
  /*
  test('Change Leader but in other group', async ({ cleanup, assert }) => {
    const event = emitter.fake()
    cleanup(() => {
      emitter.restore()
    })

    //Creating test user

    let ChangeLeaverGroupEnforcing = await GroupFactory.with('leader').with('members', 1).create()
    let ChangeLeaver1GroupEnforcing = await GroupFactory.with('leader').with('members', 1).create()
    // @ts-ignore
    let ChangeUserLeaver1GroupEnforcing: User = ChangeLeaver1GroupEnforcing.$preloaded.members[0]



    //Request group creation
    try {
      await GroupService.removeMember(ChangeLeaverGroupEnforcing, ChangeUserLeaver1GroupEnforcing)
    } catch (error) {
      assert.isTrue(error.name === "PlayerIsNotInSameGroupException")
    }

    //Assert event of group  creation and player join was emitted
    event.assertNotEmitted(GroupMemberLeave)
  })
   */



})
