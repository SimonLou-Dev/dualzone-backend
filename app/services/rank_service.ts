import User from '#models/user'
import Group from '#models/group'
import Game from '#models/game'
import PartyTeam from '#models/party_team'
import UserRank from '#models/user_rank'

export default class RankService {
  public static async getTeamRank(group: Group, game: Game): Promise<number> {
    await group.load('members')
    let teamRank = 0
    group.members.map(async (member) => {
      let rank = await this.getUserRank(member, game)
      teamRank += rank.rank
    })
    return teamRank / group.members.length
  }

  public static async calculateWinProbabilityOfTeamA(
    teamA: PartyTeam,
    teamB: PartyTeam
  ): Promise<number> {
    await teamA.load('players')
    await teamA.load('party')
    await teamA.party.load('mode')
    await teamA.party.mode.load('game')
    await teamB.load('players')
    let teamARank = 0
    let teamBRank = 0
    teamA.players.map(async (member) => {
      let rank = await this.getUserRank(member, teamA.party.mode.game)
      teamARank *= Math.pow(10, rank.rank / 100)
    })
    teamB.players.map(async (member) => {
      let rank = await this.getUserRank(member, teamA.party.mode.game)
      teamBRank *= Math.pow(10, rank.rank / 100)
    })

    return teamARank / (teamARank + teamBRank)
  }

  public static async calculateRank(
    user: User,
    game: Game,
    score: number,
    winProbability: number
  ): Promise<number> {
    await user.load('ranks')
    let rank = await this.getUserRank(user, game)
    let devCoef = 0

    if (rank.playedGames <= 5) devCoef = 350
    else if (rank.playedGames > 5 && rank.playedGames <= 30) devCoef = 200
    else devCoef = 100

    if (rank.rank >= 3000) devCoef /= 2

    return this.reduceLostRank(rank, rank.rank + devCoef * (score - winProbability))
  }

  private static reduceLostRank(rank: UserRank, next: number): number {
    if (rank.rank < next) return next
    if (next >= 1000) return next
    const diff = rank.rank - next

    return rank.rank - diff / 2
  }

  public static async getUserRank(user: User, game: Game): Promise<UserRank> {
    await user.load('ranks')
    let rank = user.ranks.find((r) => game.id === r.gameId)

    if (rank === undefined) throw new Error("Il faut faire l'erreur...")

    return rank
  }
}
