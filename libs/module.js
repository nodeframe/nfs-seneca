'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractListenings = extractListenings;
exports._extractArrayOfPin = _extractArrayOfPin;
exports.registerHealthCheck = registerHealthCheck;
exports.parseOption = parseOption;
exports.healthCheckClientService = healthCheckClientService;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HEALTH_CHECK_CMD = '_healthCheck';

function extractListenings() {
  var transportConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return _extractArrayOfPin(transportConfig.listenings);
}

function _extractArrayOfPin(arr) {
  if (Array.isArray(arr)) {
    var output = arr.map(function (m) {
      return m.pins;
    });
    return _lodash2.default.reject(_lodash2.default.flatten(output), _lodash2.default.isEmpty);
  }
  return [];
}

function registerHealthCheck(seneca) {
  var transportConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  console.log('=====##### Register HealthCheck ####=====');
  if (transportConfig.disableHealthCheck) {
    return;
  }
  var pins = extractListenings(transportConfig);
  pins.forEach(function (p) {
    // this will add healthCheck on only * pins
    if (p.cmd === '*') {
      addHealthCheck(seneca, p.role, transportConfig);
    }
  });
  if (transportConfig.healthCheck) {
    if (Array.isArray(transportConfig.healthCheck)) {
      _lodash2.default.uniq(transportConfig.healthCheck).forEach(function (role) {
        addHealthCheck(seneca, role, transportConfig);
      });
    }
    if (typeof transportConfig.healthCheck === 'string') {
      addHealthCheck(seneca, transportConfig.healthCheck, transportConfig);
    }
  }
  console.log('=====##############################=====');
}

function addHealthCheck(seneca, serviceName) {
  var transportConfig = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var serviceObject = { role: serviceName, cmd: HEALTH_CHECK_CMD };
  console.log('assign health check', serviceObject);
  seneca.si.add(serviceObject, function (args, done) {
    console.log('run healthcheck on role: ' + serviceName + ' with recursive ' + args.recursive);
    if (args.recursive == false) {
      done(null, { ok: true, result: { timestamp: new Date(), service: serviceName } });
    } else {
      healthCheckClientService(seneca, transportConfig).then(function (results) {
        done(null, { ok: true, result: { timestamp: new Date(), service: serviceName, serviceClients: results } });
      }).catch(function (e) {
        done(e);
      });
    }
  });
}

function parseOption() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (options.timeout) {
    options.timeout = parseInt(options.timeout, 10);
  }
  return options;
}

/**
 * This method will gather all the client services that this service will consume
 * The method will log out health check output on each role
 */
function healthCheckClientService(seneca) {
  var transportConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var clients = _extractArrayOfPin(transportConfig.clients);
  console.log('run healthcheck resursively to', clients);
  return _bluebird2.default.map(clients, function (pin) {
    return seneca.act({ role: pin.role, cmd: HEALTH_CHECK_CMD, recursive: false });
  });
}
//# sourceMappingURL=module.js.map