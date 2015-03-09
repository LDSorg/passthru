'use strict';

var PromiseA = require('bluebird').Promise;
var request = require('request');
var requestAsync = PromiseA.promisify(request);

function signin(username, password) {
  var jar = request.jar();
  // as per https://tech.lds.org/wiki/LDS_Tools_Web_Services
  // updated: https://tech.lds.org/mobile/ldstools/config.json
  var url = 'https://signin.lds.org/login.html'
  var useragent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:38.0) Gecko/20100101 Firefox/38.0";
  var tmpJar;

  return requestAsync(
    { url: url
    , method: 'POST'
    , jar: jar
    , followAllRedirects: true
    , headers: {
        'User-Agent': useragent
      }
    , form: {
        username: username
      , password: password
      }
    }
  ).spread(function (res, body) {
    var warning;

    if (/SINGLE SIGN ON/i.test(body)) {
      throw new Error('Failed to authenticate. Check username / password');
    }

    if (/Access Denied/i.test(body)) {
      throw new Error("You are signed in with a 'friend' account, not as a member of the church. "
        + "Use the username 'dumbledore' and password 'secret' "
        + "if you are a non-member developer working on a project and need access."
      );
    }

    console.log(body.length);
    if (body.length > 500) {
      warning = "Unexpected login result. LDS.org has updated and this session may not be valid.";
    }

    // backwards compat for requestjs
    tmpJar = jar._jar || jar;
    delete jar._jar;
    return { jar: tmpJar, warning: warning, useragent: useragent };
  }).then(function (stuff) {
    return stuff;
  });
}

module.exports.signin = signin;
