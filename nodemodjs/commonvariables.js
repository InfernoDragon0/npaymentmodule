/**
 * Common variables file to reduce copy pasting
 */

var braintree = require('braintree'); //braintree payment gateway

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "hczwym8pfvhkb6gm",
  publicKey: "ymkd4bvhhwrg48fz",
  privateKey: "0c913707bb92caa67f77b31dca2fcf4a"
});

module.exports.gateway = gateway;