/** @jsx React.DOM */

(function () {
    'use strict';

    var Bootstrap   = require('bootstrap/dist/js/bootstrap');

    var App = React.createClass({
        getInitialState: function () {
            var pages = [{
                key: '010',
                caption: 'TV-Serien',
                page: 'TvDBSearchPage'
            }];

            return {
                pages: pages,
                activeKey: pages[0].key
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
                <div className="container-fluid">
                    <div className="row">
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
                    </div>
                </div>
            );
        }
    });

    React.renderComponent(<App />, document.body);
}());
