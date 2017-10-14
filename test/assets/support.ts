import {User} from '../../src/controllers'
import {Authorization, Constants, db, Exception} from '../../src/services'
import {chance} from './'

interface ISupportUser {
  id: string,
  token: string,
  username?: string,
  email?: string,
  password: string,
  authorization: string,
  client: Constants.client,
  role: Constants.userRole,
}

interface ISupportUserOption {
  refresh?: boolean
}

interface ISupport {
  getAdministrator(options?: ISupportUserOption): Promise<ISupportUser>
  getNormalUser(options?: ISupportUserOption): Promise<ISupportUser>
  getMaster(options?: ISupportUserOption): Promise<ISupportUser>
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
      this.administrator = await this.refreshUser(Constants.userRole.administrator)
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
      this.normalUser = await this.refreshUser(Constants.userRole.normal)
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
      this.master = await this.refreshUser(Constants.userRole.master)
    }
    return this.master
  }

  private async refreshUser(role: Constants.userRole): Promise<ISupportUser> {
    if ([
      Constants.userRole.administrator,
      Constants.userRole.master,
      Constants.userRole.normal,
    ].indexOf(role) === -1) {
      throw new Exception(5)
    }
    const username = chance.first()
    const email = chance.email()
    const password = chance.password()
    const client = chance.pickone([Constants.client.jinjuDB, Constants.client.jinjuStock])
    const params = {username, email, password, role}
    const user = await User.signup(params, {client})
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
    if (role === Constants.userRole.administrator) {
      this.administrator = {id, token, authorization, username, email, password, client, role}
      return this.administrator
    } else {
      this.normalUser = {id, token, authorization, username, email, password, client, role}
      return this.normalUser
    }
  }
}
