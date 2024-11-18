import openid, { RelyingParty } from 'openid'
import axios from 'axios'
import url, { UrlWithParsedQuery } from 'node:url'
import { dd } from '@adonisjs/core/services/dumper'
import querystring, { ParsedUrlQuery } from 'node:querystring'

interface OpenidCheck {
  ns: string
  op_endpoint: string
  claimed_id: string
  identity: string
  authRoute: string
}

interface SteamAuthServiceConstructor {
  realm: string
  returnUrl: string
  apiKey: string
}

export interface SteamUserFromApi {
  _json: Object
  steamid: string
  username: string
  profile: string
  name: string
  avatar: {
    small: string
    medium: string
    large: string
  }
}

const OPENID_CHECK: OpenidCheck = {
  ns: 'http://specs.openid.net/auth/2.0',
  op_endpoint: 'https://steamcommunity.com/openid/login',
  claimed_id: 'https://steamcommunity.com/openid/id/',
  identity: 'https://steamcommunity.com/openid/id/',
  authRoute: 'https://steamcommunity.com/openid',
}

export default class SteamAuthService {
  private readonly apiKey: string
  private relyingParty: RelyingParty

  constructor({ realm, returnUrl, apiKey }: SteamAuthServiceConstructor) {
    if (!realm || !returnUrl || !apiKey)
      throw new Error('Missing realm, returnURL or apiKey parameter(s). These are required.')

    this.apiKey = apiKey
    this.relyingParty = new openid.RelyingParty(returnUrl, realm, true, true, [])
  }

  async getRedirectUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.relyingParty.authenticate(OPENID_CHECK.authRoute, false, (err, authUrl) => {
        if (err) return reject('Authentication failed: ' + err)
        if (!authUrl) return reject('Authentication failed.')

        resolve(authUrl)
      })
    })
  }

  async fecthIdentifier(steamOpenId: string): Promise<SteamUserFromApi> {
    return new Promise(async (resolve, reject) => {
      // Parse steamid from the url
      const steamId = steamOpenId.replace('https://steamcommunity.com/openid/id/', '')

      try {
        const response = await axios.get(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}`
        )
        const players = response.data && response.data.response && response.data.response.players

        if (players && players.length > 0) {
          // Get the player
          const player = players[0]

          // Return user data
          resolve({
            _json: player,
            steamid: steamId,
            username: player.personaname,
            name: player.realname,
            profile: player.profileurl,
            avatar: {
              small: player.avatar,
              medium: player.avatarmedium,
              large: player.avatarfull,
            },
          })
        } else {
          reject('No players found for the given SteamID.')
        }
      } catch (error) {
        reject('Steam server error: ' + error.message)
      }
    })
  }

  async authenticate(req: any): Promise<SteamUserFromApi> {
    return new Promise(async (resolve, reject) => {
      if (this.getFirstElement(req, 'openid.ns') !== OPENID_CHECK.ns)
        return reject('Claimed identity is not valid.')
      if (this.getFirstElement(req, 'openid.op_endpoint') !== OPENID_CHECK.op_endpoint)
        return reject('Claimed identity is not valid.')
      if (!this.getFirstElement(req, 'openid.claimed_id').startsWith(OPENID_CHECK.claimed_id))
        return reject('Claimed identity is not valid.')
      if (!this.getFirstElement(req, 'openid.identity').startsWith(OPENID_CHECK.identity))
        return reject('Claimed identity is not valid.')

      this.relyingParty.verifyAssertion(req.request, async (error, result) => {
        if (error) return reject(error.message)
        if (!result || !result.authenticated || result.claimedIdentifier === undefined)
          return reject('Failed to authenticate user.')
        if (!/^https?:\/\/steamcommunity\.com\/openid\/id\/\d+$/.test(result.claimedIdentifier))
          return reject('Claimed identity is not valid.')

        try {
          const user = await this.fecthIdentifier(result.claimedIdentifier)

          return resolve(user)
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  private getFirstElement(req: any, sParam: string): string {
    const searchParams = url.parse(req.parsedUrl.path, true).query
    let param: string | string[] | undefined = searchParams[sParam]

    if (typeof param === 'string') return param
    if (Array.isArray(param)) return param[0]
    return ''
  }
}
