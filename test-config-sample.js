'use strict';

var path = require('path')
  ;

module.exports = {
  secret: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
, username: require('./real-secret.js').username
, password: require('./real-secret.js').password
, proxyUrl: 'https://example.com:8043'
, hostname: 'example.com'
, port: '8043'
, ca: path.join(__dirname, 'tests', 'certs', 'client', 'my-root-ca.crt.pem')
, key: path.join(__dirname, 'tests', 'certs', 'client', 'my-app-client.key.pem')
, cert: path.join(__dirname, 'tests', 'certs', 'client', 'my-app-client.crt.pem')
};
