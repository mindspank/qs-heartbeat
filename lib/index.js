'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _productversion = require('./productversion');

var _productversion2 = _interopRequireDefault(_productversion);

var _restartService = require('./restart-service');

var _restartService2 = _interopRequireDefault(_restartService);

var hostname = 'ws://localhost:4848/app/';
var originhost = 'http://branch.qlik.com';
var beatInterval = 30000;

function beat() {
    setTimeout(function () {
        var socket = new _ws2['default'](hostname, {
            origin: originhost,
            rejectUnauthorized: false
        });

        socket.on('open', function () {
            // Socket open, send single frame and await response.
            socket.send(JSON.stringify(_productversion2['default']));
        });

        socket.on('message', function (ev) {
            var data = JSON.parse(ev);

            // First frame will be a notification, ignore it.
            if (!data.result) {
                return;
            };

            // QIX responded on ping
            if (data.id === 1) {
                socket.terminate();

                // Continue beating           
                setTimeout(beat, beatInterval);
            };
        });

        // Connection Error
        socket.on('error', function (error) {
            (0, _restartService2['default'])('Spooler', function (err, stdout) {
                if (err) {}
                // Could not restart service, handle this later.

                // Service restarted, beat again.
                beat();
            });
        });
    }, beatInterval);
};