'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (seneca_options, config) {
  var si = (0, _seneca2.default)(seneca_options);

  var act = function act(args) {
    return new _bluebird2.default(function (resolve, reject) {
      si.act(args, function (err, resp) {
        if (err) {
          reject(err);return;
        } else if (!resp.ok) reject(deserializeError(resp.error));else resolve(resp.result);
      });
    });
  };

  var add = function add(options, callback) {
    si.add(options, function (args, done) {
      try {
        if (callback.length >= 2) {
          callback.bind(si)(args, done);
        } else {
          var resultWithArgs = callback.bind(si)(args);
          var isThenable = 'function' === typeof resultWithArgs.then;
          if (isThenable) {
            resultWithArgs.then(function (response) {
              done(null, { ok: true, result: response });
            }).catch(function (e) {
              done(null, { ok: false, error: serializeError(e) });
            });
          } else {
            done(null, { ok: true, result: resultWithArgs });
          }
        }
      } catch (e) {
        done(null, { ok: false, error: serializeError(e) });
        return;
      }
    });
  };

  if (config && config.uses) {
    config.uses.reduce(function (prev, curr) {
      return prev.use(curr);
    }, si);
  }

  if (config && config.listenings) {
    config.listenings.reduce(function (prev, curr) {
      return prev.listen(curr);
    }, si);
  }

  if (config && config.clients) {
    config.clients.reduce(function (prev, curr) {
      return prev.client(curr);
    }, si);
  }

  return { act: act, add: add, si: si };
};

var _seneca = require('seneca');

var _seneca2 = _interopRequireDefault(_seneca);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var serializeError = function serializeError(e) {
  return { name: e.name, stack: e.stack, message: e.message, errors: e.errors };
};

var deserializeError = function deserializeError(oe) {
  var e = new Error(oe.message);
  e.name = oe.name;
  e.errors = oe.errors;
  e.stack = oe.stack;
  return e;
};

;
//# sourceMappingURL=index.js.map