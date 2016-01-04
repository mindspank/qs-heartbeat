'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _restartService = require('./restart-service');

var _restartService2 = _interopRequireDefault(_restartService);

var hostname = 'wss://branch.qlik.com/anon/app/9573041f-0c45-4cb6-8166-64c2aac3c05d';
var originhost = 'http://branch.qlik.com';
var beatInterval = 60000; // 1 min

function beat() {
    setTimeout(function () {
        var socket = new _ws2['default'](hostname, {
            origin: originhost,
            rejectUnauthorized: false
        });

        // Socket opened, await first notification frame;
        socket.on('open', null);

        socket.on('message', function (ev) {
            var data = JSON.parse(ev);

            // Notification frame - we are connected.
            if (data.method === 'OnAuthenticationInformation') {
                socket.terminate();
                beat();
            };

            if (data.error) {
                socket.terminate();
                beat();
            };
        });

        // Connection Error
        socket.on('error', function (error) {
            (0, _restartService2['default'])('QlikSenseProxyService', function (err, stdout) {
                // Could not restart service, handle this later.
                if (err) {
                    console.log(err);
                };
                // Service restarted, beat again.
                beat();
            });
        });
    }, beatInterval);
};
beat();