import validator = require('validator')
import constants = require('./constant')

export class Account {
  /**
   * Get account type from account
   * @param {String} account
   * @return {enum ACCOUNT_TYPE} the type of this account
   */
  public getAccountType(account: string) {
    if (validator.isEmail(account)) {
      return constants.ACCOUNT_TYPES.EMAIL
    }
    if (constants.REGEX.USER_NAME.test(account)) {
      return constants.ACCOUNT_TYPES.NAME
    }
    return null
  }
}
