import * as assert from 'power-assert'
import {Account, Constants} from '../../src/services'
import {chance, Run, Support} from '../assets'

describe('Account#getAccountType: ', () => {
  it('username', (done) => {
    Run(async () => {
      const account = chance.first()
      const type = await Account.getAccountType(account)
      assert.equal(type, Constants.accountType.name, `accountType of ${account}`)
    }, done)
  })
  it('email', (done) => {
    Run(async () => {
      const account = chance.email()
      const type = await Account.getAccountType(account)
      assert.equal(type, Constants.accountType.email, `accountType of ${account}`)
    }, done)
  })
  it('space', (done) => {
    Run(async () => {
      const account = 'Jim Green'
      const type = await Account.getAccountType(account)
      assert.equal(type, null, `accountType of ${account}`)
    }, done)
  })
  it('special characters', (done) => {
    Run(async () => {
      const account = 'Jim#Green'
      const type = await Account.getAccountType(account)
      assert.equal(type, null, `accountType of ${account}`)
    }, done)
  })
})
