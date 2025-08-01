// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GameMode from '#models/game_mode'
import redis from '@adonisjs/redis/services/main'
import Group from '#models/group'
import PartyTeam from '#models/party_team'
import RankService from '#services/rank_service'
import MatchUpdated from '#events/Match/match_updated'
import MatchChossing from '#events/Match/match_choosing'
import GroupService from '#services/playerManagement/group_service'
import { UserFactory } from '#database/factories/user'

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
      const adversaryGroup = await GroupService.createGroup(await UserFactory.create())

      await redis.hdel(redisKey + 'queue', group.id)

      await redis.publish(
        redisKey + 'found',
        JSON.stringify({
          teams: [group.id, adversaryGroup.id],
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
    const keys = Object.keys(waiter)

    // On assemble les matchs, 2 joueurs par équipe
    for (let i = 0; i + 1 < keys.length; i += 2) {
      const playerId1 = keys[i]
      const playerId2 = keys[i + 1]

      // Suppression des joueurs de la file d’attente
      await redis.hdel(redisKey + 'queue', playerId1, playerId2)

      // Publication des équipes avec seulement les IDs des joueurs
      await redis.publish(
        redisKey + 'found',
        JSON.stringify({
          teams: [playerId1, playerId2],
        })
      )
    }

    return response.json({
      status: 'ok',
      message: 'Matchmaking resolved',
    })
  }

  async generate_random_rslt({ response, auth }: HttpContextContract) {
    const user = auth.getUserOrFail()

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

      await RankService.updateRankAfeterMatch(party)

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

  async force_update_match_score({ response, auth }: HttpContextContract) {
    const user = auth.getUserOrFail()

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

      //Choix d'une équipe au hasard
      const randomTeam: PartyTeam = teams[Math.floor(Math.random() * teams.length)]

      //Conversion du score de str à number puis ajout de 1
      randomTeam.score = (Number.parseInt(randomTeam.score) + 1).toString()
      await randomTeam.save()

      party.load('teams')

      party.teams.forEach((team) => {
        team.load('players')
      })

      await MatchUpdated.dispatch(party)

      return response.json({
        status: 'ok',
        message: 'Match updated',
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

  async force_match_choice({ response, auth }: HttpContextContract) {
    const user = auth.getUserOrFail()

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

      party.status = 'CHOOSING'
      await party.save()

      party.load('teams')

      party.teams.forEach((team) => {
        team.load('players')
      })

      await MatchChossing.dispatch(party)

      return response.json({
        status: 'ok',
        message: 'Match updated',
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

  async force_match_play({ response, auth }: HttpContextContract) {
    const user = auth.getUserOrFail()

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


      party.status = 'PLAYING'
      await party.save()

      party.load('teams')

      party.teams.forEach((team) => {
        team.load('players')
      })

      await MatchChossing.dispatch(party)

      return response.json({
        status: 'ok',
        message: 'Match updated',
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

  async force_end_match({ response, auth }: HttpContextContract) {
    const user = auth.getUserOrFail()

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
      
      await RankService.updateRankAfeterMatch(party)

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
