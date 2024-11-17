import User from '#models/user'
import Group from '#models/group'
import Game from '#models/game'
import PartyTeam from '#models/party_team'
import UserRank from "#models/user_rank";

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

  public static calculateWinProbabilityOfTeamA(teamA: PartyTeam, teamB: PartyTeam): number {

  }

  public static async calculateRank(user: User, game: Game, score: number, winProbability: number) {
    await user.load('ranks')
    let rank = await this.getUserRank(user, game)
    let devCoef = 0


    if (rank.playedGames <= 5) devCoef = 70
    else if (rank.playedGames > 5 && rank.playedGames <= 30) devCoef = 40
    else devCoef = 20

    if (rank.rank >= 2400) devCoef /= 2

    return rank.rank + devCoef * (score - winProbability)
  }

  public static async getUserRank(user: User, game: Game): Promise<UserRank> {
    await user.load('ranks')
    let rank = user.ranks.find((r) => game.id === r.gameId)

    if (rank === undefined) throw new Error("Il faut faire l'erreur...")

    return rank
  }
}
