import {Constants} from '../src/services'
import {UserClient, UserRole} from './'
export interface IUser {
  id: string,
  token: string,
  username?: string,
  email?: string,
  authorization: string,
  client: UserClient,
  role: UserRole,
  firstName?: string,
  lastName?: string,
  sex?: Constants.sex,
}
