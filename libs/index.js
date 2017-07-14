'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (senecaOptions) {
  var transportConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var si = (0, _seneca2.default)(senecaOptions);

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

  switch (transportConfig.type) {
    case 'mesh':
      console.log("nfs-seneca mesh mode!");
      Mesh.init(si, transportConfig);
      break;
    default:
      console.log("nfs-seneca normal mode");
      (0, _register2.default)(si);
      break;
  }

  return { act: act, add: add, si: si };
};

var _seneca = require('seneca');

var _seneca2 = _interopRequireDefault(_seneca);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _register = require('./register');

var _register2 = _interopRequireDefault(_register);

var _mesh = require('./plugin/mesh');

var Mesh = _interopRequireWildcard(_mesh);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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