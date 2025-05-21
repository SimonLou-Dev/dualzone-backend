import redis from '@adonisjs/redis/services/main'
import GameMode from '#models/game_mode'
import MatchMakingService from '#services/gameServices/match_making_service'
import Group from '#models/group'
import Party from '#models/party'
import NotifyUser, { NotificationType } from '#events/notify_user'
import MatchWarmUp from '#events/Match/match_warm_up'
import { BaseEvent, RoundEndEvent } from '../utils/game_events.js'
import MatchUpdated from '#events/Match/match_updated'
import MatchEnded from '#events/Match/match_ended'
import RankService from '#services/rank_service'

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

    //Détecter le SeriesStartEvent (début de la partie)
    if (eventName === 'going_live' && party) {
      party.status = 'PLAYING'
      await party.save()
      await notifyUserInParty(party, 'La partie commence !')

      await MatchUpdated.dispatch(party)
    }

    //Détecter le RoundEndEvent (fin de  round donc changer le score de la team)
    if (eventName === 'round_end' && party) {
      const payload: RoundEndEvent = JSON.parse(message)

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
    if (eventName === 'round_end' && party) {
      const payload: RoundEndEvent = JSON.parse(message)

      //Finir la partie
      party.status = 'ENDED'
      party.ended = true
      await party.save()

      //Calculer le rank des joueurs
      await party.load('teams')
      await party.load('mode')
      await party.mode.load('game')

      //Search in party teams for the team with team
      const team1 = party.teams[0]
      const team2 = party.teams[1]
      await team1.load('players')
      await team2.load('players')

      const team1WinProb: number = team1.winProbability
      const team2WinProb = team2.winProbability

      for (const player of team1.players) {
        const userRank = await RankService.getUserRank(player, party.mode.game)
        userRank.rank = await RankService.calculateRank(
          player,
          party.mode.game,
          payload.team1.score,
          team1WinProb
        )
        await userRank.save()
      }

      for (const player of team2.players) {
        const userRank = await RankService.getUserRank(player, party.mode.game)
        await RankService.calculateRank(player, party.mode.game, payload.team2.score, team2WinProb)
        await userRank.save()
      }

      await MatchEnded.dispatch(party)
    }
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
