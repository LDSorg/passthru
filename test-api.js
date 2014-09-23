'use strict';

var PromiseA = require('bluebird').Promise
  , request = require('request')
  , requestAsync = PromiseA.promisify(request)
  , testConfig = require('./test-config')
  , JarSON = require('./jarson')
  ;

requestAsync({
  url: testConfig.proxyUrl + '/api/init'
, method: 'POST'
, json: { secret: testConfig.secret }
}).spread(function (resp, body) {
  console.log(body);

  requestAsync({
    url: testConfig.proxyUrl + '/api/login'
  , method: 'POST'
  , json: { username: testConfig.username, password: testConfig.password }
  }).spread(function (resp, body) {
    console.log(body);

    requestAsync({
      url: testConfig.proxyUrl + '/api/passthru'
    , method: 'POST'
    , json: { token: body.token }
    }).spread(function (resp, body) {
      var jar = JarSON.fromJSON(body.jar)
        ;

      requestAsync({
        url: 'https://www.lds.org/directory/services/ludrs/mem/current-user-info/'
      , jar: jar
      }).spread(function (resp, body) {
        console.log(body);
      });
    });
  });
});
