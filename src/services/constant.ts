'use strict'

export namespace Constants {
  export enum sex {
    female = 2,
    male = 1,
  }
  export const region = {
    local: 'localhost',
    usWest2: 'us-west-2',
  }
  export const dynamodbLocalEndPoint = 'http://localhost:8000'
  export const errorCodePrefix = 'USER_'
  export const regex = {
    fullname: /^.{1,30}$/,
    password: /^.{6,30}$/,
    username: /^[a-zA-Z0-9_]{3,30}$/,
  }

  export const tables = {
    emailUsers: 'emailUsers',
    nameUsers: 'nameUsers',
    tokens: 'tokens',
    users: 'users',
  }
}
