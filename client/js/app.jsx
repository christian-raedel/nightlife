/** @jsx React.DOM */

(function () {
    'use strict';

    var React       = require('react')
        , Router    = require('react-router')
        , Menu      = require('./components/menu.jsx')
        , MenuModel = require('./stores/app-store').getModel('menu')
        , _         = require('lodash');

    var App = React.createClass({
        getInitialState: function () {
            return {
                locations: MenuModel.data
            };
        },
        render: function () {
            return (
                <div>
                    <Menu />
                    <Locations>
                        {_.map(this.state.locations, function (location) {
                            return <Location key={location._id} path={location.href} handler={require('./pages/' + location.handler)} />;
                        })}
                    </Locations>
                </div>
            );
        }
    });

    React.renderComponent(<App />, document.body);
}());
