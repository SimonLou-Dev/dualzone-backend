import { BaseEvent } from '@adonisjs/core/events'
import Group from '#models/group'
import transmit from '@adonisjs/transmit/services/main'

export default class GroupDelete extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public group: Group) {
    super()
    group.members.forEach((member) => {
      transmit.broadcast(`users/${member.id}/group`, {
        event: 'groupDeleted',
        data: { groupId: group.id },
      })

      transmit.broadcast(`users/${member.id}/notify`, {
        message: 'Votre groupe a été supprimé',
      })
    })
  }
}
