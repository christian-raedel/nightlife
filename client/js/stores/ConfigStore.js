(function () {
    'use strict';

    var CConf = require('node-cconf');

    var ConfigStore = new CConf('config-store', ['defaultLanguage'], {
        'defaultLanguage': {
            'id': 14,
            'name': 'Deutsch',
            'abbreviation': 'de'
        }
    })
    .load(process.cwd() + '/config.yml');

    module.exports = ConfigStore;
}());
