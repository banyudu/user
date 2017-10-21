/**
 * @file user.js handler functions for user service
 */
'use strict'
import * as _ from 'lodash'
import * as uuid from 'uuid/v4'
import * as validator from 'validator'
import * as Types from '../../types'
import {IUser} from '../../types/user'
import {Account, Constants, db, debug, Exception, Password, Token} from '../services'

const KEY_FIELDS = ['username', 'email']
const REQUIRED_FIELDS = ['password']
const EXTRA_FIELDS = ['firstName', 'lastName', 'sex']
const KEY_TABLE_MAP = {
  email: 'emailUsers',
  username: 'nameUsers',
}

interface ISigninResult {
  id: string
  token: string
}

interface IUserController {
  signup(params: any, headers?: any): Promise<{id: string, token: string}>
  getProfile(params: any, headers?: any): Promise<IUser>
  signin(params: any, headers?: any): Promise<{id: string, token: string}>
  signout(params: any, headers?: any): Promise<void>
  setProfile(params: any, headers?: any): Promise<{id: string}>
  deleteUser(params: any, headers?: any): Promise<void>
}

/**
 * @class User handler functions for user service
 */
export class UserController implements IUserController {
  constructor() {
    // do nothing
  }

  /**
   * Create a user
   * @param {Object} params
   * @param {String} params.email
   * @param {String} params.username
   * @param {String} params.pssword
   * @param {String} params.firstName
   * @param {String} params.lastName
   * @param {Number} params.sex
   * @param {Object} headers
   */
  public async signup(params: any, headers?: any): Promise<{id: string, token: string}> {
    headers = headers || {}
    const acceptFields = KEY_FIELDS.concat(EXTRA_FIELDS).concat(REQUIRED_FIELDS)

    // require at least one key in keyFields exists
    const actualKeyFields = KEY_FIELDS.filter((e) => !_.isNil(params[e])) || []
    if (!actualKeyFields.length) {
      throw new Exception(4)
    }

    if (_.some(REQUIRED_FIELDS, (e) => _.isNil(params[e]))) {
      throw new Exception(4)
    }

    // pick accepted fields
    const data: any = _.pick(params, acceptFields)

    // validate data
    if (data.username && !Constants.regex.username.test(data.username)) {
      throw new Exception(1000)
    }
    if (data.email && !validator.isEmail(data.email)) {
      throw new Exception(1001)
    }
    if (!Constants.regex.password.test(data.password)) {
      throw new Exception(1005)
    }
    ['firstName', 'lastName'].forEach((e) => {
      if (data[e] && !Constants.regex.fullname.test(data[e])) {
        throw new Exception(1003)
      }
    })
    if (!_.isNil(data.sex)) {
      data.sex = parseInt(data.sex, 10) || null
      if (!_.includes([Constants.sex.female, Constants.sex.male], data.sex)) {
        throw new Exception(1004)
      }
    }
    data.role = Types.UserRole.normal
    headers.client = headers.client || Types.UserClient.other
    // validate complete

    // encrypt password
    const encrypted = Password.sha256(data.password)
    data.password = encrypted.password
    data.salt = encrypted.salt

    let currentKey
    const successKeys: string[] = []
    data.id = uuid()
    try {
      for (const key of actualKeyFields) {
        currentKey = key
        const tmpData = {userId: data.id, [key]: data[key]}
        const qryCreate = {
          ConditionExpression: `attribute_not_exists(${key})`,
          Item: tmpData,
          TableName: KEY_TABLE_MAP[key],
        }
        await db.put(qryCreate).promise()
        successKeys.push(key)
      }

      data.createdAt = data.updatedAt = new Date()
      // insert the master record
      const query = {
        ConditionExpression: `attribute_not_exists(id)`,
        Item: data,
        TableName: 'users',
      }
      await db.put(query).promise()
    } catch (error) {
      // rollback if fail
      for (const key of successKeys) {
        const tmpData = {userId: data.id}
        tmpData[key] = data[key]
        const query = {
          Key: {[key]: data[key]},
          TableName: KEY_TABLE_MAP[key],
        }
        await db.delete(query).promise()
      }
      throw error
    }

    const token = await Token.refresh(data.id, headers.client)
    return { id: data.id, token}
  }

  public async getProfile(params, headers): Promise<IUser> {
    const qryFindUser = {
      AttributesToGet: ['id', 'username', 'email', 'sex', 'firstName', 'lastName'],
      Key: {id: headers.user.id},
      TableName: 'users',
    }
    const qryResult = await db.get(qryFindUser).promise()
    const result: IUser = _.get(qryResult, 'Item')
    result.token = headers.user.token
    result.client = headers.client
    return result
  }

