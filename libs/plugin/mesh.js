'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _module = require('../module');

var Module = _interopRequireWildcard(_module);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function init(seneca) {
  var transportConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var pins = Module.extractListenings(transportConfig);

  if (!_lodash2.default.isEmpty(transportConfig.consul)) {
    seneca.use('consul-registry', {
      host: transportConfig.consul.host
    });
    console.log("Register consul host at", transportConfig.consul.host);
  }
  console.log("Register mesh with config", transportConfig.mesh);
  if (_lodash2.default.isEmpty(transportConfig.mesh)) {
    throw new Error("transportConfig.mesh should not be empty");
  }
  console.log("on pin ==>", pins);
  var meshOption = {
    host: transportConfig.mesh.host,
    port: transportConfig.mesh.port || 39999,
    listen: [].concat(_toConsumableArray(pins)),
    bases: transportConfig.mesh.bases,
    discover: {
      registry: {
        active: true
      },
      multicast: {
        active: false
      }
    }
  };
  meshOption = _lodash2.default.merge(transportConfig.mesh.option, meshOption);
  console.log("initilize mesh with", meshOption);
  seneca.use('mesh', meshOption).ready(function () {
    console.log("starting mesh with base", this.id);
  });
  return seneca;
}
//# sourceMappingURL=mesh.js.map