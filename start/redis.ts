import redis from '@adonisjs/redis/services/main'
import GameMode from '#models/game_mode'
import MatchMakingService from '#services/gameServices/match_making_service'
import Group from '#models/group'
import Party from '#models/party'
import NotifyUser, { NotificationType } from '#events/notify_user'
import MatchWarmUp from '#events/Match/match_warm_up'
import { BaseEvent, RoundEndEvent } from '../utils/game_events.js'
import MatchUpdated from '#events/Match/match_updated'
import RankService from '#services/rank_service'
import MatchStated from '#events/Match/match_started'
import MatchChossing from '#events/Match/match_choosing'

const registerRedisListeners = async () => {
  //Subscribe to Redis channels
  //Listen channel on config error
  redis.psubscribe('gameserver:configError', (channel, message) => {
    console.log(message, channel)
  })

  //Listen channel on config validate (player can join the game)
  redis.psubscribe('gameserver:configValidate', async (channel, message) => {
    let party = await Party.query().where('ended', false).andWhere('serverId', message).first()

    if (party) {
      channel = channel.split(':')[1]
      party.status = 'WARMUP'
      await party.save()
      await notifyUserInParty(party, "L'échauffement va commencer. Connectez vous vite !")
      await MatchWarmUp.dispatch(party)
    }
  })

  //Listen channel to gameserver event
  redis.psubscribe('gameserver:*:event', async (channel, message) => {
    const payloadBase: BaseEvent = JSON.parse(message)
    const eventName = payloadBase.event

    const serverId = channel.split(':')[1]
    let party = await Party.query().where('ended', false).andWhere('serverId', serverId).first()

    if(!party) return console.log(`No party found for serverId ${serverId}`)

    await party.load('teams')

    await party.teams.forEach((team) => {
      team.load('players')
    })


    //Détecter le SeriesStartEvent (début de la partie)
    if (eventName === 'series_start' && party) {
      party.status = 'CHOOSING'
      await party.save()
      await notifyUserInParty(party, 'La partie commence !')

      await MatchChossing.dispatch(party)
    }

    if (eventName === 'going_live' && party) {
      party.status = 'PLAYING'
      await party.save()
      await notifyUserInParty(party, 'La partie commence !')

      await MatchStated.dispatch(party)
    }

    //Détecter le RoundEndEvent (fin de  round donc changer le score de la team)
    if (eventName === 'round_end' && party) {
      const payload: RoundEndEvent = JSON.parse(message)

      console.log(payload)
      console.log(party)

      //Mettre à jour le score de la team
      let team1 = party.teams[0]
      let team2 = party.teams[1]

      team1.score = payload.team1.score + ''
      team2.score = payload.team2.score + ''

      //TODO: Vérifier que party.teams[0] c'est bien team1 et pas team2

      await team1.save()
      await team2.save()

      await MatchUpdated.dispatch(party)
    }

    //Détecter le MapResultEvent (fin de la partie donc changer le status de la party)
    if (eventName === 'map_result' && party) {
      //const payload: RoundEndEvent = JSON.parse(message)

      //Finir la partie
      party.status = 'ENDED'
      party.ended = true
      await party.save()

      await RankService.updateRankAfeterMatch(party)
    }
  })

  //Listen channel to matchmaking event
  redis.psubscribe('mm:*:*:found', async (channel, message) => {
    const channelSplit = channel.split(':')
    const modeId = channelSplit[2]

    const mode = await GameMode.findOrFail(modeId)
    const teams: Group[] = []
    for (const team of JSON.parse(message).teams) {
      teams.push(await Group.findOrFail(team))
    }

    await MatchMakingService.matchFound(mode, ...teams)
  })

  console.log('Redis listeners registered')
}

const notifyUserInParty = async (party: Party, message: string) => {
  await party.load('teams')
  const teams = party.teams
  for (const team of teams) {
    await team.load('players')
    for (const player of team.players) {
      await NotifyUser.dispatch(player, message, NotificationType.INFO)
    }
  }
}

export default registerRedisListeners
