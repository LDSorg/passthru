'use strict';

var secret = process.argv[2] || require('./test-config').secret
  , crypto = require('crypto')
  , cipherer = crypto.createCipher('aes-256-cbc', secret)
  , ENCODING = 'base64'
  ;

console.log(
  cipherer.update(secret, 'utf8', ENCODING)
+ cipherer.final(ENCODING)
);
