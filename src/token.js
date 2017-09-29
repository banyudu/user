'use strict';

// const constants = require('./constant');
// const validator = require('validator');

class Token {
  /**
   * Get token for given user
   * @param {String} userId
   * @param {Object} client
   * @param {String} client.product
   * @param {String} client.version
   * @param {String} client.userAgent
   * @return {String} Token
   */
  *get(userId, client) {
    // TODO: implement this function
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
  *refresh(userId, client) {
    // TODO: implement this function
  }
}

module.exports = new Token();
