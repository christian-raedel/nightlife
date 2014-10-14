/** @jsx React.DOM */

(function () {
    'use strict';

    var logger  = require('../util').logger
        , shell = require('shell');

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

    module.exports.HeadingTable = HeadingTable;

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
                        <tr>
                            <td colSpan="2">
                                {this.props.children}
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        }
    });

    module.exports.GroupItemTable = GroupItemTable;

    var SeasonTable = React.createClass({
        getInitialState: function () {
            return {
                visible: []
            };
        },
        handleToggleExpand: function (season) {
            var visible = this.state.visible;
            visible[season] = !this.state.visible[season];

            this.setState({
                visible: visible
            });
        },
        render: function () {
            return (
                <table className="table table-striped col-md-12">
                    <tbody>
                        {_.map(this.props.seasons, function (episodes, season) {
                            return (
                                <tr key={season.toString()} className="info">
                                    <td width="85%">
                                        Staffel&nbsp;{season}
                                        <EpisodeTable visible={this.state.visible[season]} episodes={episodes} />
                                    </td>
                                    <td width="15%">
                                        <button type="button" className="btn btn-primary"
                                            onClick={this.handleToggleExpand.bind(this, season)}>
                                            <span className={'glyphicon ' +
                                                (this.state.visible[season] ? 'glyphicon-minus' : 'glyphicon-plus')}>
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        }, this)}
                    </tbody>
                </table>
            );
        }
    });

    module.exports.SeasonTable = SeasonTable;

    var EpisodeTable = React.createClass({
        handlePlayClick: function (filename) {
            logger.info('playing file:', filename);
            shell.openItem(filename);
        },
        render: function () {
            return (
                <table className={'table table-hover col-md-12 ' + (this.props.visible ? 'show' : 'hidden')}>
                    <tbody>
                        {_.map(this.props.episodes, function (episode) {
                            return (
                                <tr key={episode.episode.toString()}>
                                    <td width="5%">{episode.episode}.</td>
                                    <td width="85%">{episode.name}</td>
                                    <td width="10%">
                                        <button type="button" className="btn btn-warning"
                                            onClick={this.handlePlayClick.bind(this, episode.filename)}>
                                            <span className="glyphicon glyphicon-play"></span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        }, this)}
                    </tbody>
                </table>
            );
        }
    });

    module.exports.EpisodeTable = EpisodeTable;
}());
