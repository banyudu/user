'use strict';

const co = require('co');
const qs = require('qs');
const _ = require('lodash');
const UserHandler = require('./src/user');

function* run(event, context, callback, handler) {
  const response = {
    statusCode: 200,
    body: {
      code: 1,
      msg: `Unknown Error`,
    },
  };
  let params = Object.assign({}, event.pathParameters);
  if (event.httpMethod === 'GET') {
    params = Object.assign(params, event.queryStringParameters);
  } else if(event.body) {
    let body = null;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      body = qs.parse(event.body);
    }
    params = Object.assign(params, body);
  }

  // trim all fields and remove null/undefined fields
  _.forEach(params, (value, key) => {
    params[key] = _.trim(value);
    if (_.isNil(params[key])) {
      delete params[key];
    }
  })
  try {
    const func = UserHandler[handler];
    if (func) {
      const data = yield func.bind(UserHandler)(params, event.headers);
      response.body = {
        code: 0,
        data,
      };
    }
  } catch (error) {
    console.error(error);
    if (error.code) {
      response.body.code = error.code;
    }
    if (error.msg) {
      response.body.msg = error.msg;
    }
  }
  callback(null, response);
}

// routers
const attrs = Object.getOwnPropertyNames(UserHandler.constructor.prototype);
const blacklist = ['constructor'];
for (const attr of attrs) {
  if (blacklist.indexOf(attr) === -1) {
    const type = typeof UserHandler.constructor.prototype[attr];
    if (type === 'function') {
      module.exports[attr] = (event, context, callback) => {
        co(run(event, context, callback, attr));
      }
    }
  }
}
