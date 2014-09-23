'use strict';

var PromiseA = require('bluebird').Promise
  , request = require('request')
  , requestAsync = PromiseA.promisify(request)
  , testConfig = require('../test-config')
  ;

requestAsync({
    url: testConfig.proxyUrl + '/api/login'
  , method: 'POST'
  , json: { username: testConfig.username, password: testConfig.password }
  }).spread(function (/*resp, body*/) {
    throw new Error("Expected to fail without SSL cert");
  }).catch(function (err) {
    if (!/socket hang up/.test(err.message)) {
      console.error(err);
    }
    console.log("SUCCESS: Could not connect without valid certificate");
  });
