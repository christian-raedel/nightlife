(function () {
    'use strict';

    angular.module('app', [
        'templates',
        'ui.router',
        'app.intro'
    ])
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/app/intro');

        $stateProvider
        .state('app', {
            abstract: true,
            url: '/app',
            template: '<ui-view></ui-view>'
        })
        .state('app.intro', {
            url: '/intro',
            templateUrl: 'partials/intro.tpl.html',
            controller: 'introController'
        });
    })
    .run(function ($rootScope) {
        console.log('inside run...');
    });
}());
