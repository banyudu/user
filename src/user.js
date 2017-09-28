/**
 * @file user.js handler functions for user service
 */
'use strict';
const DynamoDB = require('aws-sdk/clients/dynamodb');
const constants = require('./constant');
const uuid = require('uuid/v4');
const Exception = require('./exception');
const _ = require('lodash');
const validator = require('validator');
const Password = require('./password');
const Account = require('./account');
// const DynamoDBQuery = require('./dynamodb_query');

const KEY_FIELDS = ['username', 'email'];
const REQUIRED_FIELDS = ['password'];
const EXTRA_FIELDS = ['firstName', 'lastName', 'sex'];
const KEY_TABLE_MAP = {
  username: 'nameUsers',
  email: 'emailUsers',
};

const dynamodbOption = {region: constants.REGION.US_WEST_2};
if (process.env.IS_OFFLINE) {
  dynamodbOption.region = constants.REGION.LOCAL;
  dynamodbOption.endpoint = constants.DYNAMODB_LOCAL_END_POINT;
}
const docClient = new DynamoDB.DocumentClient(dynamodbOption);
/**
 * @class User handler functions for user service
 */
class User {
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
  *createUser(params, headers) {
    const acceptFields = KEY_FIELDS.concat(EXTRA_FIELDS).concat(REQUIRED_FIELDS);

    // require at least one key in keyFields exists
    const actualKeyFields = KEY_FIELDS.filter(e => !_.isNil(params[e])) || [];
    if (!actualKeyFields.length) {
      throw new Exception(4);
    }

    if (_.some(REQUIRED_FIELDS, e => _.isNil(params[e]))) {
      throw new Exception(4);
    }

    // pick accepted fields
    const data = _.pick(params, acceptFields);

    // validate data
    if (data.username && !constants.REGEX.USER_NAME.test(data.username)) {
      console.log(constants.REGEX.USER_NAME.test(data.username));
      throw new Exception(1000);
    }
    if (data.email && !validator.isEmail(data.email)) {
      throw new Exception(1001);
    }
    if (!constants.REGEX.PASSWORD.test(data.password)) {
      throw new Exception(1005);
    }
    ['firstName', 'lastName'].forEach(e => {
      if (data[e] && !constants.REGEX.FULL_NAME.test(data[e])) {
        throw new Exception(1003);
      }
    });
    if (!_.isNil(data.sex)) {
      data.sex = parseInt(data.sex, 10) || null;
      if (!_.includes([constants.SEX.FEMALE, constants.SEX.MALE], data.sex)) {
        throw new Exception(1004);
      }
    }
    // validate complete

    // encrypt password
    const encrypted = Password.sha256(data.password);
    data.password = encrypted.password;
    data.salt = encrypted.salt;

    let currentKey;
    const successKeys = [];
    data.id = uuid();
    try {
      for (const key of actualKeyFields) {
        currentKey = key;
        const tmpData = {userId: data.id, [key]: data[key]};
        const query = {
          TableName: KEY_TABLE_MAP[key],
          Item: tmpData,
          ConditionExpression: `attribute_not_exists(${key})`,
        };
        yield docClient.put(query).promise();
        successKeys.push(key);
      }

      data.createdAt = data.updatedAt = new Date();
      // insert the master record
      const query = {
        TableName: 'users',
        Item: data,
        ConditionExpression: `attribute_not_exists(id)`,
      };
      yield docClient.put(query).promise();
    } catch (error) {
      // rollback if fail
      for (const key of successKeys) {
        const tmpData = {userId: data.id};
        tmpData[key] = data[key];
        const query = {
          TableName: KEY_TABLE_MAP[key],
          Key: {[key]: data[key]},
        };
        yield docClient.delete(query).promise();
      }

      // throw
      if (successKeys.length !== actualKeyFields.length) {
        // one of key attributes fails
        throw new Exception(1100, `Duplicate user '${data[currentKey]}'`);
      } else {
        // master record failed
        throw new Exception(1101, error.code? `Error creating user.\n${error.code}`: null);
      }
    }

    return { id: data.id };
  }

  *getUser(params, headers) {
    if (_.isNil(params.id)) {
      throw new Exception(4);
    }
    const qryFindUser = {
      TableName: 'users',
      Key: {id: params.id},
      AttributesToGet: ['id', 'username', 'email', 'sex', 'firstName', 'lastName'],
    };
    const result = yield docClient.get(qryFindUser).promise();
    return _.get(result, 'Item');
  }

