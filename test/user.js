const assert = require('power-assert');
const User = require('../src/user');
const {run, chance} = require('./assets/common');
const Support = require('./assets/support');

describe('createUser', () => {
  it('create with name', done => {
    run(function* () {
      const username = chance.first();
      const password = chance.string();
      const user = yield User.createUser({username, password});
      assert(user.id);
      assert(user.token);
    }, done);
  });
  it('create with email', done => {
    run(function* () {
      const email = chance.email();
      const password = chance.string();
      const result = yield User.createUser({email, password});
      assert.equal(result.code, 0);
      assert(result.data.id);
      assert(result.data.token);
    }, done);
  });
});

describe('signin', () => {
  it('signin with username', done => {
    run(function *() {
      const normalUser = yield Support.getNormalUser();
      const result = yield User.signin({
        username: normalUser.username,
        password: normalUser.password,
      });
      assert.equal(result.code, 0);
      assert.equal(result.data.id, normalUser.id);
      assert.equal(result.data.token, normalUser.token);
    }, done);
  });

  it('signin with email', done => {
    run(function *() {
      const normalUser = yield Support.getNormalUser();
      const result = yield User.signin({
        username: normalUser.email,
        password: normalUser.password,
      });
      assert.equal(result.code, 0);
      assert.equal(result.data.id, normalUser.id);
      assert.equal(result.data.token, normalUser.token);
    }, done);
  });
});

describe('delete', () => {
  it('normal user delete self', done => {
    run(function *() {
      const normalUser = yield Support.getNormalUser();
      const result = yield User.deleteUser({ id: normalUser.id }, {authorization: normalUser.authorization});
      assert.equal(result.code, 0);
    }, done);
  });
  it('administrator delete self', done => {
    run(function *() {
      const administrator = yield Support.getAdministrator();
      const result = yield User.deleteUser({ id: administrator.id }, {authorization: administrator.authorization});
      assert.equal(result.code, 0);
    }, done);
  });
  it('normal user delete another normal user', done => {
    run(function *() {
      const normalUser = yield Support.getNormalUser();
      const newNormalUser = yield Support.getNormalUser({refresh: true});
      const result = yield User.deleteUser({ id: normalUser.id }, {authorization: newNormalUser.authorization});
      assert.notEqual(result.code, 0);
    }, done);
  });
  it('administrator delete another administrator', done => {
    run(function *() {
      const administrator = yield Support.getAdministrator();
      const newAdministrator = yield Support.getAdministrator({refresh: true});
      const result = yield User.deleteUser({ id: administrator.id }, {authorization: newAdministrator.authorization});
      assert.notEqual(result.code, 0);
    }, done);
  });
  it('administrator delete normalUser', done => {
    run(function *() {
      const administrator = yield Support.getAdministrator();
      const normalUser = yield Support.getNormalUser();
      const result = yield User.deleteUser({ id: normalUser.id }, {authorization: administrator.authorization});
      assert.equal(result.code, 0);
      // refresh normal user
      yield Support.getNormalUser({refresh: true});
    }, done);
  });
  it('normalUser delete administrator', done => {
    run(function *() {
      const administrator = yield Support.getAdministrator();
      const normalUser = yield Support.getNormalUser();
      const result = yield User.deleteUser({ id: administrator.id }, {authorization: normalUser.authorization});
      assert.notEqual(result.code, 0);
      // refresh normal user
      yield Support.getAdministrator({refresh: true});
    }, done);
  });
});
