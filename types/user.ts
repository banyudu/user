import {UserClient, UserRole} from './'
export interface IUser {
  id: string,
  token: string,
  username?: string,
  email?: string,
  password: string,
  authorization: string,
  client: UserClient
  role: UserRole
}
