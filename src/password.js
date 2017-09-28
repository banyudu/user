'use strict';

const crypto = require('crypto');

class Password {
  genSalt() {
    return crypto.randomBytes(Math.ceil(8))
      .toString('hex')
      .slice(0, 16);
  }

  sha256(password, salt) {
    salt = salt || this.genSalt();
    const hash = crypto.createHmac('sha256', salt);
    hash.update(password);
    const value = hash.digest('hex');
    return {
      salt: salt,
      password: value
    };
  }
}

module.exports = new Password();
