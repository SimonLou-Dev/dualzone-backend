import { BaseEvent } from '@adonisjs/core/events'
import Group from '#models/group'
import transmit from '@adonisjs/transmit/services/main'

export default class GroupDelete extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public group: Group) {
    super()

    transmit.broadcast(`group/${group.id}`, {
      event: 'groupDeleted',
      data: { groupId: group.id },
    })

    group.members.forEach((member) => {
      transmit.broadcast(`users/${member.id}/notify`, {
        message: 'Votre groupe a été supprimé',
      })
    })
  }
}
