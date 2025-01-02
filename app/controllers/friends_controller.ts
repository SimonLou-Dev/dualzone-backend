// @ts-ignore
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from "#models/user";
import {requestFriendshipValidator} from "#validators/friend";
import db from "@adonisjs/lucid/services/db";
import FriendRequestAccepted from "#events/Friends/friend_request_accepted";
import FriendshipDeleted from "#events/Friends/friendship_deleted";
import FriendRequestSent from "#events/Friends/friend_request_sent";
import FriendRequestRefused from "#events/Friends/friend_request_refused";

export default class FriendsController {
  /**
   * Display a list of resource
   */
  async index({response, auth}: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    return response.json(await this.loadFriends(user))
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, response }: HttpContextContract) {
    const data = await request.validateUsing(requestFriendshipValidator)
    const user: User = auth.getUserOrFail()
    if (data.userId === user.id) {
      return response.status(422).json({
        errors: [{
          field: 'userId',
          message: 'You cannot send a friend request to yourself'
        }]
      })
    }
    await user.load('friendRequestReceived')
    let friendship = await db.from('player_has_friends').where('user_id', user.id).where('friend_id', data.userId).first()
    if(friendship) {
      return response.json(await this.loadFriends(user))
    }

    if(user.friendRequestReceived.find((friend) => friend.id === data.userId)) {
      await this.validateFriendshipRequest(await User.findOrFail(data.userId), user)
    }else{
      await user.related('friends').attach([data.userId])
      await user.save()
      await FriendRequestSent.dispatch(user, await User.findOrFail(data.userId))
    }

    return response.json(await this.loadFriends(user))
  }

  /**
   * Show individual record
   */
  async accept({ params, auth, response }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    const friend = await User.findOrFail(params.id)

    await this.validateFriendshipRequest(friend, user)

    return response.json(await this.loadFriends(user))
  }


  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContextContract) {
    const user: User = auth.getUserOrFail()
    const notFriend = await User.findOrFail(params.id)
    await user.load('friends')
    await user.load('friendRequestReceived')


    for (const friend of user.friends) {
      if(friend.id === notFriend.id) {
        await db.from('player_has_friends').where('user_id', user.id).where('friend_id', notFriend.id).delete()
        await db.from('player_has_friends').where('friend_id', user.id).where('user_id', notFriend.id).delete()
        await FriendshipDeleted.dispatch(user, friend)
      }
    }

    for (const friend of user.friendRequestReceived) {
      if(friend.id === notFriend.id) {
        await db.from('player_has_friends').where('friend_id', user.id).where('user_id', notFriend.id).delete()
        await FriendRequestRefused.dispatch(user, friend)
      }
    }

    return response.json(await this.loadFriends(user))
  }

  private async loadFriends(user: User):Promise<Object> {
    await user.load('friends')
    await user.load('friendRequestSent')
    await user.load('friendRequestReceived')

    return {
      friends: [...user.friends],
      friendRequestSent: [...user.friendRequestSent],
      friendRequestReceived: [...user.friendRequestReceived],
    }
  }

  private async validateFriendshipRequest(sender: User, friend: User): Promise<void> {
    await db.from('player_has_friends').where('user_id', sender.id).where('friend_id', friend.id).update({accepted: true})
    await friend.related('friends').attach({[sender.id]: {accepted: true}})
    await sender.save()
    await FriendRequestAccepted.dispatch(sender, friend)
  }
}
