(function () {
    'use strict';

    angular.module('app.components', [
        'templates'
    ])
    .directive('PanelGroup', PanelGroup)
    .directive('Panel', Panel);

    function PanelGroup() {
        return {
            restrict: 'E',
            templateUrl: 'partials/panel-group.tpl.html',
            transclude: true,
            replace: true,
            scope: {
                header: '@',
                footer: '@'
            }
        };
    }

    function Panel() {
        return {
            restrict: 'E',
            templateUrl: 'partials/panel.tpl.html',
            scope: {
                header: '@',
                description: '@',
                caption: '@',
                call: '&onClick'
            },
            link: function (scope) {
            }
        };
    }
}());
