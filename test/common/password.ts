import * as assert from 'power-assert'
import {Password} from '../../src/common'
import {Chance} from '../assets'

describe('sha256', () => {
  it('with salt', () => {
    const password = Chance.string()
    const salt = Chance.string()
    const encrypted = Password.sha256(password, salt)
    assert.equal(salt, encrypted.salt)
    assert.notEqual(password, encrypted.password)
    const encrypted2 = Password.sha256(password, salt)
    assert.equal(encrypted.password, encrypted2.password)
  })
  it('without salt', () => {
    const password = Chance.string()
    const encrypted = Password.sha256(password)
    assert.notEqual(password, encrypted.password)
    const encrypted2 = Password.sha256(password, encrypted.salt)
    assert.equal(encrypted.password, encrypted2.password)
  })
})
