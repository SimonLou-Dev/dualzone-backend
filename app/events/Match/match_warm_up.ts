import { BaseEvent } from '@adonisjs/core/events'
import transmit from '@adonisjs/transmit/services/main'
import Party from '#models/party'

export default class MatchWarmUp extends BaseEvent {
  constructor(public party: Party) {
    super()

    transmit.broadcast(`match/${party.id}`, {
      event: 'matchWarmUp',
      data: { party: JSON.stringify(party) },
    })
  }
}
