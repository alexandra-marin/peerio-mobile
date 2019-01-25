/**
 * A substitute module for providing randomBytes functionality
 * Is substituted for require('crypto') within Metro bundler
 * using the rn-cli.config.js
 */
const { randomBytes } = require('react-native-randombytes');
const nacl = require('tweetnacl');

console.log(`randombytes:`);
console.log(randomBytes(10));

nacl.setPRNG((x, n) => {
    const a = randomBytes(n);
    a.copy(x);
});

module.exports = {
    randomBytes
};
