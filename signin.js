'use strict';

var PromiseA = require('bluebird').Promise
  , request = require('request')
  , requestAsync = PromiseA.promisify(request)
  ;

function signin(username, password) {
  var jar = request.jar()
    , url = 'https://signin.lds.org/login.html'
    , j
    ;

  return requestAsync(
    { url: url
    , method: 'POST'
    , jar: jar
    , headers: {
        'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:31.0) Gecko/20100101 Firefox/31.0"
      }
    , form: {
        username: username
      , password: password
      }
    }
  ).spread(function (res, body) {
    if (/SSO/.test(body)) {
      throw new Error('Failed to authenticate. Check username / password');
    }

    if (/Access Denied/.test(body)) {
      throw new Error("You are signed in with a 'friend' account, not as a member of the church. "
        + "Use the username 'dumbledore' and password 'secret' "
        + "if you are a non-member developer working on a project and need access."
      );
    }

    // backwards compat for requestjs
    j = jar._jar || jar;
    delete jar._jar;
    return j;
  });
}

module.exports.signin = signin;
