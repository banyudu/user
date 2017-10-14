import Chance = require('chance')

interface IChance extends Chance.Chance {
  password(): string
}

export const chance = new Chance() as IChance

// mixins
chance.mixin({
  password: () => {
    const length = chance.integer({min: 6, max: 30})
    return chance.string({length})
  },
})

