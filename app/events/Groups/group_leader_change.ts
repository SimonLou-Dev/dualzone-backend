import { BaseEvent } from '@adonisjs/core/events'
import Group from '#models/group'
import transmit from '@adonisjs/transmit/services/main'

export default class GroupLeaderChange extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public group: Group) {
    super()

    transmit.broadcast(`group/${group.id}`, {
      event: 'groupLeaderChanged',
      data: { groupId: group.id, leader: group.leader.pseudo },
    })

    group.members.forEach((member) => {
      transmit.broadcast(`users/${member.id}/notify`, {
        message: 'Le leader du groupe est maintenant ' + group.leader.pseudo,
      })
    })
  }
}
