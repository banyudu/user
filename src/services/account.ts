import validator = require('validator')
import {Constants} from './'

export class Account {
  /**
   * Get account type from account
   * @param {String} account
   * @return {enum ACCOUNT_TYPE} the type of this account
   */
  public getAccountType(account: string) {
    if (validator.isEmail(account)) {
      return Constants.accountType.email
    }
    if (Constants.regex.username.test(account)) {
      return Constants.accountType.name
    }
    return null
  }
}
