'use strict'

// const constants = require('./constant');
// const validator = require('validator');

export class Token {
  /**
   * Get token for given user
   * @param {String} userId
   * @param {Object} client
   * @param {String} client.product
   * @param {String} client.version
   * @param {String} client.userAgent
   * @return {String} Token
   */
  public get(userId: string, client: string): string {
    // TODO: implement this function
    return ''
  }

  /**
   * Refresh token for given user
   * @param {String} userId
   * @param {Object} client
   * @param {String} client.product
   * @param {String} client.version
   * @param {String} client.userAgent
   * @return {String} Token
   */
  public refresh(userId: string, client: string): string {
    // TODO: implement this function
    return ''
  }
}
