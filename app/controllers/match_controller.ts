import GameMode from '#models/game_mode'
import MatchMakingService from '#services/gameServices/match_making_service'
import User from '#models/user'
import Group from '#models/group'
import PartyTeam from '#models/party_team'
import redis from '@adonisjs/redis/services/main'
// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Party from '#models/party'
import Game from '#models/game'
import GroupService from '#services/playerManagement/group_service'
import NotifyUser, { NotificationType } from '#events/notify_user'

export default class MatchController {
  async status({ response, auth }: HttpContextContract) {
    const user = auth.getUserOrFail()
    const inQueue = await MatchController.checkIfUserIsInAnyQueueOrInMatch(user)
    await user.load('group')

    if (!inQueue) {
      return response.json({
        status: 'ok',
        message: 'User is in queue or match',
      })
    } else {
      return response.json({
        status: 'ok',
        message: 'User is not in queue or in match',
      })
    }
  }

  async request({ response, auth, params }: HttpContextContract) {
    const user = auth.getUserOrFail()
    const inQueue = await MatchController.checkIfUserIsInAnyQueueOrInMatch(user)

    if (inQueue) {
      await NotifyUser.dispatch(
        user,
        "Vous êtes déjà dans une file d'attente ou dans un match",
        NotificationType.WARNING
      )

      return response.json(
        {
          status: 'error',
          message: 'User is already in queue or in match',
        },
        422
      )
    }

    await user.load('group')
    let group: Group
    if (user.group.length === 0) group = await GroupService.createGroup(user)
    else group = user.group[0]

    const modeId = params.modeId
    const gameMode: GameMode = await GameMode.findOrFail(modeId)

    await MatchMakingService.pushGroupToQueue(group, gameMode)

    return response.json({
      status: 'ok',
      message: 'Group added to queue',
    })
  }

  async get_party({ response, params }: HttpContextContract) {
    const party = await Party.findOrFail(params.partyId)

    return response.json({
      status: 'ok',
      message: 'Party found',
      party: party,
    })
  }

  async result({ response, auth }: HttpContextContract) {
    const user = auth.getUserOrFail()
  }

  static async checkIfUserIsInAnyQueueOrInMatch(user: User) {
    const game = await Game.query().where('name', 'cs2').firstOrFail()
    await game.load('gameModes')

    for (const gameMode of game.gameModes) {
      const founded: boolean = await MatchController.checkIfUserInQueueOrInMatch(user, gameMode)
      if (founded) {
        return true
      }
    }
    return false
  }

  async getGameMode({ response }: HttpContextContract) {
    const game: Game = await Game.query().where('name', 'cs2').firstOrFail()
    await game.load('gameModes')
    return response.json({ modes: game.gameModes })
  }

  private static async checkIfUserInQueueOrInMatch(
    user: User,
    gameMode: GameMode
  ): Promise<boolean> {
    await user.load('group')
    const group = user.group[0]
    await gameMode.load('game')
    const game: Game = gameMode.game

    const queue = await redis.hgetall(`mm:${game.id}:${gameMode.id}:queue`)
    if (Object.keys(queue).some((field) => field.includes(group.id))) return true

    const team: PartyTeam | null = await PartyTeam.query()
      .whereHas('players', (playersQ) => {
        playersQ.where('users.id', user.id)
      })
      .whereHas('party', (partyQ) => {
        partyQ.where('ended', false)
      })
      .first()

    return team !== null
  }
}
