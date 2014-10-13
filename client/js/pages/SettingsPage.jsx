/** @jsx React.DOM */

(function () {
    'use strict';

    var PageComponents = require('../components/PageComponents')
        , Container    = PageComponents.Container
        , Row          = PageComponents.Row
        , Panel        = PageComponents.Panel
        , remote       = require('remote')
        , dialog       = remote.require('dialog')
        , ConfigStore  = remote.require('./client/js/stores/ConfigStore')
        , logger       = require('../util').logger;

    var SettingsPage = React.createClass({
        getInitialState: function () {
            var basedir = ConfigStore.getValue('basedir')
                , mediaFiles = ConfigStore.getValue('mediaFiles')
                , filename = ConfigStore.getValue('filename');
            logger.info('configured basedir:', basedir);
            logger.info('configured mediaFiles:', mediaFiles);
            logger.info('configured filename:', filename);
            return {
                basedir: basedir,
                mediaFiles: mediaFiles,
                filename: filename,
                configfile: ConfigStore.filename,
                saved: false
            };
        },
        handleSelectBasedir: function (ev) {
            var basedir = dialog.showOpenDialog({
                title: 'Wähle einen Basis-Ordner...',
                defaultPath: this.refs.basedir.getDOMNode().value,
                properties: ['openDirectory', 'createDirectory']
            });

            if (_.isArray(basedir) && basedir.length > 0) {
                this.setState({
                    basedir: basedir[0],
                    saved: false
                });
            }
        },
        handleChangeBasedir: function (ev) {
            this.setState({
                basedir: ev.target.value,
                saved: false
            });
        },
        handleChangeMediaFiles: function (ev) {
            this.setState({
                mediaFiles: ev.target.value,
                saved: false
            });
        },
        handleChangeFilename: function (ev) {
            this.setState({
                filename: ev.target.value,
                saved: false
            });
        },
        handleSaveConfig: function () {
            ConfigStore.setValue('basedir', this.state.basedir);
            ConfigStore.setValue('mediaFiles', this.state.mediaFiles);
            ConfigStore.setValue('filename', this.state.filename);
            this.setState({
                saved: ConfigStore.save()
            });
        },
        render: function () {
            return (
                <Container>
                    <Row>
                        <Panel title="Allgemeine Einstellungen">
                            <form role="form">
                                <div className="form-group">
                                    <label htmlFor="basedir">Basis-Ordner</label>
                                    <div className="input-group">
                                        <input ref="basedir" type="text" id="basedir" className="form-control"
                                            value={this.state.basedir} onChange={this.handleChangeBasedir}
                                            placeholder="Wähle einen Basis-Ordner..." />
                                        <span className="input-group-addon" onClick={this.handleSelectBasedir}>
                                            <span className="glyphicon glyphicon-folder-open"></span>
                                        </span>
                                    </div>
                                    <span className="help-block">
                                        Wähle hier den Basis-Ordner aus, in welchen die umbenannten Mediendateien
                                        kopiert oder verschoben werden (z.B. "C:\Meine Videos").
                                    </span>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="mediaFiles">Medien Dateien</label>
                                    <input ref="mediaFiles" type="text" id="mediaFiles" className="form-control"
                                        value={this.state.mediaFiles} onChange={this.handleChangeMediaFiles}
                                        placeholder="In die Suche einzubeziehende Dateiendungen ('|'-getrennte Liste)..." />
                                    <span className="help-block">
                                        Wähle hier, diejenigen Dateiendungen, welche in der Suche nach Mediendateien
                                        einbezogen werden sollen. Mehrere Endungen können als, durch "|" getrennte,
                                        Liste angegeben werden (übliche Videodateien: "mkv|avi|mp4").
                                    </span>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="filename">Dateinamen-Vorlage</label>
                                    <textarea ref="filename" rows="3" id="filename" className="form-control"
                                        value={this.state.filename} onChange={this.handleChangeFilename}
                                        placeholder="Vorlage für den Dateinamen..." />
                                    <span className="help-block">
                                        Wähle hier eine Vorlage für den Dateinamen aus. Variablen werden in doppelten
                                        geschweiften Klammern angegeben (z.B. "&#123;&#123;variable&#125;&#125;").
                                        Verfügbare Variablen:
                                        <ul>
                                            <li><i>basedir</i> - der Basis-Ordner</li>
                                            <li><i>series.name|escape</i> - der Serientitel</li>
                                            <li><i>episode.season|number:2</i> - die Staffelnummer (zweistellig)</li>
                                            <li><i>episode.episode|number:2</i> - die Episodennummer (zweistellig)</li>
                                            <li><i>episode.name|escape</i> - der Episodentitel</li>
                                            <li><i>extension</i> - die Dateiendungen der Originaldatei</li>
                                        </ul>
                                    </span>
                                </div>
                            </form>
                        </Panel>
                        <Panel title={'Konfigurationsdatei: ' + this.state.configfile + (this.state.saved ? ' gespeichert.' : '')}>
                            <button className="btn btn-primary" type="button" onClick={this.handleSaveConfig}>
                                <span className="glyphicon glyphicon-ok">Speichern</span>
                            </button>
                        </Panel>
                    </Row>
                </Container>
            );
        }
    });

    module.exports = SettingsPage;
}());
