(function () {
    'use strict';

    var CConf  = require('node-cconf')
        , path = require('path');

    function createConfigStore () {
        return new CConf('config-store', [
            'defaultLanguage',
            'basedir'
        ], {
            'defaultLanguage': {
                'id': 14,
                'name': 'Deutsch',
                'abbreviation': 'de'
            }
        });
    }

    var ConfigStore;
    if (!ConfigStore) {
        ConfigStore = createConfigStore();
    }

    module.exports = ConfigStore;
}());
