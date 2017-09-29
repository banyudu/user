const Chance = require('chance');
const co = require('co');

module.exports.chance = new Chance();

module.exports.run = (generator, callback) => {
  co(generator).then(() => {callback()}).catch(err => {callback(err)});
}
