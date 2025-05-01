import GameMode from '#models/game_mode'
import MatchMakingService from '#services/gameServices/match_making_service'
import User from '#models/user'
import Group from '#models/group'
import PartyTeam from '#models/party_team'
import redis from '@adonisjs/redis/services/main'

export default class MatchController {
  async status({ response, auth }) {
    const user = auth.getUserOrFail()
    const inQueue = await MatchController.checkIfUserInQueueOrInMatch(user)

    if (inQueue) {
      return response.json({
        status: 'ok',
        message: 'User is in queue or in match',
      })
    } else {
      return response.json({
        status: 'ok',
        message: 'User is not in queue or in match',
      })
    }
  }

  async request({ response, auth }) {
    const user = auth.getUserOrFail()
    await user.load('group')
    const group = user.group

    const gameMode = new GameMode()

    await MatchMakingService.pushGroupToQueue(group, gameMode)

    return response.json({
      status: 'ok',
      message: 'Group added to queue',
    })
  }

  async get({ response, auth }) {
    const user = auth.getUserOrFail()
    await user.load('group')
    const group = user.group
    if (!(await MatchController.checkIfUserInQueueOrInMatch(user))) {
      return response.json({
        status: 'ok',
        message: 'User is not in queue or in match',
      })
    }

    const queue = await redis.hgetall(`mm:${group.game.name}:${group.name}:queue`)
    if (Object.keys(queue).some((field) => field.includes(group.id)))
      return response.json({
        status: 'ok',
        message: 'User is in queue ',
        group: group,
      })
    else {
      await user.load('party')
      const party = user.party
      await party.load('teams')
      const teams = party.teams
      for (const team of teams) {
        await team.load('players')
      }
      return response.json({
        status: 'ok',
        message: 'User is in match',
        party: party,
      })
    }
  }

  async result({ response, auth }) {
    const user = auth.getUserOrFail()
  }

  private static async checkIfUserInQueueOrInMatch(user: User) {
    await user.load('group')
    const group = user.group

    const queue = await redis.hgetall(`mm:${group.game.name}:${group.name}:queue`)
    if (Object.keys(queue).some((field) => field.includes(group.id))) return true

    let team = await PartyTeam.query()
      .whereHas('players', (playersQ) => {
        playersQ.where('users.id', user.id)
      })
      .whereHas('party', (partyQ) => {
        partyQ.where('ended', false)
      })
      .first()

    if (team) {
      return true
    }
  }
}
