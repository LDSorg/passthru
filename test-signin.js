var PromiseA = require('bluebird').Promise
  , request = require('request')
  , requestAsync = PromiseA.promisify(request)
  , signin = require('./signin').signin
  , testConfig = require('./test-config')
  ;

signin(testConfig.username, testConfig.password).then(function (jar) {
  requestAsync({
    url: 'https://www.lds.org/directory/services/ludrs/mem/current-user-info/'
  , method: 'GET'
  , jar: jar
  }).spread(function (res, body) {
    console.log(body);
  });
//132   LdsOrg._urls.currentStake = '/unit/current-user-units/';
//136   LdsOrg._urls.currentMeta = '/unit/current-user-ward-stake/';
});
