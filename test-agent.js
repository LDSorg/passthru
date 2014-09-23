var https = require('https')
  , fs = require('fs')
  , testConfig = require('./test-config')
  , options
  ;

options = {
  host: testConfig.hostname
, port: testConfig.port
, path: '/'
, ca: [ fs.readFileSync(testConfig.ca) ]
, key: fs.readFileSync(testConfig.key)
, cert: fs.readFileSync(testConfig.cert)
};

module.exports = new https.Agent(options);
