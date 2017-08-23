'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (senecaOptions) {
  var transportConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var si = (0, _seneca2.default)(Module.parseOption(senecaOptions));

  var act = Wrapper.actGenerator(si);

  var add = Wrapper.addGenerator(si);

  switch (transportConfig.type) {
    case 'mesh':
      console.log("nfs-seneca mesh mode!");
      Mesh.init(si, transportConfig);
      break;
    default:
      console.log("nfs-seneca normal mode");
      (0, _register.register)(si, transportConfig);
      break;
  }

  Module.registerHealthCheck({ si: si, act: act, add: add }, transportConfig);

  return { act: act, add: add, si: si };
};

var _seneca = require('seneca');

var _seneca2 = _interopRequireDefault(_seneca);

var _register = require('./register');

var _mesh = require('./plugin/mesh');

var Mesh = _interopRequireWildcard(_mesh);

var _module = require('./module');

var Module = _interopRequireWildcard(_module);

var _senecaWrapper = require('./seneca-wrapper');

var Wrapper = _interopRequireWildcard(_senecaWrapper);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
//# sourceMappingURL=index.js.map