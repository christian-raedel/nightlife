(function () {
    'use strict';

    angular.module('app.intro', [
        'app.components'
    ])
    .controller('introController', AppIntroController);

    function AppIntroController($rootScope, $scope) {
        $scope.chooseFolder = function () {
            ipc.send('choose-folder');
        };
    }
}());
