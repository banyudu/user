'use strict'

import {Constants} from './constant'

import * as DynamoDB from 'aws-sdk/clients/dynamodb'
// create dynamodb client
const dynamodbOption: {region: string, endpoint?: string} = {region: Constants.region.usWest2}
if (process.env.IS_OFFLINE) {
  dynamodbOption.region = Constants.region.local
  dynamodbOption.endpoint = Constants.dynamodbLocalEndPoint
}
const docClient = new DynamoDB.DocumentClient(dynamodbOption)

export class DynamoDBQuery {
  private docClient: any
  constructor() {
    this.docClient = docClient
  }
  // TODO: implement get/update/delete methods
}
