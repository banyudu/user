'use strict'

// const constants = require('./constant');
// const validator = require('validator');

interface IAuthorization {
  validate(authorization): Promise<boolean>
  encode(userId, token): string
  decode(authorization): {userId: string, token: string}
}

export class Authorization implements IAuthorization {
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
  public encode(userId, token): string {
    // TODO: implement this function
    return ''
  }

  /**
   * Get userId and token from authorization header
   * @param {String} authorization
   * @return {String} userId
   * @return {String} token
   */
  public decode(authorization): {userId: string, token: string} {
    // TODO: implement this function
    return {userId: '', token: ''}
  }
}
