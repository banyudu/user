'use strict'

import * as _ from 'lodash'
import qs = require('qs')
import {UserController} from './src/controllers'
import {Authorization} from './src/services'

interface IResponse {
  statusCode: number,
  body: {
    code: number,
    data?: any,
    msg?: string,
  }
}

const API_WHITE_LIST = ['signin', 'signup']

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
    event.headers = event.headers || {}
    if (event.headers.authorization) {
      event.headers.user = await Authorization.getUser(event.headers.authorization, event.headers.client)
    }
    const func = UserController[handler]
    if (func) {
      const data = await func.bind(UserController)(params, event.headers)
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
const attrs = Object.getOwnPropertyNames(UserController.constructor.prototype)
const blacklist = ['constructor']
for (const attr of attrs) {
  if (blacklist.indexOf(attr) === -1) {
    const type = typeof UserController.constructor.prototype[attr]
    if (type === 'function') {
      Routers[attr] = async (event, context, callback) => {
        await run(event, context, callback, attr)
      }
    }
  }
}

module.exports = Routers
