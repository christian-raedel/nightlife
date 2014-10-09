/** @jsx React.DOM */

(function () {
    'use strict';

    var Bootstrap   = require('bootstrap/dist/js/bootstrap')
        , MenuModel = require('./stores/AppStore').getModel('menu');

    var App = React.createClass({
        getInitialState: function () {
            return {
                activeKey: MenuModel.findAllAnd().orderBy('key')[0].key
            };
        },
        handleClick: function (key) {
            this.setState({
                activeKey: key
            });
        },
        render: function () {
            var Page = require('./pages/' + MenuModel.findOne({key: {'$eq': this.state.activeKey}}).page);

            return (
                <div className="container">
                    <div className="row">
                        <div className="col-md-2">
                            <ul className="nav nav-pills">
                                {_.map(MenuModel.findAllAnd().orderBy('key'), function (item) {
                                    return (
                                        <li className={this.state.activeKey === item.key ? 'active' : ''} key={item.key}>
                                            <a onClick={this.handleClick.bind(this, item.key)}>
                                                {item.caption}
                                            </a>
                                        </li>
                                    )
                                }, this)}
                            </ul>
                        </div>
                        <div className="col-md-9 col-md-offset-1">
                            <Page />
                        </div>
                    </div>
                </div>
            );
        }
    });

    React.renderComponent(<App />, document.body);
}());
