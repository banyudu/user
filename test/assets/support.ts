interface ISupportUser {
  id: string,
  token: string,
  username?: string,
  email?: string,
  password: string,
  authorization: string,
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
    // TODO: implement this function
    return {id: '', token: '', password: '', authorization: ''}
  }

  /**
   * Get normal account
   * @param {Object} options
   * @param {Boolean} options.refresh Whether refresh account
   */
  public async getNormalUser(options?: ISupportUserOption): Promise<ISupportUser> {
    // TODO: implement this function
    return {id: '', token: '', password: '', authorization: ''}
  }
}