  public async signin(params, headers?: any): Promise<ISigninResult> {
    if (!params.account || !params.password) {
      throw new Exception(4)
    }
    if (!params.accountType) {
      params.accountType = Account.getAccountType(params.account)
      if (!params.accountType) {
        throw new Exception(1202)
      }
    }
    let fieldName
    switch (params.accountType) {
      case Types.AccountType.email: fieldName = 'email'; break
      case Types.AccountType.name: fieldName = 'username'; break
      default: throw new Exception(1201)
    }
    const tableName = KEY_TABLE_MAP[fieldName]
    const qryFindUserId = {
      AttributesToGet: [ 'userId' ],
      Key: { [fieldName]: params.account },
      TableName: tableName,
    }
    const result = await db.get(qryFindUserId).promise()
    const id: string = _.get(result, ['Item', 'userId'])
    if (_.isNil(id)) {
      throw new Exception(1200)
    }
    const qryGetUser = {
      AttributesToGet: ['password', 'salt'],
      Key: {id},
      TableName: 'users',
    }
    const userQryResult = await db.get(qryGetUser).promise()
    const user: any = _.get(userQryResult, 'Item')
    if (!user) {
      throw new Exception(1200)
    }
    const {password, salt} = user
    if (Password.sha256(params.password, salt).password !== password) {
      throw new Exception(1203)
    }
    const token = await Token.refresh(id, headers.client)
    return {id, token}
  }

  public async setProfile(params, headers): Promise<{id: string}> {
    if (_.isNil(params.id)) {
      throw new Exception(4)
    }
    const user = await this.getProfile(params, headers)
    const acceptFields = KEY_FIELDS.concat(EXTRA_FIELDS).concat(REQUIRED_FIELDS)

    // pick accepted fields
    const data: any = _.pick(params, acceptFields)

    // require at least one key in keyFields exists
    let actualKeyFields = KEY_FIELDS.filter((e) => !_.isNil(params[e])) || []
    actualKeyFields = actualKeyFields.filter((e) => params[e] !== user[e]) || []

    // validate data
    if (data.username && !Constants.regex.username.test(data.username)) {
      throw new Exception(1000)
    }
    if (data.email && !validator.isEmail(data.email)) {
      throw new Exception(1001)
    }
    ['firstName', 'lastName'].forEach((e) => {
      if (data[e] && !Constants.regex.fullname.test(data[e])) {
        throw new Exception(1003)
      }
    })
    if (!_.isNil(data.sex)) {
      data.sex = parseInt(data.sex, 10) || null
      if (!_.includes([Constants.sex.female, Constants.sex.male], data.sex)) {
        throw new Exception(1004)
      }
    }
    // validate complete

    let currentKey
    const successKeys: string[] = []
    try {
      for (const key of actualKeyFields) {
        currentKey = key
        const queryInsert = {
          ConditionExpression: `attribute_not_exists(${key})`,
          Item: {
            userId: params.id,
            [key]: data[key],
          },
          TableName: KEY_TABLE_MAP[key],
        }
        await db.put(queryInsert).promise()

        const queryDelete = {
          Key: {
            [key]: user[key],
          },
          TableName: KEY_TABLE_MAP[key],
        }
        await db.delete(queryDelete).promise()
        successKeys.push(key)
      }

      data.updatedAt = new Date()
      // insert the master record
      const query = {
        ExpressionAttributeValues: {},
        Key: {id: params.id},
        TableName: 'users',
        UpdateExpression: ``,
      }
      const updateActions: string[] = []
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          updateActions.push(`${key} = :${key}`)
          query.ExpressionAttributeValues[`:${key}`] = data[key]
        }
      }
      query.UpdateExpression = `SET ` + updateActions.join(', ')
      await db.update(query).promise()
    } catch (error) {
      // rollback if fail
      for (const key of successKeys) {
        const queryDelete = {
          Key: {
            [key]: data[key],
          },
          TableName: KEY_TABLE_MAP[key],
        }
        await db.delete(queryDelete).promise()

        const queryInsert = {
          ConditionExpression: `attribute_not_exists(${key})`,
          Item: {
            userId: params.id,
            [key]: user[key],
          },
          TableName: KEY_TABLE_MAP[key],
        }
        await db.put(queryInsert).promise()
      }

      debug(error)
      // throw
      if (successKeys.length !== actualKeyFields.length) {
        // one of key attributes fails
        throw new Exception(1100, `Duplicate user '${data[currentKey]}'`)
      } else {
        // master record failed
        throw new Exception(1101, error.code ? `Error updating user.\n${error.code}` : undefined)
      }
    }

    return { id: params.id }
  }

  public async deleteUser(params, headers) {
    if (_.isNil(params.id)) {
      throw new Exception(4)
    }
    const id = params.id

    // fetch user
    const qryGetUser = {
      AttributesToGet: KEY_FIELDS,
      Key: {id},
      TableName: 'users',
    }
    const userQryResult = await db.get(qryGetUser).promise()
    const user = _.get(userQryResult, 'Item')
    if (!user) {
      throw new Exception(1300)
    }

    // delete master record
    const qryDeleteMaster = {
      Key: {id},
      TableName: 'users',
    }
    await db.delete(qryDeleteMaster).promise()

    for (const field of KEY_FIELDS) {
      if (user[field]) {
        const qryDeleteSlave = {
          Key: {
            [field]: user[field],
          },
          TableName: KEY_TABLE_MAP[field],
        }
        await db.delete(qryDeleteSlave).promise()
      }
    }
  }

  public async signout(params, headers?: any): Promise<void> {
    // TODO: implement this function
  }
}
