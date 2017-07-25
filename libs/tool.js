'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPing = getPing;

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPing(senecaConfig) {
  var transportConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _seneca = (0, _index2.default)(senecaConfig, transportConfig),
      act = _seneca.act;

  return function (role) {
    return act({ role: role, cmd: '_healthCheck' });
  };
}
//# sourceMappingURL=tool.js.map