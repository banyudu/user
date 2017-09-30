import * as assert from 'power-assert'
import {User as UserClass} from '../../src/controllers/user'
import {Chance, Run, Support} from '../assets'

const User = new UserClass()

describe('signup', () => {
  it('signup with name', (done) => {
    Run(async () => {
      const username = Chance.first()
      const password = Chance.string()
      const user = await User.signup({username, password})
      assert(user.id)
      assert(user.token)
    }, done)
  })
  it('signup with email', (done) => {
    Run(async () => {
      const email = Chance.email()
      const password = Chance.string()
      const user = await User.signup({email, password})
      assert(user.id)
      assert(user.token)
    }, done)
  })
})

describe('signin', () => {
  it('signin with username', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const user = await User.signin({
        password: normalUser.password,
        username: normalUser.username,
      })
      assert.equal(user.id, normalUser.id)
      assert.equal(user.token, normalUser.token)
    }, done)
  })

  it('signin with email', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const user = await User.signin({
        password: normalUser.password,
        username: normalUser.email,
      })
      assert.equal(user.id, normalUser.id)
      assert.equal(user.token, normalUser.token)
    }, done)
  })
})

describe('delete', () => {
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
