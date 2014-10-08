(function () {
    'use strict';

    var CStore = require('node-cstore')
        , path = require('path')
        , _    = require('lodash');

    var AppStore = new CStore({
        name: 'app-store'
    })
    .addModel(new CStore.CSModel({name: 'menu'}))
    .addModel(new CStore.CSModel({name: 'series'}));

    module.exports = AppStore;

    var MenuModel = AppStore.getModel('menu');
    MenuModel.insert({id: '010', caption: 'Start', page: 'HomePage.jsx'});
    MenuModel.insert({id: '020', caption: 'TV-Serien Datenbank', page: 'TvDBPage.jsx'});
    MenuModel.insert({id: '027', caption: 'TV-Serien Suche', page: 'TvDBSearchPage.jsx'});
}());
