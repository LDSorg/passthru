'use strict';

var PromiseA = require('bluebird').Promise
  , request = require('request')
  , requestAsync = PromiseA.promisify(request)
  , testConfig = require('../test-config')
  , JarSON = require('../jarson')
  , testAgent = require('../test-agent')
  ;

requestAsync({
  url: testConfig.proxyUrl + '/api/init'
, method: 'POST'
, json: { secret: testConfig.secret }
, agent: testAgent
}).spread(function (resp, body) {
  console.log(body);

  return requestAsync({
    url: testConfig.proxyUrl + '/api/login'
  , method: 'POST'
  , json: { username: testConfig.username, password: testConfig.password }
  , agent: testAgent
  }).spread(function (resp, body) {
    console.log('sign-in result');
    console.log(body);

    if (!body.token) {
      throw new Error('Invalid Credentials');
    }

    return requestAsync({
      url: testConfig.proxyUrl + '/api/passthru'
    , method: 'POST'
    , json: { token: body.token }
    , agent: testAgent
    }).spread(function (resp, body) {
      if (!body.jar) {
        throw new Error('Token Credentials');
      }

      console.log('token exchange result');
      var jar = JarSON.fromJSON(body.jar)
        ;

      return requestAsync({
        url: 'https://www.lds.org/directory/services/ludrs/mem/current-user-info/'
      , jar: jar
      }).spread(function (resp, body) {
        console.log('access result');
        console.log(body);
      });
    });
  });
});
