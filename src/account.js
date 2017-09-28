'use strict';

const constants = require('./constant');
const validator = require('validator');

class Account {
  /**
   * Get account type from account
   * @param {String} account
   * @return {enum ACCOUNT_TYPE} the type of this account
   */
  getAccountType(account) {
    if (validator.isEmail(account)) {
      return constants.ACCOUNT_TYPES.EMAIL;
    }
    if (constants.REGEX.USER_NAME.test(account)) {
      return constants.ACCOUNT_TYPES.NAME;
    }
    return null;
  }
}

module.exports = new Account();
