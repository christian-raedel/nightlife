(function () {
    'use strict';

    //var ipc = require('ipc');
    var ipc = {};

    angular.module('NightlifeApp.TvDBScreen', [
        'ui.grid'
    ])
    .controller('TvDBController', ['$rootScope', '$scope', function ($rootScope, $scope) {
        console.log('initialize TvDBController...');

        $scope.chooseFolders = function () {
            console.log('emitted choose-folders event...');
            ipc.send('choose-folders');
        };

        //ipc.on('choosen-files', function (files) {
            //console.log('received list of choosen files:', files);
            //$scope.gridOptions.data = _.map(files, function (file) {
                //return {file: file};
            //});
            //console.log($scope.gridOptions);
        //});

        $scope.gridOptions = {
            enableSorting: true,
            columnDefs: [
                {name: 'Episode', field: 'file'}
            ],
            data: [
                {file: '...hier sollten alle gefundenen Dateien aufgelistet werden...'}
            ]
        };
    }]);
}());
