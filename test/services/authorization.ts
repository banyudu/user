import * as assert from 'power-assert'
import {User} from '../../src/controllers'
import {Authorization} from '../../src/services'
import {chance, Run, Support} from '../assets'

describe('Authorization#encode: ', () => {
  it('direct value', () => {
    assert.equal(Authorization.encode(
      '95d29240-b279-4174-8061-dbf40a470247',
      'aa1a4ed8-bf32-4b8f-8cf1-674bc7c9f2ae'),
    'OTVkMjkyNDAtYjI3OS00MTc0LTgwNjEtZGJmNDBhNDcwMjQ3IGFhMWE0ZWQ4LWJmMzItNGI4Zi04Y2YxLTY3NGJjN2M5ZjJhZQ==')
  })
})

describe('Authorization#decode: ', () => {
  it('direct value', () => {
    const {userId, token} = Authorization.decode(
      'OTVkMjkyNDAtYjI3OS00MTc0LTgwNjEtZGJmNDBhNDcwMjQ3IGFhMWE0ZWQ4LWJmMzItNGI4Zi04Y2YxLTY3NGJjN2M5ZjJhZQ==')
    assert.equal(userId, '95d29240-b279-4174-8061-dbf40a470247')
    assert.equal(token, 'aa1a4ed8-bf32-4b8f-8cf1-674bc7c9f2ae')
  })
})


describe('Authorization#validate: ', () => {
  it('normal values', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const checkResult = await Authorization.validate(normalUser.authorization, normalUser.client)
      assert(checkResult, 'Authorization validate')
    }, done)
  })
})
