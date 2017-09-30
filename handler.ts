'use strict'

import * as _ from 'lodash'
import qs = require('qs')
import {User} from './src/controllers/user'
const UserHandler = new User()

interface IResponse {
  statusCode: number,
  body: {
    code: number,
    data?: any,
    msg?: string,
  }
}

async function run(event, context, callback, handler) {
  const response: IResponse = {
    body: {
      code: 1,
      msg: `Unknown Error`,
    },
    statusCode: 200,
  }
  let params = Object.assign({}, event.pathParameters)
  if (event.httpMethod === 'GET') {
    params = Object.assign(params, event.queryStringParameters)
  } else if (event.body) {
    let body = null
    try {
      body = JSON.parse(event.body)
    } catch (error) {
      body = qs.parse(event.body)
    }
    params = Object.assign(params, body)
  }

  // trim all fields and remove null/undefined fields
  _.forEach(params, (value, key) => {
    params[key] = _.trim(value)
    if (_.isNil(params[key])) {
      delete params[key]
    }
  })
  try {
    const func = UserHandler[handler]
    if (func) {
      const data = await func.bind(UserHandler)(params, event.headers)
      response.body = {
        code: 0,
        data,
      }
    }
  } catch (error) {
    if (error.code) {
      response.body.code = error.code
    }
    if (error.msg) {
      response.body.msg = error.msg
    }
  }
  callback(null, response)
}

// routers
const Routers: any = {}
const attrs = Object.getOwnPropertyNames(UserHandler.constructor.prototype)
const blacklist = ['constructor']
for (const attr of attrs) {
  if (blacklist.indexOf(attr) === -1) {
    const type = typeof UserHandler.constructor.prototype[attr]
    if (type === 'function') {
      Routers[attr] = async (event, context, callback) => {
        await run(event, context, callback, attr)
      }
    }
  }
}

module.exports = Routers
