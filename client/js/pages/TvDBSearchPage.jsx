/** @jsx React.DOM */

(function () {
    'use strict';

    var AppStore       = require('../stores/AppStore')
        , QueryCache   = AppStore.getModel('query-cache')
        , LangModel    = AppStore.getModel('languages')
        , ConfigStore  = require('../stores/ConfigStore')
        , ActionsModal = require('../components/ActionsModal.jsx')
        , ipc          = window.require('ipc');

    ipc.on('found-series', function (series) {
        QueryCache.data = series;
        QueryCache.emit('change', series);
    });

    var TvDBSearchPage = React.createClass({
        getBannerPath: function (series) {
            var api = ConfigStore.getValue('api');
            if (series.banner) {
                var bannerpath = 'http://thetvdb.com/banners/' + series.banner;
                console.log('bannerpath:', bannerpath);
                return bannerpath;
            } else {
                return '';
            }
        },
        getInitialState: function () {
            var self = this;

            QueryCache.on('change', function () {
                console.log('query-cache changed');
                self.setState({
                    series: QueryCache.findAllAnd().orderBy('name'),
                    progress: false
                });
            });

            LangModel.on('change', function () {
                console.log('languages changed');
                self.setState({
                    languages: LangModel.findAllAnd().orderBy('name')
                });
            });

            _.forEach(ipc.sendSync('get-languages'), function (language) {
                console.log('language:', language);
                LangModel.insertOrUpdate({id: {'$eq': language.id}}, language);
            });

            return {
                query: '',
                lang: ConfigStore.getValue('defaultLanguage:abbreviation'),
                languages: LangModel.findAllAnd().orderBy('name'),
                series: QueryCache.findAllAnd().orderBy('name'),
                activeId: null,
                progress: false
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
        handleKeyPress: function (ev) {
            if (ev.which === 13) {
                this.handleSearchClick();
            }
        },
        handleSearchClick: function (ev) {
            ipc.send('search-series', this.state.query, this.state.lang);
            this.setState({
                progress: true
            });
        },
        handleLangSelect: function (lang) {
            this.setState({
                lang: lang
            });
        },
        render: function () {
            return (
                <div className="container" style={{opacity: this.state.progress ? 69 : 100}}>
                    <div className="row">
                        <div className="panel panel-info">
                            <div className="panel-heading">
                                <span>Suche nach Serientitel</span>&nbsp;<span className="badge">{this.state.series.length}</span>
                            </div>
                            <div className="panel-body">
                                <div className="input-group">
                                    <input type="text" className="form-control" onChange={this.handleChange}
                                        onKeyPress={this.handleKeyPress} placeholder="Serientitel eingeben..." />
                                    <span className="input-group-btn">
                                        <button type="button" className="btn btn-primary dropdown-toggle"
                                            data-toggle="dropdown">
                                            {LangModel.findOne({abbreviation: {'$eq': this.state.lang}}).name} <span className="caret"></span>
                                        </button>
                                        <button type="button" className="btn btn-primary" onClick={this.handleSearchClick}>
                                            <span className="glyphicon glyphicon-search"> Suchen</span>
                                        </button>
                                        <ul className="dropdown-menu" role="menu">
                                            {_.map(this.state.languages, function (item) {
                                                return (
                                                    <li key={item.abbreviation}>
                                                        <a onClick={this.handleLangSelect.bind(this, item.abbreviation)}>
                                                            {item.name}
                                                        </a>
                                                    </li>
                                                );
                                            }, this)}
                                        </ul>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row" style={!this.state.progress ? {display: 'none'} : {}}>
                        <div className="progress">
                            <div className="progress-bar progress-bar-striped active" role="progressbar"
                                aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={{width: '100%'}}>
                            </div>
                        </div>
                    </div>
                    <div className="row" style={this.state.progress ? {display: 'none'} : {}}>
                        <div className="panel">
                            <div className="panel-body">
                                <div className="list-group">
                                    {_.map(this.state.series, function (item, idx) {
                                        return (
                                            <a key={idx} className="list-group-item" data-toggle="modal" data-target="#actionModal">
                                                <h4 className="list-group-item-heading row">
                                                    <table className="table">
                                                        <thead>
                                                            <tr>
                                                                <th width="5%">#</th>
                                                                <th width="35%">Titel</th>
                                                                <th width="20%">Sprache</th>
                                                                <th width="25%">Sender</th>
                                                                <th width="15%">Jahr</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{idx + 1}</td>
                                                                <td>{item.name}</td>
                                                                <td><span className={'label label-' + (this.state.lang !== item.language ? 'warning' : 'info')}>{LangModel.findOne({abbreviation: {'$eq': item.language}}).name}</span></td>
                                                                <td>{item.network}</td>
                                                                <td>{item.firstAired}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </h4>
                                                <p className="list-group-item-text">
                                                    <table className="table table-bordered">
                                                        <tbody>
                                                            <tr>
                                                                <td width="20%"><u>Kurzinformationen:</u></td>
                                                                <td width="80%">{item.overview}</td>
                                                            </tr>
                                                            <tr style={!item.alias ? {display: 'none'} : {}}>
                                                                <td width="20%">Alternative Titel</td>
                                                                <td width="80%">
                                                                    <ul>
                                                                        {_.map(item.alias.split('|'), function (alias, idx) {
                                                                            return (
                                                                                <li key={idx}>{alias}</li>
                                                                            );
                                                                        }, this)}
                                                                    </ul>
                                                                </td>
                                                            </tr>
                                                            <tr style={!item.banner ? {display: 'none'} : {}}>
                                                                <td colSpan="2">
                                                                    <div className="thumbnail">
                                                                        <img src={this.getBannerPath(item)} />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </p>
                                                <ActionsModal title={item.name} data-item={item} id="actionModal" />
                                            </a>
                                        );
                                    }, this)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });

    module.exports = TvDBSearchPage;
}());
