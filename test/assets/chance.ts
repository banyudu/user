/* tslint:disable:interface-name no-shadowed-variable */
import Chance = require('chance')

interface MyChance extends Chance.Chance {
  password(): string
}

export const chance = new Chance() as MyChance

// mixins
chance.mixin({
  password: () => {
    const length = chance.integer({min: 6, max: 30})
    return chance.string({length})
  },
})

