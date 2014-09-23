#!/usr/bin/env node
'use strict';

var https = require('https')
  , port = process.argv[2] || 8043
  , fs = require('fs')
  , path = require('path')
  , App = require('../server')
  , server
  , options
  ;

options = {
  key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'server', 'my-server.key.pem'))
, ca: [ fs.readFileSync(path.join(__dirname, '..', 'certs', 'ca', 'my-root-ca.crt.pem'))]
, cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'server', 'my-server.crt.pem'))
, requestCert: true
, rejectUnauthorized: true
};


server = https.createServer(options);

App.create(server).then(function (app) {
  server.on('request', app);
  server.listen(port, function () {
    port = server.address().port;
    console.log('Listening on https://127.0.0.1:' + port);
    console.log('Listening on https://' + server.address().address + ':' + port);
    console.log('Listening on https://local.foobar3000.com:' + port);
  });
});
