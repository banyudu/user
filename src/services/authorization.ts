'use strict'

// const constants = require('./constant');
// const validator = require('validator');

export class Authorization {
  /**
   * Validate the authorization string
   * @param {String} auth Authorization header
   * @return {String} userId(null for failure)
   */
  public async validate(authorization): Promise<boolean> {
    // TODO: implement this function
    return false
  }

  /**
   * Get authorization header from userId and token
   * @param {String} userId
   * @param {String} token
   * @return {String} authorization
   */
  public async encrypt(userId, token): Promise<string> {
    // TODO: implement this function
    return ''
  }

  /**
   * Get userId and token from authorization header
   * @param {String} authorization
   * @return {String} userId
   * @return {String} token
   */
  public async decrypt(authorization): Promise<{userId: string, token: string}> {
    // TODO: implement this function
    return {userId: '', token: ''}
  }
}
