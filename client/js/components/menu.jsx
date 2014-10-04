/** @jsx React.DOM */

(function () {
    'use strict';

    var React       = require('react')
        , Link      = require('react-router-component').Link
        , MenuModel = require('../stores/app-store').getModel('menu')
        , logger    = require('../util').logger
        , _         = require('lodash');

    var MenuItem = React.createClass({
        componentDidMount: function () {
            logger.debug('menuItem.props:', this.props);
        },
        render: function () {
            return (
                <li className="menuItem">
                    <Link href={this.props.href}>
                        {this.props.caption}
                    </Link>
                </li>
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
                <ul className="menu">
                    {_.map(this.state.items, function (item) {
                        logger.debug('menu.state.item:', item);
                        return <MenuItem key={item._id} caption={item.caption} href={item.href} />;
                    })}
                </ul>
            );
        }
    });

    module.exports = Menu;
}());
