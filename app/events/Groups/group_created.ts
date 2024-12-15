import { BaseEvent } from '@adonisjs/core/events'
import Group from '#models/group'
import User from '#models/user'

export default class GroupCreated extends BaseEvent {
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
