import {User} from '../../src/controllers'
import {Authorization, Constants, Exception} from '../../src/services'
import {Chance} from './'

interface ISupportUser {
  id: string,
  token: string,
  username?: string,
  email?: string,
  password: string,
  authorization: string,
  client: Constants.client,
}

interface ISupportUserOption {
  refresh?: boolean
}

interface ISupport {
  getAdministrator(options?: ISupportUserOption): Promise<ISupportUser>
  getNormalUser(options?: ISupportUserOption): Promise<ISupportUser>
}

export class Support implements ISupport {
  private administrator: ISupportUser
  private normalUser: ISupportUser

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

  private async refreshUser(role: Constants.userRole): Promise<ISupportUser> {
    if ((role !== Constants.userRole.administrator) && (role !== Constants.userRole.normal)) {
      // only test administrator and normalUser, not master
      throw new Exception(5)
    }
    const username = Chance.first()
    const email = Chance.email()
    const password = Chance.string()
    const client = Chance.pickone(Constants.client.jinjuDB, Constants.client.jinjuStock)
    const params = {username, email, password, client}
    const user = await User.signup(params)
    const id = user.id
    const token = user.token
    const authorization = await Authorization.encrypt(id, token)
    if (role === Constants.userRole.administrator) {
      this.administrator = {id, token, authorization, username, email, password, client}
      return this.administrator
    } else {
      this.normalUser = {id, token, authorization, username, email, password, client}
      return this.normalUser
    }
  }
}
