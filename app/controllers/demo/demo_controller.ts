// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GameMode from '#models/game_mode'
import redis from '@adonisjs/redis/services/main'
import Group from '#models/group'
import { GroupFactory } from '#database/factories/group'

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
}
