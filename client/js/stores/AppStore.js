(function () {
    'use strict';

    var CStore = require('node-cstore');

    var AppStore = new CStore({
        name: 'app-store'
    })
    .addModel(new CStore.CSModel({name: 'menu'}))
    .addModel(new CStore.CSModel({name: 'query-cache'}))
    .addModel(new CStore.CSModel({name: 'series'}));

    module.exports = AppStore;

    var MenuModel = AppStore.getModel('menu');
    MenuModel.insert({key: '010', caption: 'Start', page: 'HomePage.jsx'});
    MenuModel.insert({key: '020', caption: 'TV-Serien Datenbank', page: 'TvDBPage.jsx'});
    MenuModel.insert({key: '027', caption: 'TV-Serien Suche', page: 'TvDBSearchPage.jsx'});
}());
