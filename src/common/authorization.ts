'use strict'

// const constants = require('./constant');
// const validator = require('validator');

export class Authorization {
  /**
   * Validate the authorization string
   * @param {String} auth Authorization header
   * @return {String} userId(null for failure)
   */
  public async validate(authorization) {
    // TODO: implement this function
  }

  /**
   * Create authorization string from userId
   * @param {String} userId User ID
   * @return {String} Authorization string
   */
  public async create(userId) {
    // TODO: implement this function
  }

  /**
   * Get authorization header from userId and token
   * @param {String} userId
   * @param {String} token
   * @return {String} authorization
   */
  public async encrypt(userId, token) {
    // TODO: implement this function
  }

  /**
   * Get userId and token from authorization header
   * @param {String} authorization
   * @return {String} userId
   * @return {String} token
   */
  public async decrypt(authorization) {
    // TODO: implement this function
  }
}
