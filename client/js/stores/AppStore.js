(function () {
    'use strict';

    var CStore    = require('node-cstore')
        , CSModel = CStore.CSModel
        , logger  = require('../util').logger
        , fs      = require('fs.extra')
        , path    = require('path')
        , ipc     = require('ipc');

    var AppStore = new CStore({
        name: 'app-store',
        filename: path.resolve(process.cwd(), 'data', 'app-data.json')
    });

    if (fs.existsSync(AppStore.config.getValue('filename'))) {
        AppStore.load();
    }

    var SeriesModel = AppStore.getModel('series');
    if (!SeriesModel) {
        AppStore.addModel(new CSModel({name: 'series'}));
        SeriesModel = AppStore.getModel('series');
    }

    SeriesModel.on('change', function (data) {
        logger.info('count series stored in database:', data.length);
        AppStore.save();
    });

    SeriesModel.update({state: {'$eq': 'new'}}, {state: null});

    var LangModel = AppStore.getModel('lang');
    if (!LangModel) {
        AppStore.addModel(new CSModel({name: 'lang'}));
        LangModel = AppStore.getModel('lang');
    }

    LangModel.on('change', function (data) {
        logger.info('updated languages');
        AppStore.save();
    });

    _.forEach(ipc.sendSync('get-languages'), function (language) {
        LangModel.insertOrUpdate({id: {'$eq': language.id}}, language);
    });

    module.exports = AppStore;
}());
