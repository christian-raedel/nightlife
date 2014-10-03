(function () {
    'use strict';

    angular.module('NightlifeApp', [
        'templates',
        'ui.router',
        'NightlifeApp.TvDBScreen'
    ])
    .config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
        $urlRouterProvider.otherwise('/tvdb');

        $stateProvider
        .state('tvdb', {
            url: '/tvdb',
            templateUrl: 'partials/tvdb-screen.tpl.html',
            controller: 'TvDBController'
        });
    }])
    .run(['$rootScope', function ($rootScope) {
        console.log('initialize $rootScope...');
    }]);
}());
