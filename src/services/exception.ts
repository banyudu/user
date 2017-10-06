'use strict'
import {Errors} from './errors'

export class Exception {
  public code: number
  public msg: string

  constructor(code: number, msg?: string) {
    this.code = code
    this.msg = msg || Errors[code]
  }
}
