'use strict';

var PromiseA = require('bluebird').Promise
  , request = require('request')
  , requestAsync = PromiseA.promisify(request)
  , testConfig = require('../test-config')
  , JarSON = require('../jarson')
  , testAgent = require('../test-agent')
  ;

requestAsync({
    url: testConfig.proxyUrl + '/api/restart'
  , method: 'POST'
  , agent: testAgent
  }).spread(function (resp, body) {
    console.log(body);
  });
