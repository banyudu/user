'use strict';

module.exports = {
  REGION: {
    US_WEST_2: 'us-west-2',
    LOCAL: 'localhost',
  },
  DYNAMODB_LOCAL_END_POINT: 'http://localhost:8000',
  ERROR_CODE_PREFIX: 'USER_',
  REGEX: {
    USER_NAME: /^[a-zA-Z0-9_]{3,30}$/,
    FULL_NAME: /^.{1,30}$/,
    PASSWORD: /^.{6,30}$/,
  },
  SEX: {
    MALE: 1,
    FEMALE: 2,
  },
  ACCOUNT_TYPES: {
    NAME: 'name',
    EMAIL: 'email',
  },
};
