import validator = require('validator')
import * as Types from '../../types'
import {Constants} from './'

export class Account {
  /**
   * Get account type from account
   * @param {String} account
   * @return {enum ACCOUNT_TYPE} the type of this account
   */
  public getAccountType(account: string) {
    if (validator.isEmail(account)) {
      return Types.AccountType.email
    }
    if (Constants.regex.username.test(account)) {
      return Types.AccountType.name
    }
    return null
  }
}
