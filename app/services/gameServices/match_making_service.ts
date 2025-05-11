import User from '#models/user'
import GameMode from '#models/game_mode'
import Group from '#models/group'
import redis from '@adonisjs/redis/services/main'
import { DateTime } from 'luxon'
import RankService from '#services/rank_service'
import MatchMakingEnqueued from '#events/MatchMaking/match_making_enqueued'
import MatchFounded from '#events/MatchMaking/match_founded'
import Party from '#models/party'
import PartyTeam from '#models/party_team'
import GameServerService from '#services/gameServices/game_server_service'

export default class MatchMakingService {
  public static async pushGroupToQueue(group: Group, gameMode: GameMode) {
    await group.load('members')
    await gameMode.load('game')
    let rank: { min: number; max: number; avg: number } = await RankService.getTeamRank(
      group,
      gameMode.game
    )

    await redis.hset(
      `mm:${gameMode.game.id}:${gameMode.id}:queue`,
      group.id,
      JSON.stringify({
        time: DateTime.now().toISO(),
        size: group.size,
        avgElo: rank.avg,
        minElo: rank.min,
        maxElo: rank.max,
      })
    )

    await MatchMakingEnqueued.dispatch(group)
  }

  public static async matchFound(gameMode: GameMode, ...teams: Group[]) {
    let party: Party = new Party()
    await party.related('mode').associate(gameMode)
    await party.save()
    for (const team of teams) {
      await team.load('members')
      let teamParty = new PartyTeam()
      teamParty.score = '0'
      await teamParty.related('party').associate(party)
      await teamParty.related('players').attach(team.members.map((member: User) => member.id))
      await teamParty.save()
    }
    party.serverId = await GameServerService.configureServer(party)
    await party.save()
    await MatchFounded.dispatch(party, ...teams)
    return party
  }
}
