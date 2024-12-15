import User from '#models/user'
import Group from '#models/group'
import PlayerAlreadyGroupedException from '#exceptions/Service/PlayerManagement/player_already_grouped_exception'
import PlayerIsNotGroupedException from '#exceptions/Service/PlayerManagement/player_is_not_grouped_exception'
import PlayerIsNotInSameGroupException from '#exceptions/Service/PlayerManagement/player_is_not_in_same_group_exception'
import GroupCreated from '#events/Groups/group_created'
import GroupMemberJoin from '#events/Groups/group_member_join'
import GroupMemberLeave from '#events/Groups/group_member_leave'
import GroupLeaderChange from '#events/Groups/group_leader_change'
import GroupDelete from '#events/Groups/group_delete'

export default class GroupService {
  public static async createGroup(leader: User) {
    if (await this.playerIsGrouped(leader)) throw new PlayerAlreadyGroupedException(leader)

    let group = await Group.create({
      leaderId: leader.id,
      size: 1,
    })

    await this.addMember(group, leader)

    await GroupCreated.dispatch(leader, group)

    return group
  }

  public static async addMember(group: Group, member: User) {
    if (await this.playerIsGrouped(member)) throw new PlayerAlreadyGroupedException(member)
    group.related('members').attach([member.id])
    group.size += 1
    await group.save()
    await GroupMemberJoin.dispatch(member, group)
  }

  public static async removeMember(group: Group, member: User) {
    if (!(await this.playerIsGrouped(member))) {
      throw new PlayerIsNotGroupedException(member)
    }
    await group.related('members').detach([member.id])

    group.size -= 1
    await group.save()
    await GroupMemberLeave.dispatch(member, group)
  }

  public static async changeLeader(group: Group, newLeader: User) {
    if (newLeader.id === group.leaderId) return
    if (!(await this.playerIsInSameGroup(newLeader, group))) {
      throw new PlayerIsNotInSameGroupException(newLeader)
    }

    await group.related('leader').dissociate()
    await group.related('leader').associate(newLeader)
    await GroupLeaderChange.dispatch(group)
  }

  public static async deleteGroup(group: Group) {
    await group.delete()
    await GroupDelete.dispatch(group)
  }

  public static async getGroupOfPlayer(player: User): Promise<Group | null> {
    let group = await Group.query()
      .whereHas('members', (membersQ) => {
        membersQ.where('users.id', player.id)
      })
      .first()
    // @ts-ignore
    return group
  }

  private static async playerIsGrouped(user: User): Promise<boolean> {
    const check = await Group.query().whereHas('members', (membersQ) => {
      membersQ.where('users.id', user.id)
    })

    return check.length !== 0
  }

  private static async playerIsInSameGroup(user: User, group: Group): Promise<boolean> {
    const check = await Group.query()
      .where('groups.id', group.id)
      .whereHas('members', (membersQ) => {
        membersQ.where('users.id', user.id)
      })
    return check.length !== 0
  }
}
