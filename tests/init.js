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
    if (body.error) {
      console.error('Error with init');
      console.error(body.error);
      return;
    }

    console.log(body);
  });
