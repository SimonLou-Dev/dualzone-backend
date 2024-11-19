// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '#models/user'
import UserPolicy from '#policies/user_policy'

export default class UserController {
  public static async index({ response, bouncer }: HttpContextContract) {
    await bouncer.with(UserPolicy).authorize('viewAny')
    const users = await User.all()
    return response.json(users)
  }

  public static async show({ response, params, bouncer }: HttpContextContract) {
    const user = await User.find(params.id)
    await bouncer.with(UserPolicy).authorize('view', user)
    return response.json(user)
  }

  public static async update({ request, response, params, bouncer }: HttpContextContract) {
    const user = await User.findOrFail(params.id)
    await bouncer.with(UserPolicy).authorize('update', user)
    user.merge(request.body())
    await user.save()
    return response.json(user)
  }

  public static async destroy({ response, params, bouncer }: HttpContextContract) {
    const user = await User.findOrFail(params.id)
    await bouncer.with(UserPolicy).authorize('delete')
    await user.delete()
    return response.json(user)
  }

  public static async store({ request, response }: HttpContextContract) {
    const user = new User()
    user.merge(request.body())
    await user.save()
    return response.json(user)
  }
}
