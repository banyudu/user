'use strict';

// const constants = require('./constant');

class Support {
  constructor() {
    this.administrator = null;
    this.normalUser = null;
  }
  /**
   * Get administrator account
   * @param {Object} options
   * @param {Boolean} options.refresh Whether refresh account
   */
  *getAdministrator(options) {
    // TODO: implement this function
  }

  /**
   * Get normal account
   * @param {Object} options
   * @param {Boolean} options.refresh Whether refresh account
   */
  *getNormalUser(options) {
    // TODO: implement this function
  }
}

module.exports = new Support();
