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
        , shell           = require('shell')
        , remote          = require('remote')
        , dialog          = remote.require('dialog')
        , ConfigStore     = require('../stores/ConfigStore')
        , AppStore        = require('../stores/AppStore')
        , SeriesModel     = AppStore.getModel('series')
        , LangModel       = AppStore.getModel('lang')
        , filemanager     = remote.require('./lib/filemanager')
        , TvDB            = remote.require('./lib/tvdb')
        , engine          = require('dna').createDNA()
        , logger          = require('../util').logger
        , fs              = require('fs.extra')
        , path            = require('path')
        , q               = require('q');

    var tvdb = new TvDB(ConfigStore.config);

    var TvDBSearchPage = React.createClass({
        getBannerPath: function (series) {
            var api = ConfigStore.getValue('api');
            if (series.banner) {
                var bannerpath = 'http://thetvdb.com/banners/' + series.banner;
                logger.info('resolved bannerpath:', bannerpath);
                return bannerpath;
            } else {
                return '';
            }
        },
        chooseFolders: function (series) {
            return q.nfcall(dialog.showOpenDialog, {properties: ['openDirectory', 'multiSelections']})
            .then(function (folders) {
                return q.all(_.map(folders, function (folder) {
                    return filemanager.find(folder, ConfigStore.getValue('mediaFiles'));
                }))
                .then(function (files) {
                    return tvdb.getFilenames(_.flatten(files), series, ConfigStore.getValue('basedir'))
                    .catch(function (err) {
                        logger.error('cannot get filenames for series:', series.name);
                        dialog.showMessageBox({
                            type: 'warning',
                            buttons: ['Ok'],
                            title: 'Fehler beim Ermitteln der neuen Dateinamen!',
                            message: err.message,
                            detail: err.stack
                        });
                    })
                    .done();
                });
            });
        },
        getInitialState: function () {
            var self = this;

            return {
                query: '',
                selectedLanguage: ConfigStore.getValue('defaultLanguage:abbreviation'),
                supportedLanguages: LangModel.findAllAnd().orderBy('name'),
                serieslist: [],
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
            var self = this;

            tvdb.getSeries(this.state.query, this.state.selectedLanguage)
            .then(function (serieslist) {
                logger.debug('step 1: found series', serieslist);
                serieslist = _.map(serieslist, function (series) {
                    series.banner = self.getBannerPath(series);
                    series.files = [];
                    return series;
                });

                logger.debug('step 2: set state', serieslist);
                self.setState({
                    serieslist: serieslist
                });
            })
            .catch(function (err) {
                dialog.showMessageBox({
                    type: 'warning',
                    buttons: ['Ok'],
                    title: 'Fehler beim Suchen nach einer Serie!',
                    message: err.message,
                    detail: err.stack
                });
            })
            .done()
        },
        handleLangSelect: function (selectedLanguage) {
            this.setState({
                selectedLanguage: selectedLanguage
            });
        },
        handleOpenFolder: function (series) {
            var self = this;

            self.chooseFolders(series)
            .then(function (files) {
                var updated = _.merge(series, {files: files});
                self.setState({
                    serieslist: _.map(self.state.serieslist, function (series) {
                        return (_.isEqual(series.id, updated.id) && _.isEqual(series.language, updated.language)) ?
                            updated : series;
                    })
                });
            })
            .catch(function (err) {
                dialog.showMessageBox({
                    type: 'warning',
                    buttons: ['Ok'],
                    title: 'Fehler beim Wählen eines Ordners!',
                    message: err.message,
                    detail: err.stack
                });
            })
            .done()
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
                    if (file[0] !== file[1] && !fs.existsSync(file[1])) {
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
                    self.handleImport(series);
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
            var serieslist = _.map(this.state.serieslist, function (series) {
                if (series.id === id) {
                    series.files = [];
                }
                return series;
            });

            this.setState({
                serieslist: serieslist
            });
        },
        handleImport: function (series) {
            var doc = SeriesModel.findOne({id: {'$eq': series.id}, language: {'$eq': series.language}});
            var episodes = _.map(series.files, function (file) {
                return _.merge(file[2], {filename: file[1]});
            });

            if (doc) {
                doc.episodes = doc.episodes.concat(episodes);
                //SeriesModel.update({id: {'$eq': series.id}, language: {'$eq': series.language}});
            } else {
                doc = _.merge({}, series);
                delete doc.files;
                doc.episodes = episodes;
                //SeriesModel.insert(doc);
            }

            doc.state = 'new';
            SeriesModel.insertOrUpdate({id: {'$eq': series.id}, language: {'$eq': series.language}}, doc);
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
                                                <GroupItemTable series={series} banner={series.banner}/>
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
                                                                <th>&nbsp;</th>
                                                                <th>Neuer Dateiname</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {_.map(series.files, function (file, idx) {
                                                                return (
                                                                    <tr key={idx}>
                                                                        <td>{file[0]}</td>
                                                                        <td>
                                                                            <span className={'glyphicon ' + (file[0] === file[1] ?
                                                                                'glyphicon-resize-horizontal' :
                                                                                'glyphicon-arrow-right')}></span>
                                                                        </td>
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

    module.exports = TvDBSearchPage;
}());
