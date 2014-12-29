'use strict';

var connect = require('connect')
  , urlrouter = require('urlrouter')
  , app = connect()
  , signin = require('./signin').signin
  , DB = require('./db')
  , config = require('./config')
  , db
  , PromiseA = require('bluebird').Promise
  ;

function saveAndQuit() {
  db.save().then(function () {
    process.exit();
  }).catch(function (e) {
    console.error(e);
    process.exit();
  });
}

function login(auth, preset) {
  return new PromiseA(function (resolve, reject) {
    var errmsg
      ;

    // username must be at least 4, password at least 8
    ['username', 'password'].every(function (k) {
      if ('string' !== typeof auth[k]) {
        errmsg = { message: k + " must be specified" };

        return false;
      }

      if (auth[k].length < 4) {
        errmsg = { message: k + " is too short" };

        return false;
      }

      return true;
    });

    if (errmsg) {
      reject(errmsg);
      return;
    }

    resolve();
  }).then(function () {
    return signin(auth.username, auth.password).then(function (jar) {
      if (preset) {
        return { jar: jar };
      }

      return db.set(auth.username, auth.password).then(function (token) {
        return { token: token, jar: jar };
      });
    });
  });
}

function route(rest) {
  function requireInit(req, res, next) {
    if (!db) {
      res.error({ message: "init not complete" });
      return;
    }
    
    next();
  }

  rest.post('/api/init', function (req, res) {
    var body = req.body
      ;

    if (db) {
      res.error({ message: "init already complete" });
      return;
    }

    if (!DB.test(body.secret, config.shadow)) {
      res.error({ message: "bad secret" });
      return;
    }

    db = DB.create({ secret: body.secret, salt: config.salt });
    res.send({ success: true });
  });

  rest.post('/api/login', requireInit, function (req, res) {
    var body = req.body
      ;

    login(body).then(function (data) {
      res.send({ token: data.token, jar: data.jar });
    }, function (errmsg) {
      res.error({ message: errmsg && errmsg.message || errmsg });
    });
  });

  rest.post('/api/passthru', requireInit, function (req, res) {
    var body = req.body
      ;

    if ('string' !== typeof body.token) {
      res.error({ message: "no token supplied" });
    }

    db.get(body.token).then(function (data) {
      return login(data, true);
    }).then(function (data) {
      res.send({ jar: data.jar });
    }).catch(function (errmsg) {
      res.error({ message: errmsg });
    });
  });

  rest.post('/api/restart', requireInit, function (req, res) {
    res.send({ success: true });
    saveAndQuit();
  });
}

app.use(require('body-parser').json({
  strict: true
, inflate: true
, limit: 100 * 1024
, reviver: undefined
, type: 'json'
, verify: undefined
}));
app.use(require('connect-send-json').json());
app.use(require('connect-send-error').error());
app.use(urlrouter(route));

//process.on('uncaughtException', saveAndQuit);
module.exports.create = function (/*server*/) {
  return PromiseA.resolve(app);
};
