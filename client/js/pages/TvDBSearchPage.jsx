/** @jsx React.DOM */

(function () {
    'use strict';

    var PageComponents = require('../components/PageComponents')
        , Container    = PageComponents.Container
        , Row          = PageComponents.Row
        , Panel        = PageComponents.Panel
        , ipc          = require('ipc')
        , shell        = require('shell')
        , remote       = require('remote')
        , dialog       = remote.require('dialog')
        , ConfigStore  = remote.require('./client/js/stores/ConfigStore')
        , engine       = require('dna').createDNA()
        , logger       = require('../util').logger
        , fs           = require('fs.extra')
        , path         = require('path')
        , q            = require('q');

    var TvDBSearchPage = React.createClass({
        getBannerPath: function (series) {
            var api = ConfigStore.getValue('api');
            if (series.banner) {
                var bannerpath = 'http://thetvdb.com/banners/' + series.banner;
                logger.info('resolve bannerpath:', bannerpath);
                return bannerpath;
            } else {
                return '';
            }
        },
        getInitialState: function () {
            var self = this;

            return {
                query: '',
                selectedLanguage: ConfigStore.getValue('defaultLanguage:abbreviation'),
                supportedLanguages: ipc.sendSync('get-languages'),
                series: [],
                links: [{
                    key: '001',
                    caption: 'TheTVDB.com',
                    url: function (series) {
                        return engine.render('http://thetvdb.com/index.php?tab=series&id={{seriesId}}&lid={{languageId}}', {
                            seriesId: series.id,
                            languageId: _.find(self.state.supportedLanguages, {abbreviation: series.language}).id
                        });
                    }
                }, {
                    key: '002',
                    caption: 'IMDB.com',
                    url: function (series) {
                        if (series.imdbId) {
                            return engine.render('http://www.imdb.com/title/{{imdbId}}/', {
                                imdbId: series.imdbId
                            });
                        } else {
                            return false;
                        }
                    }
                }],
                finished: true
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
                series: _.map(ipc.sendSync('search-series', this.state.query, this.state.selectedLanguage), function (series) {
                    return _.merge(series, {files: []});
                })
            });
        },
        handleLangSelect: function (selectedLanguage) {
            this.setState({
                selectedLanguage: selectedLanguage
            });
        },
        handleOpenFolder: function (series) {
            var updated = ipc.sendSync('choose-folders', series);
            this.setState({
                series: _.map(this.state.series, function (series) {
                    if (series.id === updated.id && series.language === updated.language) {
                        return updated;
                    } else {
                        return series;
                    }
                })
            });
        },
        handleOpenUrl: function (url) {
            shell.openExternal(url);
        },
        handleFileOperation: function (op, series) {
            if (series.files.length) {
                var self = this;
                self.setState({
                    finished: false
                });

                var elem = document.getElementById('series-' + series.id + '-' + series.language);
                elem.scrollIntoView();

                var queue = _.map(series.files, function (file) {
                    if (file[0] !== file[1]) {
                        logger.info('%s file from [%s] to [%s]', op, file[0], file[1]);
                        return q.nfcall(fs.mkdirRecursive, path.dirname(file[1]))
                        .then(function () {
                            return q.nfcall(fs[op], file[0], file[1]);
                        });
                    } else {
                        logger.warn('skipping file [%s]', file[0]);
                        return false;
                    }
                });

                q.all(_.filter(queue, function (promise) {
                    return promise;
                }))
                .delay(5000)
                .then(function () {
                    self.setState({
                        finished: true
                    });
                    self.handleReset(series.id);
                })
                .catch(function (err) {
                    logger.error('error on %s:', op, err, err.stack);
                    dialog.showMessageBox({
                        type: 'warning',
                        buttons: ['Ok'],
                        title: 'Fehler bei Dateioperation!',
                        message: err.message,
                        detail: err.stack
                    });
                })
                .done();
            }
        },
        handleReset: function (id) {
            var series = _.map(this.state.series, function (series) {
                if (series.id === id) {
                    series.files = [];
                }
                return series;
            });

            this.setState({
                series: series
            });
        },
        render: function () {
            return (
                <Container>
                    <Row>
                        <Panel title="Suche nach Serientitel" badge={this.state.series.length}>
                            <div className="input-group">
                                <input ref="queryInput" type="text" className="form-control" onChange={this.handleChange}
                                    onKeyPress={this.handleKeyPress} placeholder="Serientitel eingeben..." />
                                <span className="input-group-btn">
                                    <button type="button" className="btn btn-primary dropdown-toggle"
                                        data-toggle="dropdown">
                                        {_.find(this.state.supportedLanguages, function (language) {
                                            return language.abbreviation === this.state.selectedLanguage;
                                        }, this).name}
                                        <span className="caret"></span>
                                    </button>
                                    <button type="button" className="btn btn-primary" onClick={this.handleSearch}>
                                        <span className="glyphicon glyphicon-search"> Suchen</span>
                                    </button>
                                    <ul className="dropdown-menu" role="menu">
                                        {_.map(this.state.supportedLanguages, function (language, idx) {
                                            return (
                                                <li key={idx}>
                                                    <a onClick={this.handleLangSelect.bind(this, language.abbreviation)}>
                                                        {language.name}
                                                    </a>
                                                </li>
                                            );
                                        }, this)}
                                    </ul>
                                </span>
                            </div>
                        </Panel>
                    </Row>
                    <Row>
                        <Panel style={this.state.series.length ? {} : {display: 'none'}}>
                            <div className="list-group">
                                {_.map(this.state.series, function (series, idx) {
                                    return (
                                        <div key={idx} className="list-group-item"
                                            id={'series-' + series.id + '-' + series.language}>
                                            <h4 className="list-group-item-heading row">
                                                <HeadingTable index={idx} series={series}
                                                    selectedLanguage={this.state.selectedLanguage}
                                                    supportedLanguages={this.state.supportedLanguages} />
                                            </h4>
                                            <p className="list-group-item-text">
                                                <GroupItemTable series={series} banner={this.getBannerPath(series)}/>
                                                <Container>
                                                    <Row>
                                                        <div className={'btn-group ' + (this.state.finished ? 'show' : 'hidden')}>
                                                            <button type="button" className="btn btn-info"
                                                                onClick={this.handleOpenFolder.bind(this, series)}>
                                                                <span className="glyphicon glyphicon-shopping-cart"></span>
                                                                Import
                                                            </button>
                                                            <button type="button" className="btn btn-info dropdown-toggle"
                                                                data-toggle="dropdown">
                                                                <span className="caret"></span>
                                                            </button>
                                                            <ul className="dropdown-menu dropdown-menu-right" role="menu">
                                                                <li role="presentation" className="dropdown-header">
                                                                    Öffne im Browser
                                                                </li>
                                                                {_.map(this.state.links, function (link) {
                                                                    var url = link.url(series);

                                                                    if (url) {
                                                                        return (
                                                                            <li key={link.key}>
                                                                                <a onClick={this.handleOpenUrl.bind(this, url)}>
                                                                                    {link.caption}
                                                                                </a>
                                                                            </li>
                                                                        );
                                                                    }
                                                                }, this)}
                                                            </ul>
                                                        </div>
                                                    </Row>
                                                </Container>
                                                <Panel title="Dateien werden wie folgend umbenannt:"
                                                    badge={series.files.length}
                                                    style={series.files.length && this.state.finished ? {} : {display: 'none'}}>
                                                    <table className="table table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>Alter Dateiname</th>
                                                                <th>Neuer Dateiname</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {_.map(series.files, function (file, idx) {
                                                                return (
                                                                    <tr key={idx}>
                                                                        <td>{file[0]}</td>
                                                                        <td>{file[1]}</td>
                                                                    </tr>
                                                                );
                                                            }, this)}
                                                        </tbody>
                                                    </table>
                                                </Panel>
                                                <Container>
                                                    <Row style={series.files.length ? {} : {display: 'none'}}>
                                                        <div className={'btn-group ' + (this.state.finished ? 'show' : 'hidden')}>
                                                            <button type="button" className="btn btn-info"
                                                                onClick={this.handleFileOperation.bind(this, 'copy', series)}>
                                                                <span className="glyphicon glyphicon-resize-full"></span>
                                                                Kopieren
                                                            </button>
                                                            <button type="button" className="btn btn-info"
                                                                onClick={this.handleFileOperation.bind(this, 'move', series)}>
                                                                <span className="glyphicon glyphicon-resize-small"></span>
                                                                Verschieben
                                                            </button>
                                                            <button type="button" className="btn btn-info"
                                                                onClick={this.handleReset.bind(this, series.id)}>
                                                                <span className="glyphicon glyphicon-retweet"></span>
                                                                Verwerfen
                                                            </button>
                                                        </div>
                                                        <div className="progress" style={this.state.finished ? {display: 'none'} : {}}>
                                                            <div className="progress-bar progress-bar-striped active" role="progressbar"
                                                                aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"
                                                                style={{width: '100%'}}>
                                                                <span className="sr-only">In Arbeit...</span>
                                                            </div>
                                                        </div>
                                                    </Row>
                                                </Container>
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

    var HeadingTable = React.createClass({
        render: function () {
            return this.transferPropsTo(
                <table className="table table-striped">
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
                            <td>{this.props.index + 1}</td>
                            <td>{this.props.series.name}</td>
                            <td>
                                <span className={'label label-' +
                                    (this.props.selectedLanguage !== this.props.series.language ? 'warning' : 'success')}>
                                    {_.find(this.props.supportedLanguages, {abbreviation: this.props.series.language}).name}
                                </span>
                            </td>
                            <td>{this.props.series.network}</td>
                            <td>{this.props.series.firstAired}</td>
                        </tr>
                    </tbody>
                </table>
            );
        }
    });

    var GroupItemTable = React.createClass({
        render: function () {
            return this.transferPropsTo(
                <table className="table table-bordered">
                    <tbody>
                        <tr>
                            <td width="20%"><u>Kurzinformationen:</u></td>
                            <td width="80%">{this.props.series.overview}</td>
                        </tr>
                        <tr style={!this.props.series.alias ? {display: 'none'} : {}}>
                            <td width="20%">Alternative Titel</td>
                            <td width="80%">
                                <ul>
                                    {_.map(this.props.series.alias.split('|'), function (alias, idx) {
                                        return (
                                            <li key={idx}>{alias}</li>
                                        );
                                    }, this)}
                                </ul>
                            </td>
                        </tr>
                        <tr style={!this.props.series.banner ? {display: 'none'} : {}}>
                            <td colSpan="2">
                                <div className="thumbnail">
                                    <img src={this.props.banner} />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        }
    });

    module.exports = TvDBSearchPage;
}());
