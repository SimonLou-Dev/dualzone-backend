import { BaseEvent } from '@adonisjs/core/events'
import transmit from '@adonisjs/transmit/services/main'
import Party from '#models/party'

export default class MatchChossing extends BaseEvent {
  constructor(public party: Party) {
    super()

    transmit.broadcast(`match/${party.id}`, {
      event: 'MatchChossing',
      data: { party: JSON.stringify(party) },
    })
  }
}
