import DynamoDB = require('aws-sdk/clients/dynamodb')
import {Constants} from './constant'

const dynamodbOption: {region: string, endpoint?: string} = {region: Constants.region.usWest2}
if (process.env.IS_OFFLINE) {
  dynamodbOption.region = Constants.region.local
  dynamodbOption.endpoint = Constants.dynamodbLocalEndPoint
}
export const db = new DynamoDB.DocumentClient(dynamodbOption)
