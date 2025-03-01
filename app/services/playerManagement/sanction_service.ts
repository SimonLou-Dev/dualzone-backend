import Sanction from '#models/sanction'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class SanctionService {
  public static async listSanction(player: User): Promise<Sanction[]> {
    return Sanction.query().whereHas('user', (userQ) => {
      userQ.where('users.id', player.id)
    })
  }

  public static async addWarn(player: User, admin: User, reason: string): Promise<Sanction> {
    let sanction = new Sanction()
    sanction.reason = reason
    sanction.duration = 0
    sanction.type = 0
    sanction.userId = player.id
    sanction.adminId = admin.id
    await sanction.save()
    return sanction
  }

  public static async addBan(
    player: User,
    admin: User,
    reason: string,
    duration: number
  ): Promise<Sanction> {
    let sanction = new Sanction()
    sanction.reason = reason
    sanction.duration = duration
    sanction.type = 1
    sanction.userId = player.id
    sanction.adminId = admin.id
    await sanction.save()
    return sanction
  }

  public static async boolAsActiveBan(user: User): Promise<boolean> {
    let sanctions: Sanction[] = await this.listSanction(user)
    for (const sanction of sanctions) {
      if (sanction.type !== 1) continue
      if (Number(sanction.duration) === 0) return true
      if (DateTime.now() < sanction.createdAt.plus({ days: sanction.duration })) return true
    }
    return false
  }

  public static async updateSanction(
    sanction: Sanction,
    reason: string,
    duration: number
  ): Promise<Sanction> {
    sanction.reason = reason
    sanction.duration = duration
    await sanction.save()
    return sanction
  }

  public static async removeSanction(sanction: Sanction): Promise<void> {
    await sanction.delete()
  }
}
