'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addGenerator = exports.actGenerator = undefined;

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

var actGenerator = exports.actGenerator = function actGenerator(si) {
  return function (args) {
    return new _bluebird2.default(function (resolve, reject) {
      si.act(args, function (err, resp) {
        if (err) {
          reject(err);
          return;
        } else if (!resp.ok) reject(deserializeError(resp.error));else resolve(resp.result);
      });
    });
  };
};

var addGenerator = exports.addGenerator = function addGenerator(si) {
  return function (options, callback) {
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
};
//# sourceMappingURL=seneca-wrapper.js.map