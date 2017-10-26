'use strict'

import * as Types from '../../types'
import {IUser} from '../../types/user'
import {UserController} from '../controllers'
import {Constants, debug, Exception, Token} from './'

interface IAuthorization {
  validate(authorization: string, client: Types.UserClient): Promise<boolean>
  encode(userId: string, token: string): string
  decode(authorization: string): {userId: string, token: string}
  getUser(authorization: string, client: Types.UserClient): Promise<IUser>
}

export class Authorization implements IAuthorization {
  /**
   * Validate the authorization string
   * @param {String} auth Authorization header
   * @return {String} userId(null for failure)
   */
  public async validate(authorization: string, client: Types.UserClient): Promise<boolean> {
    const {userId, token} = this.decode(authorization)
    const userToken = await Token.get(userId, client)
    return token === userToken
  }

  /**
   * Get authorization header from userId and token
   * @param {String} userId
   * @param {String} token
   * @return {String} authorization
   */
  public encode(userId: string, token: string): string {
    if (!userId || !token || !userId.length || !token.length) {
      debug(`Invalid args: userId: ${userId}, token: ${token}`)
      throw new Exception(1)
    }
    const authorization: string = new Buffer(`${userId} ${token}`).toString('base64')
    return authorization
  }

  /**
   * Get userId and token from authorization header
   * @param {String} authorization
   * @return {String} userId
   * @return {String} token
   */
  public decode(authorization: string): {userId: string, token: string} {
    if (!authorization.length) {
      debug(`Invalid args: authorization: ${authorization}`)
      throw new Exception(1)
    }
    const authStr: string = new Buffer(authorization, 'base64').toString('utf8')
    const spaceIndex: number = authStr.indexOf(' ')
    const userId: string = authStr.substr(0, spaceIndex)
    const token: string = authStr.substr(spaceIndex + 1)
    return {userId, token}
  }

  public async getUser(authorization: string, client: Types.UserClient): Promise<IUser> {
    const {userId, token} = this.decode(authorization)
    const userToken = await Token.get(userId, client)
    const result = {
      authorization: '',
      client,
      id: '',
      role: Types.UserRole.normal,
      token: '',
    }
    let user: IUser
    if (token === userToken) {
      user = await UserController.getProfile({}, {user: {id: userId, token}})
      if (user) {
        result.authorization = this.encode(user.id, user.token)
        result.id = user.id
        result.role = user.role
        result.token = user.token
      }
    }
    return result
  }
}
