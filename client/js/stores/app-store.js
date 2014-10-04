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
    MenuModel.insert({caption: 'Start', href: '/', handler: 'start-page.jsx'})
    MenuModel.insert({caption: 'TV-Serien Datenbank', href: '/tvdb', handler: 'tvdb-page.jsx'})
    MenuModel.insert({caption: 'TV-Serien Suche', href: '/tvdb/search', handler: 'tvdb-search-page.jsx'});
}());
