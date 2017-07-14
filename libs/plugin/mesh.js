'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _seneca = require('seneca');

var _seneca2 = _interopRequireDefault(_seneca);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(seneca) {
  var transportConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var pins = void 0;
  if (Array.isArray(transportConfig.listenings)) {
    var pinSet = transportConfig.listenings.map(function (m) {
      return m.pins;
    });
    pins = _lodash2.default.flatten(pinSet);
  }
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
    pins: pins,
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