'use strict';

var db = require('../db')
  , testConfig = { secret: 'some-secret', username: 'user', password: 'pass' }
  , config = { salt: 'anything, really', shadow: require('./gen-shadow')(testConfig.secret) }
  , d
  , opts = { secret: testConfig.secret, salt: config.salt }
  , fs = require('fs')
  ;

d = db.create(opts);

console.log('check', db.test(testConfig.secret, config.shadow));
d.set(testConfig.username, testConfig.password).then(function (token) {
  console.log('token', token);
  d.get(token).then(function (val) {
    console.log('val', val);
  });
  d.save().then(function () {
    var data = JSON.parse(fs.readFileSync(opts.cryptFile, 'utf8'))
      ;

    console.log(opts.cryptFile);
    console.log(data);

  });
});
