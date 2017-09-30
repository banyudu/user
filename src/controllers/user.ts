/**
 * @file user.js handler functions for user service
 */
'use strict'
import DynamoDB = require('aws-sdk/clients/dynamodb')
import * as _ from 'lodash'
import * as uuid from 'uuid/v4'
import * as validator from 'validator'
import {Account, Constants, Exception, Password} from '../common'

const KEY_FIELDS = ['username', 'email']
const REQUIRED_FIELDS = ['password']
const EXTRA_FIELDS = ['firstName', 'lastName', 'sex']
const KEY_TABLE_MAP = {
  email: 'emailUsers',
  username: 'nameUsers',
}

const dynamodbOption: {region: string, endpoint?: string} = {region: Constants.REGION.US_WEST_2}
if (process.env.IS_OFFLINE) {
  dynamodbOption.region = Constants.REGION.LOCAL
  dynamodbOption.endpoint = Constants.DYNAMODB_LOCAL_END_POINT
}
const docClient = new DynamoDB.DocumentClient(dynamodbOption)

interface ISigninResult {
  id: string
  token: string
}

interface IUser {
  createUser(params: any, headers?: any): Promise<{id: string, token: string}>
  getUser(params: any, headers?: any): Promise<{id: string, token: string}>
  signin(params: any, headers?: any): Promise<{id: string, token: string}>
  updateUser(params: any, headers?: any): Promise<{id: string}>
  deleteUser(params: any, headers?: any): Promise<void>
}

/**
 * @class User handler functions for user service
 */
export class User implements IUser {
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
  public async createUser(params: any, headers?: any): Promise<{id: string, token: string}> {
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
    if (data.username && !Constants.REGEX.USER_NAME.test(data.username)) {
      throw new Exception(1000)
    }
    if (data.email && !validator.isEmail(data.email)) {
      throw new Exception(1001)
    }
    if (!Constants.REGEX.PASSWORD.test(data.password)) {
      throw new Exception(1005)
    }
    ['firstName', 'lastName'].forEach((e) => {
      if (data[e] && !Constants.REGEX.FULL_NAME.test(data[e])) {
        throw new Exception(1003)
      }
    })
    if (!_.isNil(data.sex)) {
      data.sex = parseInt(data.sex, 10) || null
      if (!_.includes([Constants.SEX.FEMALE, Constants.SEX.MALE], data.sex)) {
        throw new Exception(1004)
      }
    }
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
        await docClient.put(qryCreate).promise()
        successKeys.push(key)
      }

      data.createdAt = data.updatedAt = new Date()
      // insert the master record
      const query = {
        ConditionExpression: `attribute_not_exists(id)`,
        Item: data,
        TableName: 'users',
      }
      await docClient.put(query).promise()
    } catch (error) {
      // rollback if fail
      for (const key of successKeys) {
        const tmpData = {userId: data.id}
        tmpData[key] = data[key]
        const query = {
          Key: {[key]: data[key]},
          TableName: KEY_TABLE_MAP[key],
        }
        await docClient.delete(query).promise()
      }
      throw error
    }

    // TODO: return token in createUser
    return { id: data.id, token: ''}
  }

  public async getUser(params, headers): Promise<{id: string, token: string}> {
    if (_.isNil(params.id)) {
      throw new Exception(4)
    }
    const qryFindUser = {
      AttributesToGet: ['id', 'username', 'email', 'sex', 'firstName', 'lastName'],
      Key: {id: params.id},
      TableName: 'users',
    }
    const result = await docClient.get(qryFindUser).promise()
    return _.get(result, 'Item')
  }

  public async signin(params, headers?: any): Promise<ISigninResult> {
    if (!params.account) {
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
      case Constants.ACCOUNT_TYPES.EMAIL: fieldName = 'email'; break
      case Constants.ACCOUNT_TYPES.NAME: fieldName = 'username'; break
      default: throw new Exception(1201)
    }
    const tableName = KEY_TABLE_MAP[fieldName]
    const qryFindUserId = {
      AttributesToGet: [ 'userId' ],
      Key: { [fieldName]: params.account },
      TableName: tableName,
    }
    const result = await docClient.get(qryFindUserId).promise()
    const id = _.get(result, ['Item', 'userId'])
    if (_.isNil(id)) {
      throw new Exception(1200)
    }
    const qryGetUser = {
      AttributesToGet: ['password', 'salt'],
      Key: {id},
      TableName: 'users',
    }
    const userQryResult = await docClient.get(qryGetUser).promise()
    const user: any = _.get(userQryResult, 'Item')
    if (!user) {
      throw new Exception(1200)
    }
    const {password, salt} = user
    if (Password.sha256(params.password, salt).password !== password) {
      throw new Exception(1203)
    }
    return {id: '', token: ''}
  }

  public async updateUser(params, headers): Promise<{id: string}> {
    if (_.isNil(params.id)) {
      throw new Exception(4)
    }
    const user = await this.getUser(params, headers)
    const acceptFields = KEY_FIELDS.concat(EXTRA_FIELDS).concat(REQUIRED_FIELDS)

    // pick accepted fields
    const data: any = _.pick(params, acceptFields)

    // require at least one key in keyFields exists
    let actualKeyFields = KEY_FIELDS.filter((e) => !_.isNil(params[e])) || []
    actualKeyFields = actualKeyFields.filter((e) => params[e] !== user[e]) || []

    // validate data
    if (data.username && !Constants.REGEX.USER_NAME.test(data.username)) {
      throw new Exception(1000)
    }
    if (data.email && !validator.isEmail(data.email)) {
      throw new Exception(1001)
    }
    ['firstName', 'lastName'].forEach((e) => {
      if (data[e] && !Constants.REGEX.FULL_NAME.test(data[e])) {
        throw new Exception(1003)
      }
    })
    if (!_.isNil(data.sex)) {
      data.sex = parseInt(data.sex, 10) || null
      if (!_.includes([Constants.SEX.FEMALE, Constants.SEX.MALE], data.sex)) {
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
        await docClient.put(queryInsert).promise()

        const queryDelete = {
          Key: {
            [key]: user[key],
          },
          TableName: KEY_TABLE_MAP[key],
        }
        await docClient.delete(queryDelete).promise()
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
      await docClient.update(query).promise()
    } catch (error) {
      // rollback if fail
      for (const key of successKeys) {
        const queryDelete = {
          Key: {
            [key]: data[key],
          },
          TableName: KEY_TABLE_MAP[key],
        }
        await docClient.delete(queryDelete).promise()

        const queryInsert = {
          ConditionExpression: `attribute_not_exists(${key})`,
          Item: {
            userId: params.id,
            [key]: user[key],
          },
          TableName: KEY_TABLE_MAP[key],
        }
        await docClient.put(queryInsert).promise()
      }

      console.error(error)
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
    const userQryResult = await docClient.get(qryGetUser).promise()
    const user = _.get(userQryResult, 'Item')
    if (!user) {
      throw new Exception(1300)
    }

    // delete master record
    const qryDeleteMaster = {
      Key: {id},
      TableName: 'users',
    }
    await docClient.delete(qryDeleteMaster).promise()

    for (const field of KEY_FIELDS) {
      if (user[field]) {
        const qryDeleteSlave = {
          Key: {
            [field]: user[field],
          },
          TableName: KEY_TABLE_MAP[field],
        }
        await docClient.delete(qryDeleteSlave).promise()
      }
    }
  }
}
