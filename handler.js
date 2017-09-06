'use strict';

const User = require('./user');
const co = require('co');
const UserHandler = new User();

function* run(event, context, callback, handler) {
  const response = {
    statusCode: 200,
    body: {
      code: 1,
      msg: `Unknown Error`,
    },
  };
  try {
    const func = UserHandler[handler];
    if (func) {
      const data = yield func();
      response.body = {
        code: 0,
        data,
      };
    }
  } catch (error) {
    console.error(error);
  }
  callback(null, response);
}

// routers
const attrs = Object.getOwnPropertyNames(User.prototype);
for (const attr of attrs) {
  const blacklist = ['constructor'];
  const type = typeof User.prototype[attr];
  if (type === 'function') {
    module.exports[attr] = (event, context, callback) => {
      co(run(event, context, callback, attr));
    }
  }
}