import { BaseEvent } from '@adonisjs/core/events'
import Group from '#models/group'
import Party from '#models/party'
import transmit from '@adonisjs/transmit/services/main'

export default class MatchFounded extends BaseEvent {
  constructor(match: Party, ...teams: Group[]) {
    super()

    for (const team of teams) {
      team.members.forEach((member) => {
        transmit.broadcast(`users/${member.id}/notify`, {
          message: 'Le match a été trouvé',
        })
      })

      transmit.broadcast(`group/${team.id}/match`, {
        event: 'matchFounded',
        data: { matchId: match.id },
      })
    }
  }
}
