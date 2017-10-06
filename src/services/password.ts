'use strict'

import crypto = require('crypto')

export class Password {
  public genSalt(): string {
    return crypto.randomBytes(Math.ceil(8))
      .toString('hex')
      .slice(0, 16)
  }

  public sha256(password: string, salt?: string): {salt: string, password: string} {
    salt = salt || this.genSalt()
    const hash = crypto.createHmac('sha256', salt)
    hash.update(password)
    const value = hash.digest('hex')
    return {
      password: value,
      salt,
    }
  }
}
