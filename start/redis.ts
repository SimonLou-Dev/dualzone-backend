import redis from "@adonisjs/redis/services/main";

export default const registerRedisListeners = async () => {

  //Subscribe to Redis channels
  //Listen channel on config error
  redis.subscribe('gameserver:configError', (messages) => {
    console.log(messages)
  })

  //Listen channel on config validate (player can join the game)
  redis.subscribe('gameserver:configValidate', (messages) => {
    console.log(messages)
  })

  //Listen channel to gameserver event
  redis.subscribe('gameserver:*:event', (messages) => {
    console.log(messages)
  })

}
