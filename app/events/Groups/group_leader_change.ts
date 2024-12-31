import { BaseEvent } from '@adonisjs/core/events'
import Group from '#models/group'
import transmit from "@adonisjs/transmit/services/main";

export default class GroupLeaderChange extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public group: Group) {
    super()
    group.members.forEach((member) => {
      transmit.broadcast(`users/${member.id}/group`, {
        event: 'groupLeaderChanged',
        data: { groupId: group.id, leader: group.leader.pseudo },
      })
      transmit.broadcast(`users/${member.id}/notify`, {
        message: 'Le leader du groupe est maintenant ' + group.leader.pseudo,
      })
    })
  }
}
