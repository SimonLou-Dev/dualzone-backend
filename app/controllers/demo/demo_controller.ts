// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GameMode from '#models/game_mode'
import redis from '@adonisjs/redis/services/main'
import Group from '#models/group'
import { GroupFactory } from '#database/factories/group'
import PartyTeam from '#models/party_team'

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
}
