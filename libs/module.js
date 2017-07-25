'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractListenings = extractListenings;
exports.registerHealthCheck = registerHealthCheck;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function extractListenings() {
  var transportConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (Array.isArray(transportConfig.listenings)) {
    var pinSet = transportConfig.listenings.map(function (m) {
      return m.pins;
    });
    return _lodash2.default.reject(_lodash2.default.flatten(pinSet), _lodash2.default.isEmpty);
  }
  return [];
}

function registerHealthCheck(seneca) {
  var transportConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (transportConfig.disableHealthCheck) {
    return;
  }
  var pins = extractListenings(transportConfig);
  pins.forEach(function (p) {
    // this will add healthCheck on only * pins
    if (p.cmd === '*') {
      addHealthCheck(seneca, p.role);
    }
  });
  if (transportConfig.healthCheck) {
    if (Array.isArray(transportConfig.healthCheck)) {
      _lodash2.default.uniq(transportConfig.healthCheck).forEach(function (role) {
        addHealthCheck(seneca, role);
      });
    }
    if (typeof transportConfig.healthCheck === 'string') {
      addHealthCheck(seneca, transportConfig.healthCheck);
    }
  }
}

function addHealthCheck(seneca, serviceName) {
  var serviceObject = { role: serviceName, cmd: '_healthCheck' };
  console.log('assign health check', serviceObject);
  seneca.add(serviceObject, function (args, done) {
    done(null, { ok: true, result: { timestamp: new Date(), service: serviceName } });
  });
}
//# sourceMappingURL=module.js.map