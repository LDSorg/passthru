'use strict';

var crypto = require('crypto')
  , ENCODING = 'base64'
  , secret = process.argv[2]
  ;

module.exports = function (secret) {
  var cipherer = crypto.createCipher('aes-256-cbc', secret)
    ;

  return cipherer.update(secret, 'utf8', ENCODING)
    + cipherer.final(ENCODING)
    ;
};

if (module === require.main) {
  console.log(module.exports(secret));
}
