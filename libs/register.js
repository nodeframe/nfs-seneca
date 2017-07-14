"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;
function register(seneca) {
  var transportConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (transportConfig.uses) {
    transportConfig.uses.reduce(function (prev, curr) {
      return prev.use(curr);
    }, seneca);
  }

  if (transportConfig.listenings) {
    transportConfig.listenings.reduce(function (prev, curr) {
      return prev.listen(curr);
    }, seneca);
  }

  if (transportConfig.clients) {
    transportConfig.clients.reduce(function (prev, curr) {
      return prev.client(curr);
    }, seneca);
  }
}
//# sourceMappingURL=register.js.map