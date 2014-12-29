'use strict';

var PromiseA = require('bluebird').Promise
  , request = require('request')
  , requestAsync = PromiseA.promisify(request)
  , testConfig = require('../test-config')
  , testAgent = require('../test-agent')
  ;

requestAsync({
  url: testConfig.proxyUrl + '/api/init'
, method: 'POST'
, json: { secret: testConfig.secret }
, agent: testAgent
}).spread(function (resp, body) {
    console.log(body);
  }).error(function (err) {
    console.error('ERROR');
    console.error(err);
  });
