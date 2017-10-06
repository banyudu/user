import * as assert from 'power-assert'
import {Token} from '../../src/services'
import {Chance, Run, Support} from '../assets'

describe('Token#get', () => {
  it('normalUser', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const token = await Token.get(normalUser.id, normalUser.client)
      assert.equal(token, normalUser.token, 'token')
    }, done)
  })
})
