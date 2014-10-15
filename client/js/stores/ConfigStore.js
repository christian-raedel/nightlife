(function () {
    'use strict';

    var CConf     = require('node-cconf')
        , path    = require('path')
        , webview = require('web-view');

    var argv = require('yargs')
    .default('config', path.resolve(process.cwd(), 'config.yml'))
    .argv;

    console.log(process.cwd());

    var ConfigStore = new CConf('config-store', [
        'defaultLanguage',
        'basedir',
        'zoomLevel',
    ], {
        'defaultLanguage': {
            'id': 14,
            'name': 'Deutsch',
            'abbreviation': 'de'
        },
        'zoomLevel': 0
    })
    .load(argv.config);

    webview.setZoomLevel(ConfigStore.getValue('zoomLevel'));

    module.exports = ConfigStore;
}());
