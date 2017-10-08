'use strict'

import * as _ from 'lodash'
import * as uuid from 'uuid/v4'
import {Constants} from './constant'
import {db} from './db'

export class Token {
  /**
   * Get token for given user
   * @param {String} userId
   * @param {Object} client
   * @param {String} client.product
   * @param {String} client.version
   * @param {String} client.userAgent
   * @return {String} Token
   */
  public async get(userId: string, client: Constants.client): Promise<string> {
    const result = await db.get({
      Key: {userId},
      TableName: Constants.tables.tokens,
    }).promise()
    const data = _.get(result, 'Item')
    return _.get(data, ['tokens', client])
  }

  /**
   * Refresh token for given user
   * @param {String} userId
   * @param {Object} client
   * @param {String} client.product
   * @param {String} client.version
   * @param {String} client.userAgent
   * @return {String} Token
   */
  public async refresh(userId: string, client: string): Promise<string> {
    const qryInsert = {
      Key: {userId},
      TableName: Constants.tables.tokens,
    }

    const newToken = uuid()
    try {
      await db.put({
        ConditionExpression: `attribute_not_exists(userId)`,
        Item: {userId, tokens: {}},
        TableName: Constants.tables.tokens,
      }).promise()
    } catch (error) {
      //
    }
    await db.update({
      ExpressionAttributeNames: {
        '#K': client,
      },
      ExpressionAttributeValues: {
        ':value': newToken,
      },
      Key: { userId },
      TableName: Constants.tables.tokens,
      UpdateExpression: `SET tokens.#K = :value`,
    }).promise()
    return newToken
  }
}
