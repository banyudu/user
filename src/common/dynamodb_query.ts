'use strict'

import * as constants from './constant'

import * as DynamoDB from 'aws-sdk/clients/dynamodb'
// create dynamodb client
const dynamodbOption: {region: string, endpoint?: string} = {region: constants.REGION.US_WEST_2}
if (process.env.IS_OFFLINE) {
  dynamodbOption.region = constants.REGION.LOCAL
  dynamodbOption.endpoint = constants.DYNAMODB_LOCAL_END_POINT
}
const docClient = new DynamoDB.DocumentClient(dynamodbOption)

export class DynamoDBQuery {
  private docClient: any
  constructor() {
    this.docClient = docClient
  }
  // TODO: implement get/update/delete methods
}
