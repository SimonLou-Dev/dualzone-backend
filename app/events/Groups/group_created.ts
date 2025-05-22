import { BaseEvent } from '@adonisjs/core/events'
import Group from '#models/group'
import User from '#models/user'
import transmit from '@adonisjs/transmit/services/main'
import NotifyUser from '#events/notify_user'

export default class GroupCreated extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public user: User,
    public group: Group
  ) {
    super()
    transmit.broadcast(`users/${user.id}/group`, {
      event: 'groupCreated',
      data: { groupId: group.id },
    })

    NotifyUser.dispatch(user, 'Vous avez créé un groupe')
  }
}
