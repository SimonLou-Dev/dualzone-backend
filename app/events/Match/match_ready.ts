import { BaseEvent } from '@adonisjs/core/events'
import transmit from '@adonisjs/transmit/services/main'
import Party from '#models/party'

export default class MatchReady extends BaseEvent {
  constructor(public party: Party) {
    super()

    transmit.broadcast(`match/${party.id}`, {
      event: 'matchReady',
      data: { party: JSON.stringify(party) },
    })
  }
}
