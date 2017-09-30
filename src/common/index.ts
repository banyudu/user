import {Account as AccountClass} from './account'
import {Authorization as AuthorizationClass} from './authorization'
import * as ConstantsObj from './constant'
import {DynamoDBQuery as DynamoDBQueryClass} from './dynamodb_query'
import {Password as PasswordClass} from './password'
import {Token as TokenClass} from './token'

export const Account = new AccountClass()
export const Authorization = new AuthorizationClass()
export const Constants = ConstantsObj
export const DynamoDBQuery = new DynamoDBQueryClass()
export {Exception} from './exception'
export const Password = new PasswordClass()
export const Token = new TokenClass()
