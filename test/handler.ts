import * as fs from 'fs'
import * as YAML from 'js-yaml'
import * as path from 'path'
import * as assert from 'power-assert'
import {User} from '../src/controllers/user'

describe('serverless.yml', () => {
  const configFile = fs.readFileSync(path.join(__dirname, '..', 'serverless.yml'), 'utf-8')
  const config = YAML.safeLoad(configFile)
  it('functions', () => {
    // check functions in serverless.yml exists in handler
    for (const key in config.functions) {
      if (config.functions.hasOwnProperty(key)) {
        const value = config.functions[key]
        const functionName = value.handler.substr(value.handler.indexOf('.') + 1)
        assert.equal(typeof User.prototype[functionName], 'function', `Missing ${functionName} in handler`)
      }
    }
  })
})
