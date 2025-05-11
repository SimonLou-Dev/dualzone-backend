import redis from "@adonisjs/redis/services/main";

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
  redis.psubscribe('mm:*:*:found', (channel, message) => {
    const channelSplit = channel.split(':')
    const gameId = channelSplit[1]
    const mode = channelSplit[2]


    console.log(message)
  })

  console.log('Redis listeners registered')

}

export default registerRedisListeners
