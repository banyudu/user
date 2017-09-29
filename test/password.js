const Password = require('../src/password');
const assert = require('power-assert');
const {chance} = require('./assets/common');

describe('sha256', () => {
  it('with salt', () => {
    const password = chance.string();
    const salt = chance.string();
    const encrypted = Password.sha256(password, salt);
    assert.equal(salt, encrypted.salt);
    assert.notEqual(password, encrypted.password);
    const encrypted2 = Password.sha256(password, salt);
    assert.equal(encrypted.password, encrypted2.password);
  })
  it('without salt', () => {
    const password = chance.string();
    const encrypted = Password.sha256(password);
    assert.notEqual(password, encrypted.password);
    const encrypted2 = Password.sha256(password, encrypted.salt);
    assert.equal(encrypted.password, encrypted2.password);
  })
});
