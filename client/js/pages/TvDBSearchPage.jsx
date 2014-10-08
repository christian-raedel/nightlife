/** @jsx React.DOM */

(function () {
    'use strict';

    var React         = require('react')
        , ipc         = window.require('ipc')
        , Boxes       = require('../components/Boxes.jsx')
        , SearchField = require('../components/SearchField.jsx');

    ipc.on('found-series', function (series) {
        console.log('found series:', series);
        TvDBSearchPage.setSearchResults(series);
    });

    var TvDBSearchPage = React.createClass({
        statics: {
            setSearchResults: function (results) {
                this.setState({
                    series: results
                });
            }
        },
        render: function () {
            return (
                <Boxes>
                    <h1>TV-Serien Suche:</h1>
                    <SearchField />
                </Boxes>
            );
        }
    });

    module.exports = TvDBSearchPage;
}());
