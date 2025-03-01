import User from '#models/user'
import SanctionService from '#services/playerManagement/sanction_service'
// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  createBanValidator,
  createWarnValidator,
  updateSanctionValidator,
} from '#validators/sanction'
import Sanction from '#models/sanction'
import SanctionPolicy from "#policies/sanction_policy";

export default class UserSanctionController {
  async listSanction({ bouncer, response, params, auth }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    await bouncer.with(SanctionPolicy).authorize('list', user)
    const target = await User.findOrFail(params.userId)
    return response.json(await SanctionService.listSanction(target))
  }

  async warn({ bouncer, response, params, auth, request }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    await bouncer.with(SanctionPolicy).authorize('warn', user)
    const target = await User.findOrFail(params.userId)
    const payload = await request.validateUsing(createWarnValidator)

    return response.json(await SanctionService.addWarn(target, user, payload.reason))
  }

  async ban({ bouncer, response, params, auth, request }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    const target = await User.findOrFail(params.userId)
    const payload = await request.validateUsing(createBanValidator)
    if (payload.duration === 0) {
      await bouncer.with(SanctionPolicy).authorize('ban_perm', user)
    } else {
      await bouncer.with(SanctionPolicy).authorize('ban_temp', user)
    }

    return response.json(
      await SanctionService.addBan(target, user, payload.reason, payload.duration)
    )
  }

  async update({ bouncer, response, params, auth, request }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    await bouncer.with(SanctionPolicy).authorize('update', user)
    const sanction = await Sanction.findOrFail(params.sanctionId)
    const payload = await request.validateUsing(updateSanctionValidator)
    return response.json(
      await SanctionService.updateSanction(sanction, payload.reason, payload.duration)
    )
  }

  async delete({ bouncer, response, params, auth }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    await bouncer.with(SanctionPolicy).authorize('delete', user)
    const sanction = await Sanction.findOrFail(params.sanctionId)
    await sanction.delete()
    return response.json({ message: 'Sanction deleted' })
  }
}
