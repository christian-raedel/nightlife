(function () {
    'use strict';

    var CLogger = require('node-clogger');

    var logger = new CLogger({
        name: 'app',
        transports: [
            new CLogger.transports.Console({
                'format': '[{{timestamp|datetime:HH:MM:SS|colorize:red}}] [{{id|capitalize|colorize:blue}}] +{{diff|rightalign:5|colorize:magenta|colorize:bold}}ms - {{level|uppercase|colorize}}:\n\t{{message}}'
            })
        ]
    });

    module.exports.logger = logger;
}());
