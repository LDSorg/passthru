'use strict';

var PromiseA = require('bluebird').Promise
  , fs = PromiseA.promisifyAll(require('fs'))
  , crypto = require('crypto')
  , cipherType = 'aes-256-cbc'
  , ENCODING = 'base64'
  , DECODING = 'utf8'
  ;

function sha256sum(val) {
  return require('crypto').createHash('sha256').update(val).digest('hex');
}

function create(opts) {
  var masterKey = opts.secret
    , salt = opts.salt
    , db = {}
    , cryptFile = '/dev/shm/' + (opts.filename || 'passthru-db.enc.json') + '.' + sha256sum(salt)
    ;

  opts.cryptFile = cryptFile;

  function crypt(key, data) {
    var cipherer = crypto.createCipher(cipherType, key)
      ;

    return cipherer.update(data, DECODING, ENCODING) + cipherer.final(ENCODING);
  }

  function decrypt(key, data) {
    var decipherer = crypto.createDecipher(cipherType, key)
      ;

    return decipherer.update(data, ENCODING, DECODING) + decipherer.final(DECODING);
  }

  return {
    init: function () {
      return fs.readFileAsync('/dev/shm/', 'utf8')
        .then(function (body) {
          db = JSON.parse(body);
        })
        .catch(function (/*err*/) {
          // not a big deal
        })
        ;
    }
  , get: function (token) {
      return new PromiseA(function (resolve, reject) {
        var k = sha256sum(token)
          , h = decrypt(masterKey, token)
          , v = db[k]
          , auth = JSON.parse(decrypt(h, v))
          ;

        if (!v) {
          reject(new Error("entry not found"));
        }

        resolve(auth);
      });
    }
  , set: function (user, pass) {
      var auth = { username: user, password: pass }
        ;

      return new PromiseA(function (resolve) {
        var h = sha256sum(salt + user + pass)
          , v = crypt(h, JSON.stringify(auth))
          , token = crypt(masterKey, h)
          , k = sha256sum(token)
          ;

        db[k] = v;
        resolve(token);
      });
    }
  , expire: function (token) {
      return new PromiseA(function (resolve, reject) {
        var k = crypt(token)
          , v = db[k]
          ;

        if (!v) {
          reject(new Error("entry not found"));
        }

        delete db[k];
        return decrypt(v);
      });
    }
  , save: function () {
      return fs.writeFileAsync(cryptFile, JSON.stringify(db, null, '  '), 'utf8')
        .catch(function (err) {
          console.error(err);
        })
        ;
    }
  };
}

module.exports.create = create;
module.exports.test = function (secret, shadow) {
  try {
    var decipherer = crypto.createDecipher(cipherType, secret)
      ;

    return secret === decipherer.update(shadow, ENCODING, DECODING) + decipherer.final(DECODING);
  } catch(e) {
    console.error(e);
    return false;
  }
};