  *signin(params, headers) {
    if (!params.account) {
      throw new Exception(4);
    }
    if (!params.accountType) {
      params.accountType = Account.getAccountType(params.account);
      if (!params.accountType) {
        throw new Exception(1202);
      }
    }
    let fieldName;
    switch(params.accountType) {
      case constants.ACCOUNT_TYPES.EMAIL: fieldName = 'email'; break;
      case constants.ACCOUNT_TYPES.NAME: fieldName = 'username'; break;
      default: throw new Exception(1201);
    }
    const tableName = KEY_TABLE_MAP[fieldName];
    const qryFindUserId = {
      TableName: tableName,
      Key: { [fieldName]: params.account },
      AttributesToGet: [ 'userId' ],
    };
    const result = yield docClient.get(qryFindUserId).promise();
    const id = _.get(result, ['Item', 'userId']);
    if (_.isNil(id)) {
      throw new Exception(1200);
    }
    const qryGetUser = {
      TableName: 'users',
      Key: {id},
      AttributesToGet: ['password', 'salt'],
    };
    const userQryResult = yield docClient.get(qryGetUser).promise();
    const user = _.get(userQryResult, 'Item');
    if (!user) {
      throw new Exception(1200);
    }
    const {password, salt} = user;
    console.log(password);
    console.log(salt);
    if (Password.sha256(params.password, salt).password !== password) {
      throw new Exception(1203);
    }
    return {id};
  }

  *updateUser(params, headers) {
    if (_.isNil(params.id)) {
      throw new Exception(4);
    }
    const user = yield this.getUser(params, headers);
    const acceptFields = KEY_FIELDS.concat(EXTRA_FIELDS).concat(REQUIRED_FIELDS);

    // pick accepted fields
    const data = _.pick(params, acceptFields);

    // require at least one key in keyFields exists
    let actualKeyFields = KEY_FIELDS.filter(e => !_.isNil(params[e])) || [];
    actualKeyFields = actualKeyFields.filter(e => params[e] !== user[e]) || [];

    // validate data
    if (data.username && !constants.REGEX.USER_NAME.test(data.username)) {
      console.log(constants.REGEX.USER_NAME.test(data.username));
      throw new Exception(1000);
    }
    if (data.email && !validator.isEmail(data.email)) {
      throw new Exception(1001);
    }
    ['firstName', 'lastName'].forEach(e => {
      if (data[e] && !constants.REGEX.FULL_NAME.test(data[e])) {
        throw new Exception(1003);
      }
    });
    if (!_.isNil(data.sex)) {
      data.sex = parseInt(data.sex, 10) || null;
      if (!_.includes([constants.SEX.FEMALE, constants.SEX.MALE], data.sex)) {
        throw new Exception(1004);
      }
    }
    // validate complete

    let currentKey;
    const successKeys = [];
    try {
      for (const key of actualKeyFields) {
        currentKey = key;
        const queryInsert = {
          TableName: KEY_TABLE_MAP[key],
          Item: {
            userId: params.id,
            [key]: data[key],
          },
          ConditionExpression: `attribute_not_exists(${key})`,
        };
        yield docClient.put(queryInsert).promise();

        const queryDelete = {
          TableName: KEY_TABLE_MAP[key],
          Key: {
            [key]: user[key],
          },
        };
        yield docClient.delete(queryDelete).promise();
        successKeys.push(key);
      }

      data.updatedAt = new Date();
      // insert the master record
      const query = {
        TableName: 'users',
        Key: {id: params.id},
        UpdateExpression: ``,
        ExpressionAttributeValues: { // a map of substitutions for all attribute values
        },
      };
      const updateActions = [];
      for (const key in data) {
        updateActions.push(`${key} = :${key}`);
        query.ExpressionAttributeValues[`:${key}`] = data[key];
      }
      query.UpdateExpression = `SET ` + updateActions.join(', ');
      yield docClient.update(query).promise();
    } catch (error) {
      // rollback if fail
      for (const key of successKeys) {
        const queryDelete = {
          TableName: KEY_TABLE_MAP[key],
          Key: {
            [key]: data[key],
          },
        };
        yield docClient.delete(queryDelete).promise();

        const queryInsert = {
          TableName: KEY_TABLE_MAP[key],
          Item: {
            userId: params.id,
            [key]: user[key],
          },
          ConditionExpression: `attribute_not_exists(${key})`,
        };
        yield docClient.put(queryInsert).promise();
      }

      console.error(error);
      // throw
      if (successKeys.length !== actualKeyFields.length) {
        // one of key attributes fails
        throw new Exception(1100, `Duplicate user '${data[currentKey]}'`);
      } else {
        // master record failed
        throw new Exception(1101, error.code? `Error updating user.\n${error.code}`: null);
      }
    }

    return { id: params.id };
  }

  *deleteUser(params, headers) {
    if (_.isNil(params.id)) {
      throw new Exception(4);
    }
    const id = params.id;

    // fetch user
    const qryGetUser = {
      TableName: 'users',
      Key: {id},
      AttributesToGet: KEY_FIELDS,
    };
    const userQryResult = yield docClient.get(qryGetUser).promise();
    const user = _.get(userQryResult, 'Item');
    if (!user) {
      throw new Exception(1300);
    }

    // delete master record
    const qryDeleteMaster = {
      TableName: 'users',
      Key: {id},
    };
    yield docClient.delete(qryDeleteMaster).promise();

    for (const field of KEY_FIELDS) {
      if (user[field]) {
        const qryDeleteSlave = {
          TableName: KEY_TABLE_MAP[field],
          Key: {
            [field]: user[field],
          },
        };
        yield docClient.delete(qryDeleteSlave).promise();
      }
    }
  }
}

module.exports = new User();
