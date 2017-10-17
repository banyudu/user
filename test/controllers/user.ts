import * as assert from 'power-assert'
import {UserController} from '../../src/controllers'
import {Constants} from '../../src/services'
import {chance, Run, Support} from '../assets'

describe('User#signup', () => {
  it('signup with name', (done) => {
    Run(async () => {
      const username = chance.first()
      const password = chance.password()
      const user = await UserController.signup({username, password})
      assert(user.id, 'id')
      assert(user.token, 'token')
    }, done)
  })
  it('signup with email', (done) => {
    Run(async () => {
      const email = chance.email()
      const password = chance.password()
      const user = await UserController.signup({email, password})
      assert(user.id, 'id')
      assert(user.token, 'token')
    }, done)
  })
})

describe('User#signin', () => {
  it('signin with username', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const user = await UserController.signin({
        account: normalUser.username,
        password: normalUser.password,
      }, await Support.getHeaders(normalUser))
      assert.equal(user.id, normalUser.id, `id of ${normalUser.username}`)
      assert.notEqual(user.token, null, `token of ${normalUser.username}`)
    }, done)
  })

  it('signin with email', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const user = await UserController.signin({
        account: normalUser.email,
        password: normalUser.password,
      }, await Support.getHeaders(normalUser))
      assert.equal(user.id, normalUser.id, `id of ${normalUser.email}`)
      assert.notEqual(user.token, null, `token of ${normalUser.email}`)
    }, done)
  })
})

describe('User#delete', () => {
  it('normal user delete self', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const result = await UserController.deleteUser({ id: normalUser.id }, await Support.getHeaders(normalUser))
    }, done, {expectException: 1301})
  })
  it('administrator delete self', (done) => {
    Run(async () => {
      const administrator = await Support.getAdministrator()
      const result = await UserController.deleteUser(
        { id: administrator.id }, await Support.getHeaders(administrator))
    }, done, {expectException: 1301})
  })
  it('normal user delete another normal user', (done) => {
    Run(async () => {
      const normalUser = await Support.getNormalUser()
      const newNormalUser = await Support.getNormalUser({refresh: true})
      const result = await UserController.deleteUser(
        { id: normalUser.id }, await Support.getHeaders(normalUser))
    }, done, {expectException: 1301})
  })
  it('administrator delete another administrator', (done) => {
    Run(async () => {
      const administrator = await Support.getAdministrator()
      const newAdministrator = await Support.getAdministrator({refresh: true})
      const result = await UserController.deleteUser(
        { id: administrator.id }, await Support.getHeaders(newAdministrator))
    }, done, {expectException: 1301})
  })
  it('administrator delete normalUser', (done) => {
    Run(async () => {
      const administrator = await Support.getAdministrator()
      const normalUser = await Support.getNormalUser()
      const result = await UserController.deleteUser(
        { id: normalUser.id }, await Support.getHeaders(administrator))
      // refresh normal user
      await Support.getNormalUser({refresh: true})
    }, done)
  })
  it('normalUser delete administrator', (done) => {
    Run(async () => {
      const administrator = await Support.getAdministrator()
      const normalUser = await Support.getNormalUser()
      const result = await UserController.deleteUser(
        { id: administrator.id }, await Support.getHeaders(normalUser))
      // refresh normal user
      await Support.getAdministrator({refresh: true})
    }, done, {expectException: 1301})
  })
})
