/** @jsx React.DOM */

(function () {
    'use strict';

    var React       = require('react')
        , MenuModel = require('../stores/AppStore').getModel('menu')
        , logger    = require('../util').logger
        , _         = require('lodash');

    var MenuItem = React.createClass({
        render: function () {
            return (
            );
        }
    });

    var Menu = React.createClass({
        getInitialState: function () {
            return {
                items: MenuModel.data
            };
        },
        render: function () {
            return (
            );
        }
    });

    module.exports = Menu;
}());
