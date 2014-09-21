'use strict';

var config = require('./config')
  , testConfig = require('./test-config')
  , crypto = require('crypto')
  , cipherer = crypto.createCipher('aes-256-cbc', testConfig.secret)
  , ENCODING = 'base64'
  ;

console.log(
  cipherer.update(testConfig.secret, 'utf8', ENCODING)
+ cipherer.final(ENCODING)
);
