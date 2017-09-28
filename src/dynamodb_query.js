'use strict';

const constants = require('./constant');

const DynamoDB = require('aws-sdk/clients/dynamodb');
// create dynamodb client
const dynamodbOption = {region: constants.REGION.US_WEST_2};
if (process.env.IS_OFFLINE) {
  dynamodbOption.region = constants.REGION.LOCAL;
  dynamodbOption.endpoint = constants.DYNAMODB_LOCAL_END_POINT;
}
const docClient = new DynamoDB.DocumentClient(dynamodbOption);

class DynamoDBQuery {
  constructor() {
    this.docClient = docClient;
  }
  // TODO: implement get/update/delete methods
}

module.exports = new DynamoDBQuery();
