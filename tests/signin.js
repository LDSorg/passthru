var PromiseA = require('bluebird').Promise
  , request = require('request')
  , requestAsync = PromiseA.promisify(request)
  , signin = require('../signin').signin
  , testConfig = require('../test-config')
  , JarSON = require('../jarson')
  ;

signin(testConfig.username, testConfig.password).then(function (jar) {
  var newJar = JarSON.fromJSON(JSON.parse(JSON.stringify(JarSON.toJSON(jar))))
    ;

  requestAsync({
    url: 'https://www.lds.org/directory/services/ludrs/mem/current-user-info/'
  , method: 'GET'
  , jar: newJar
  }).spread(function (res, body) {
    console.log(body);
  });
});
