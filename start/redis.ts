import redis from '@adonisjs/redis/services/main'
import GameMode from '#models/game_mode'
import MatchMakingService from '#services/gameServices/match_making_service'
import Group from '#models/group'
import Party from '#models/party'
import NotifyUser, { NotificationType } from '#events/notify_user'
import MatchWarmUp from '#events/Match/match_warm_up'

const registerRedisListeners = async () => {
  //Subscribe to Redis channels
  //Listen channel on config error
  redis.psubscribe('gameserver:configError', (channel, message) => {
    console.log(message)
  })

  //Listen channel on config validate (player can join the game)
  redis.psubscribe('gameserver:configValidate', async (channel, message) => {
    let party = await Party.query().where('ended', false).andWhere('serverId', message).first()

    if (party) {
      party.status = 'WARMUP'
      await party.save()
      await party.load('teams')
      const teams = party.teams
      for (const team of teams) {
        await team.load('players')
        for (const player of team.players) {
          await NotifyUser.dispatch(
            player,
            "L'échauffement va commencer. Connectez vous vite !",
            NotificationType.INFO
          )
        }
      }
      await MatchWarmUp.dispatch(party)
    }
  })

  //Listen channel to gameserver event
  redis.psubscribe('gameserver:*:event', (channel, message) => {
    console.log(message)

    //TODO : Détecter le SeriesStartEvent (début de la partie)

    //TODO : Détecter le RoundEndEvent (fin de  round donc changer le score de la team)

    //TODO : Détecter le MapResultEvent (fin de la partie donc changer le status de la party)
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
