'use strict'

export const REGION = {
  LOCAL: 'localhost',
  US_WEST_2: 'us-west-2',
}
export const DYNAMODB_LOCAL_END_POINT = 'http://localhost:8000'
export const ERROR_CODE_PREFIX = 'USER_'
export const REGEX = {
  FULL_NAME: /^.{1,30}$/,
  PASSWORD: /^.{6,30}$/,
  USER_NAME: /^[a-zA-Z0-9_]{3,30}$/,
}
export const SEX = {
  FEMALE: 2,
  MALE: 1,
}
export const ACCOUNT_TYPES = {
  EMAIL: 'email',
  NAME: 'name',
}
