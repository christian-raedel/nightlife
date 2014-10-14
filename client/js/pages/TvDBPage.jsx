/** @jsx React.DOM */

(function () {
    'use strict';

    var PageComponents    = require('../components/PageComponents')
        , Container       = PageComponents.Container
        , Row             = PageComponents.Row
        , Panel           = PageComponents.Panel
        , TableComponents = require('../components/TableComponents')
        , HeadingTable    = TableComponents.HeadingTable
        , GroupItemTable  = TableComponents.GroupItemTable
        , SeasonTable     = TableComponents.SeasonTable
        , ipc             = require('ipc')
        , shell           = require('shell')
        , remote          = require('remote')
        , dialog          = remote.require('dialog')
        , ConfigStore     = remote.require('./client/js/stores/ConfigStore')
        , AppStore        = require('../stores/AppStore')
        , SeriesModel     = AppStore.getModel('series')
        , LangModel       = AppStore.getModel('lang')
        , engine          = require('dna').createDNA()
        , logger          = require('../util').logger
        , fs              = require('fs.extra')
        , path            = require('path')
        , q               = require('q');

    var TvDBSearchPage = React.createClass({
        getInitialState: function () {
            var self = this;

            return {
                query: '',
                supportedLanguages: LangModel.findAllAnd().orderBy('name'),
                serieslist: SeriesModel.findAllAnd().orderBy('name')
            };
        },
        componentDidMount: function () {
            this.refs.queryInput.getDOMNode().focus();
        },
        handleChange: function (ev) {
            this.setState({
                query: ev.target.value
            });
        },
        handleKeyPress: function (ev) {
            if (ev.which === 13) {
                this.handleSearch();
            }
        },
        handleSearch: function (ev) {
            this.setState({
                serieslist: SeriesModel.find({name: {'$regex': new RegExp(this.state.query, 'gi')}})
            });
        },
        render: function () {
            return (
                <Container>
                    <Row>
                        <Panel title="Suche nach Serientitel" badge={this.state.serieslist.length}>
                            <div className="input-group">
                                <input ref="queryInput" type="text" className="form-control" onChange={this.handleChange}
                                    onKeyPress={this.handleKeyPress} placeholder="Serientitel eingeben..." />
                                <span className="input-group-btn">
                                    <button type="button" className="btn btn-primary" onClick={this.handleSearch}>
                                        <span className="glyphicon glyphicon-search"> Suchen</span>
                                    </button>
                                </span>
                            </div>
                        </Panel>
                    </Row>
                    <Row>
                        <Panel style={this.state.serieslist.length ? {} : {display: 'none'}}>
                            <div className="list-group">
                                {_.map(this.state.serieslist, function (series, idx) {
                                    return (
                                        <div key={idx} className="list-group-item"
                                            id={'series-' + series.id + '-' + series.language}>
                                            <h4 className="list-group-item-heading row">
                                                <HeadingTable index={idx} series={series}
                                                    selectedLanguage={this.state.selectedLanguage}
                                                    supportedLanguages={this.state.supportedLanguages} />
                                            </h4>
                                            <p className="list-group-item-text">
                                                <GroupItemTable series={series} banner={series.banner}>
                                                    <SeasonTable seasons={_.groupBy(series.episodes, 'season')} />
                                                </GroupItemTable>
                                            </p>
                                        </div>
                                    );
                                }, this)}
                            </div>
                        </Panel>
                    </Row>
                </Container>
            );
        }
    });

    module.exports = TvDBSearchPage;
}());
