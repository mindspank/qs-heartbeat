'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = foo;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _child_process = require('child_process');

var child = _interopRequireWildcard(_child_process);

function foo(service, callback) {
    child.exec('net stop ' + service + ' && net start ' + service, function (error, stdout, stderr) {
        if (error !== null) {
            callback(error);
        }
        callback(null, stdout);
    });
}

;
module.exports = exports['default'];