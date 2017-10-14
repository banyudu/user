import * as assert from 'power-assert'
import {User} from '../../src/controllers'
import {Constants} from '../../src/services'
import {chance, Run, Support} from '../assets'

describe('User#signup', () => {
  it('signup with name', (done) => {
    Run(async () => {
      const username = chance.first()
      const password = chance.password()
      const user = await User.signup({username, password})
      assert(user.id, 'id')
      assert(user.token, 'token')
    }, done)
  })
  it('signup with email', (done) => {
    Run(async () => {
      const email = chance.email()
      const password = chance.password()
      const user = await User.signup({email, password})
      assert(user.id, 'id')
      assert(user.token, 'token')
    }, done)
  })
})

describe('User#signin', () => {
  it('signin with username', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const user = await User.signin({
        account: normalUser.username,
        password: normalUser.password,
      }, {client: normalUser.client})
      assert.equal(user.id, normalUser.id, `id of ${normalUser.username}`)
      assert.notEqual(user.token, null, `token of ${normalUser.username}`)
    }, done)
  })

  it('signin with email', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const user = await User.signin({
        account: normalUser.email,
        password: normalUser.password,
      }, {client: normalUser.client})
      assert.equal(user.id, normalUser.id, `id of ${normalUser.email}`)
      assert.notEqual(user.token, null, `token of ${normalUser.email}`)
    }, done)
  })
})

describe('User#delete', () => {
  it('normal user delete self', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const result = await User.deleteUser({ id: normalUser.id }, {authorization: normalUser.authorization})
    }, done)
  })
  it('administrator delete self', (done) => {
    Run(async () => {
      const administrator = await Support.getAdministrator()
      const result = await User.deleteUser({ id: administrator.id }, {authorization: administrator.authorization})
    }, done)
  })
  it('normal user delete another normal user', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const newNormalUser = await Support.getNormalUser({refresh: true})
      const result = await User.deleteUser({ id: normalUser.id }, {authorization: newNormalUser.authorization})
    }, done)
  })
  it('administrator delete another administrator', (done) => {
    Run(async () => {
      const administrator = await Support.getAdministrator()
      const newAdministrator = await Support.getAdministrator({refresh: true})
      const result = await User.deleteUser({ id: administrator.id }, {authorization: newAdministrator.authorization})
    }, done)
  })
  it('administrator delete normalUser', (done) => {
    Run(async () => {
      const administrator = await Support.getAdministrator()
      const normalUser = await Support.getNormalUser()
      const result = await User.deleteUser({ id: normalUser.id }, {authorization: administrator.authorization})
      // refresh normal user
      await Support.getNormalUser({refresh: true})
    }, done)
  })
  it('normalUser delete administrator', (done) => {
    Run(async () => {
      const administrator = await Support.getAdministrator()
      const normalUser = await Support.getNormalUser()
      const result = await User.deleteUser({ id: administrator.id }, {authorization: normalUser.authorization})
      // refresh normal user
      await Support.getAdministrator({refresh: true})
    }, done)
  })
})
