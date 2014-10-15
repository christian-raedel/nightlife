/** @jsx React.DOM */

(function () {
    'use strict';

    var Bootstrap        = require('bootstrap/dist/js/bootstrap')
        , PageComponents = require('./components/PageComponents')
        , Container      = PageComponents.Container
        , Row            = PageComponents.Row
        , SeriesModel    = require('./stores/AppStore').getModel('series')
        , logger         = require('./util').logger;

    logger.debug('creating app class');

    var App = React.createClass({
        getInitialState: function () {
            var pages = [{
                key: '010',
                caption: 'Import',
                page: 'TvDBSearchPage'
            }, {
                key: '018',
                caption: 'Datenbank',
                page: 'TvDBPage'
            }, {
                key: '027',
                caption: 'Einstellungen',
                page: 'SettingsPage'
            }];

            var self = this;
            SeriesModel.on('change', function (data) {
                self.setState({
                    count: SeriesModel.findAll().length,
                    imported: SeriesModel.find({state: {'$eq': 'new'}}).length
                });
            });

            return {
                pages: pages,
                activeKey: pages[0].key,
                imported: 0,
                count: SeriesModel.findAll().length
            };
        },
        handleClick: function (key) {
            this.setState({
                activeKey: key
            });
        },
        render: function () {
            var Page = require('./pages/' + _.find(this.state.pages, {key: this.state.activeKey}).page);

            return (
                <Container style={{paddingBottom: '69px'}}>
                    <Row>
                        <div className="col-md-2">
                            <ul className="nav nav-pills nav-stacked">
                                {_.map(this.state.pages, function (page) {
                                    return (
                                        <li className={this.state.activeKey === page.key ? 'active' : ''} key={page.key}>
                                            <a onClick={this.handleClick.bind(this, page.key)}>
                                                {page.caption}
                                            </a>
                                        </li>
                                    )
                                }, this)}
                            </ul>
                        </div>
                        <div className="col-md-10">
                            <Page />
                        </div>
                    </Row>
                    <nav className="navbar navbar-default navbar-fixed-bottom" role="navigation">
                        <Container>
                            <ul className="nav navbar-nav navbar-right">
                                <li><p className="navbar-text">
                                    <span className="label label-info">{'TV-Serien in Datenbank: ' + this.state.count}</span>
                                </p></li>
                                <li><p className="navbar-text">
                                    <span className="label label-success">{'Neu hinzugekommen: ' + this.state.imported}</span>
                                </p></li>
                            </ul>
                        </Container>
                    </nav>
                </Container>
            );
        }
    });

    React.renderComponent(<App />, document.body);
}());
