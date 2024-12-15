import { BaseEvent } from '@adonisjs/core/events'
import Group from '#models/group'

export default class GroupDelete extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public group: Group) {
    super()
  }
}
