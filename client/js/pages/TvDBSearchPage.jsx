/** @jsx React.DOM */

(function () {
    'use strict';

    var QueryCache = require('../stores/AppStore').getModel('query-cache')
        , ipc      = window.require('ipc');

    ipc.on('found-series', function (series) {
        _.forEach(series, function (series) {
            QueryCache.insertOrUpdate({id: {'$eq': series.id}}, series);
        });
    });

    var TvDBSearchPage = React.createClass({
        componentWillMount: function () {
            var self = this;
            QueryCache.on('change', function () {
                console.log('query-cache changed');
                self.setState({
                    series: QueryCache.findAllAnd().orderBy('name')
                });
            });
        },
        getInitialState: function () {
            return {
                query: '',
                series: QueryCache.data
            };
        },
        validationState: function () {
            return this.state.query.length === 0 ? 'error' : 'success';
        },
        handleChange: function (ev) {
            this.setState({
                query: ev.target.value
            });
        },
        handleClick: function (ev) {
            ipc.send('search-series', this.state.query);
        },
        render: function () {
            return (
                <div className="container">
                    <div className="row panel panel-info">
                        <div className="panel-heading">
                            Suche nach Serientitel <span className="badge">{this.state.series.length}</span>
                        </div>
                        <div className="panel-body">
                            <div className="input-group">
                                <input type="text" className="form-control" onChange={this.handleChange}
                                    placeholder="Serientitel eingeben..." />
                                <span className="input-group-btn">
                                    <button className="btn btn-primary" type="button" onClick={this.handleClick}>
                                        Suchen!
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });

    module.exports = TvDBSearchPage;
}());
