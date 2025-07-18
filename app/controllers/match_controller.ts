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

    const team: PartyTeam | null = await PartyTeam.query()
      .whereHas('players', (playersQ) => {
        playersQ.where('users.id', user.id)
      })
      .whereHas('party', (partyQ) => {
        partyQ.where('ended', false)
      })
      .first()

    if (team) {
      await team.load('party')
      await team.party.load('mode')
      return response.json({
        status: 'ok',
        message: 'User is in match',
        party: team.party,
        mode: team.party.mode,
      })
    } else if (inQueue) {
      return response.json({
        status: 'ok',
        message: 'User is in queue',
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

    await user.load('group')
    let group: Group
    if (user.group.length === 0) group = await GroupService.createGroup(user)
    else group = user.group[0]

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

    

    const modeId = params.modeId
    const gameMode: GameMode = await GameMode.findOrFail(modeId)

    await MatchMakingService.pushGroupToQueue(group, gameMode)

    return response.json({
      status: 'ok',
      message: 'Group added to queue',
    })
  }

  async get_party({ response, params, auth }: HttpContextContract) {
    const user = await auth.getUserOrFail()
    const party = await Party.findOrFail(params.partyId)

    await party.load('teams', (query) => {
      query.preload('players')
    })

    //Check if user is in party and return party

    for (const team of party.teams) {
      if (team.players.some((player) => player.id === user.id)) {
        await party.load('mode')
        return response.json({
          status: 'ok',
          message: 'Party found',
          party: party,
        })
      }
    }

    //Else return 403 not authorized

    return response.json(
      {
        status: 'error',
        message: 'User is not in party',
      },
      403
    )
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

  public async listPartiesByGameMode({ response, auth, params, request }: HttpContextContract) {
    const user = auth.getUserOrFail()
    const page: number = request.input('page', 1)
    const rows: number = request.input('rows', 20)

    const parties: Party[] = await Party.query()
      .whereHas('mode', (query) => {
        query.where('game_modes.id', params.modeId)
      })
      .whereHas('teams', (query) => {
        query.whereHas('players', (subq) => {
          subq.where('users.id', user.id)
        })
      })
      .preload('teams', (teams) => {
        teams.preload('players')
      })
      .orderBy('created_at', 'desc')
      .paginate(page, rows)

    return response.json({
      status: 'ok',
      message: 'Parties found',
      parties: parties,
    })
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
