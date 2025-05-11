import redis from '@adonisjs/redis/services/main'
import GameMode from '#models/game_mode'
import MatchMakingService from '#services/gameServices/match_making_service'
import Group from "#models/group";

const registerRedisListeners = async () => {
  //Subscribe to Redis channels
  //Listen channel on config error
  redis.psubscribe('gameserver:configError', (channel, message) => {
    console.log(message)
  })

  //Listen channel on config validate (player can join the game)
  redis.psubscribe('gameserver:configValidate', (channel, message) => {
    console.log(message)
  })

  //Listen channel to gameserver event
  redis.psubscribe('gameserver:*:event', (channel, message) => {
    console.log(message)
  })

  //Listen channel to matchmaking event
  redis.psubscribe('mm:*:*:found', async (channel, message) => {
    const channelSplit = channel.split(':')
    const modeId = channelSplit[2]

    const mode = await GameMode.findOrFail(modeId)
    const teams: Group[] = []
    for (const team of JSON.parse(message).teams) {
      teams.push(await Group.findOrFail(team.id))
    }

    await MatchMakingService.matchFound(mode, ...teams)
  })

  console.log('Redis listeners registered')
}

export default registerRedisListeners
