(function () {
    'use strict';

    var CConf  = require('node-cconf')
        , path = require('path');

    var ConfigStore = new CConf('config-store', [
        'defaultLanguage',
        'basedir'
    ], {
        'defaultLanguage': {
            'id': 14,
            'name': 'Deutsch',
            'abbreviation': 'de'
        }
    });

    module.exports = ConfigStore;
}());
