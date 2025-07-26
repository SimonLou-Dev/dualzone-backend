import { BaseEvent } from '@adonisjs/core/events'
import Group from '#models/group'
import transmit from '@adonisjs/transmit/services/main'

export default class MatchMakingEnqueued extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public group: Group) {
    super()

    group.members.forEach((member) => {
      transmit.broadcast(`users/${member.id}/notify`, {
        message: "Vous avez été mis en file d'attente pour un match",
      })
    })

    transmit.broadcast(`group/${group.id}/match`, {
      event: 'matchMakingEnqueued',
    })
  }
}
