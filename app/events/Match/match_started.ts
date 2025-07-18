import { BaseEvent } from '@adonisjs/core/events'
import transmit from '@adonisjs/transmit/services/main'
import Party from '#models/party'

export default class MatchStated extends BaseEvent {
  constructor(public party: Party) {
    super()

    transmit.broadcast(`match/${party.id}`, {
      event: 'MatchStated',
      data: { party: JSON.stringify(party) },
    })
  }
}
