/** @jsx React.DOM */

(function () {
    'use strict';

    var React         = require('react')
        , ipc         = window.require('ipc')
        , _           = require('lodash');

    var Boxes         = require('./Boxes.jsx')
        , ButtonStyle = require('../../style/Button.less');

    var SearchField = React.createClass({
        getInitialState: function () {
            return {
                value: ''
            };
        },
        handleChange: function (ev) {
            this.setState({
                value: ev.target.value
            });
        },
        handleClick: function (ev) {
            ipc.send('search-series', this.state.value);
        },
        render: function () {
            return (
                <div>
                    <input name="search" placeholder="Suchbegriff" value={this.state.value} onChange={this.handleChange} />
                    <button style={ButtonStyle} onClick={this.handleClick}>Suchen</button>
                </div>
            );
        }
    });

    module.exports = SearchField;
}());
