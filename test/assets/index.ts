import * as ChanceClass from 'chance'
import * as Debug from 'debug'
import {Support as SupportClass} from './support'

export const Chance = new ChanceClass()
export const debug = Debug('user')
export {Run} from './run'
export const Support = new SupportClass()
