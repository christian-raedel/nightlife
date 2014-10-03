(function () {
    'use strict';

    var ipc = require('ipc');

    angular.module('NightlifeApp.TvDBScreen', [])
    .controller('TvDBController', ['$rootScope', '$scope', function ($rootScope, $scope) {
        console.log('initialize TvDBController...');

        $scope.chooseFolders = function () {
            console.log('emitted choose-folders event...');
            ipc.send('choose-folders');
        };
    }]);
}());
