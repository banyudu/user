import {Account as AccountClass} from './account'
import {Authorization as AuthorizationClass} from './authorization'
import {DynamoDBQuery as DynamoDBQueryClass} from './dynamodb_query'
import {Password as PasswordClass} from './password'
import {Token as TokenClass} from './token'

export const Account = new AccountClass()
export const Authorization = new AuthorizationClass()
export {Constants} from './constant'
export {db} from './db'
export const DynamoDBQuery = new DynamoDBQueryClass()
export {Exception} from './exception'
export const Password = new PasswordClass()
export const Token = new TokenClass()
