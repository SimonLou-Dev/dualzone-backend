import { BaseEvent } from '@adonisjs/core/events'
import User from '#models/user'
import Group from '#models/group'

export default class GroupDelete extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public group: Group) {
    super()
  }
}
