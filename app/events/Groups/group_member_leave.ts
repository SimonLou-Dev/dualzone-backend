import { BaseEvent } from '@adonisjs/core/events'
import User from '#models/user'
import Group from '#models/group'
import transmit from '@adonisjs/transmit/services/main'

export default class GroupMemberLeave extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public user: User,
    public group: Group
  ) {
    super()
    transmit.broadcast(`group/${group.id}`, {
      event: 'groupMemberLeaved',
      data: { groupId: group.id, member: user.pseudo },
    })

    group.members.forEach((member) => {
      transmit.broadcast(`users/${member.id}/notify`, {
        message: `${user.pseudo} a quitté le groupe`,
      })
    })
  }
}
