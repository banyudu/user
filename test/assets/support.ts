import {UserController} from '../../src/controllers'
import {Authorization, Constants, db, Exception} from '../../src/services'
import * as Types from '../../types'
import {chance} from './'

interface ISupportUser {
  id: string,
  token: string,
  username?: string,
  email?: string,
  password: string,
  authorization: string,
  client: Types.UserClient,
  role: Types.UserRole,
}

interface ISupportUserOption {
  refresh?: boolean
}

interface ISupport {
  getAdministrator(options?: ISupportUserOption): Promise<ISupportUser>
  getNormalUser(options?: ISupportUserOption): Promise<ISupportUser>
  getMaster(options?: ISupportUserOption): Promise<ISupportUser>
  getHeaders(user: ISupportUser): Promise<{client: Types.UserClient, user: Types.IUser}>
}

export class Support implements ISupport {
  private administrator: ISupportUser
  private normalUser: ISupportUser
  private master: ISupportUser

  /**
   * Get administrator account
   * @param {Object} options
   * @param {Boolean} options.refresh Whether refresh account
   */
  public async getAdministrator(options?: ISupportUserOption): Promise<ISupportUser> {
    options = options || {refresh: false}
    if (!this.administrator || options.refresh) {
      this.administrator = await this.refreshUser(Types.UserRole.administrator)
    }
    return this.administrator
  }

  /**
   * Get normal account
   * @param {Object} options
   * @param {Boolean} options.refresh Whether refresh account
   */
  public async getNormalUser(options?: ISupportUserOption): Promise<ISupportUser> {
    options = options || {refresh: false}
    if (!this.normalUser || options.refresh) {
      this.normalUser = await this.refreshUser(Types.UserRole.normal)
    }
    return this.normalUser
  }

  /**
   * Get master account
   * @param {Object} options
   * @param {Boolean} options.refresh Whether refresh account
   */
  public async getMaster(options?: ISupportUserOption): Promise<ISupportUser> {
    options = options || {refresh: false}
    if (!this.master || options.refresh) {
      this.master = await this.refreshUser(Types.UserRole.master)
    }
    return this.master
  }

  public async getHeaders(user: ISupportUser): Promise<{client: Types.UserClient, user: Types.IUser}> {
    //
    const userInfo = await Authorization.getUser(user.authorization, user.client)
    return {client: user.client, user: userInfo}
  }

  private async refreshUser(role: Types.UserRole): Promise<ISupportUser> {
    if ([
      Types.UserRole.administrator,
      Types.UserRole.master,
      Types.UserRole.normal,
    ].indexOf(role) === -1) {
      throw new Exception(5)
    }
    const username = chance.first()
    const email = chance.email()
    const password = chance.password()
    const client = chance.pickone([Types.UserClient.jinjuDB, Types.UserClient.jinjuStock])
    const params = {username, email, password, role}
    const user = await UserController.signup(params, {client})
    // default signup role is normalUser, check whether need to modify user role
    await db.update({
      ExpressionAttributeNames: {'#attrName': 'role'},
      ExpressionAttributeValues: { ':attrValue': role },
      Key: {id: user.id},
      TableName: Constants.tables.users,
      UpdateExpression: `SET #attrName = :attrValue`,
    }).promise()
    const id = user.id
    const token = user.token
    const authorization = await Authorization.encode(id, token)
    if (role === Types.UserRole.administrator) {
      this.administrator = {id, token, authorization, username, email, password, client, role}
      return this.administrator
    } else {
      this.normalUser = {id, token, authorization, username, email, password, client, role}
      return this.normalUser
    }
  }
}
