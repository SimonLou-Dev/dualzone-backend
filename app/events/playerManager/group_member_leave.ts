import { BaseEvent } from '@adonisjs/core/events'
import User from '#models/user'
import Group from '#models/group'

export default class GroupMemberLeave extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public user: User,
    public group: Group
  ) {
    super()
  }
}
