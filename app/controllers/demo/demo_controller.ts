// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GameMode from '#models/game_mode'
import redis from '@adonisjs/redis/services/main'
import Group from '#models/group'
import { GroupFactory } from '#database/factories/group'
import PartyTeam from '#models/party_team'
import RankService from '#services/rank_service'
import MatchEnded from '#events/Match/match_ended'

export default class DemoController {
  async force_found_match({ response, auth, params }: HttpContextContract) {
    const user = auth.getUserOrFail()
    const gameModeId = params.modeId
    const gameMode: GameMode = await GameMode.findOrFail(gameModeId)
    await gameMode.load('game')
    await user.load('group')
    const group: Group = user.group[0]

    const redisKey = `mm:${gameMode.game.id}:${gameMode.id}:`

    if (await redis.hexists(redisKey + 'queue', group.id)) {
      //Creation de la team  adverse
      const adversaryGroup = await GroupFactory.with('leader').create()

      await redis.hdel(redisKey + 'queue', group.id)

      await redis.publish(
        redisKey + 'found',
        JSON.stringify({
          teams: [group, adversaryGroup],
        })
      )
      return response.json({
        status: 'ok',
        message: 'match creation was requested',
      })
    } else {
      return response.json(
        {
          status: 'error',
          message: 'User is not in queue or in match',
        },
        500
      )
    }
  }

  async force_warmup_start({ response, auth }: HttpContextContract) {
    const user = auth.getUserOrFail()
    await user.load('group')

    //Check if the user is in a match
    const team: PartyTeam | null = await PartyTeam.query()
      .whereHas('party', (party) => {
        party.where('ended', false)
      })
      .whereHas('players', (q_player) => {
        q_player.where('users.id', user.id)
      })
      .first()

    if (team) {
      await team.load('party')

      await redis.publish('gameserver:configValidate', team.party.serverId)

      return response.json({
        status: 'ok',
        message: 'Warmup must be started',
      })
    } else {
      return response.json(
        {
          status: 'error',
          message: 'User is not in a match',
        },
        500
      )
    }
  }

  async force_resolve_mm({ response, params }: HttpContextContract) {
    const gameModeId = params.modeId
    const gameMode: GameMode = await GameMode.findOrFail(gameModeId)
    await gameMode.load('game')

    const redisKey = `mm:${gameMode.game.id}:${gameMode.id}:`

    const waiter = await redis.hgetall(redisKey + 'queue')

    //Need to assemble match and set one player per teams
    for (let i = 0; i + 1 < Object.keys(waiter).length; i += 2) {
      //Set the teams
      await redis.hdel(redisKey + 'queue', Object.keys(waiter)[i], Object.keys(waiter)[i + 1])
      //Need to publish the teams, with the values of waiter at index i and i+1
      await redis.publish(
        redisKey,
        JSON.stringify({
          teams: [waiter[i], waiter[i + 1]],
        })
      )
    }

    return response.json({
      status: 'ok',
      message: 'Matchmaking resolved',
    })
  }

  async force_end_match({ response, auth }: HttpContextContract) {
    const user = auth.getUserOrFail()
    await user.load('group')

    //Check if the user is in a match
    const team: PartyTeam | null = await PartyTeam.query()
      .whereHas('party', (party) => {
        party.where('ended', false)
      })
      .whereHas('players', (q_player) => {
        q_player.where('users.id', user.id)
      })
      .first()

    if (team) {
      await team.load('party')
      const party = team.party
      await party.load('teams')
      const teams = party.teams
      let team1 = teams[0]
      let team2 = teams[1]

      //Génération des scores aléatoires avec un score max de 13
      const team1Score = Math.floor(Math.random() * 13)
      const team2Score = Math.floor(Math.random() * 13)

      //Assigner les scores aux équipes
      team1.score = team1Score.toString()
      team2.score = team2Score.toString()

      //Sauvegarder les équipes
      await team1.save()
      await team2.save()

      //Finir la partie
      party.status = 'ENDED'
      party.ended = true
      await party.save()

      //Calculer le rank des joueurs

      await team1.load('players')
      await team2.load('players')

      const team1WinProb: number = await RankService.calculateWinProbabilityOfTeamA(team1, team2)
      const team2WinProb = 1 - team1WinProb

      for (const player of team1.players) {
        const userRank = await RankService.getUserRank(player, party.mode.game)
        userRank.rank = await RankService.calculateRank(
          player,
          party.mode.game,
          team1Score,
          team1WinProb
        )
        await userRank.save()
      }

      for (const player of team2.players) {
        const userRank = await RankService.getUserRank(player, party.mode.game)
        await RankService.calculateRank(player, party.mode.game, team2Score, team2WinProb)
        await userRank.save()
      }

      // Dispatch the event to notify the end of the match

      await MatchEnded.dispatch(party)

      return response.json({
        status: 'ok',
        message: 'Match ended',
      })
    } else {
      return response.json(
        {
          status: 'error',
          message: 'User is not in a match',
        },
        500
      )
    }
  }
}
