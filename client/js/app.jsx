/** @jsx React.DOM */

(function () {
    'use strict';

    var MenuModel        = require('./stores/AppStore').getModel('menu');

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
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-4">
                            <ul className="nav nav-pills nav-stacked">
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
                        <div className="col-md-8">
                            <Page />
                        </div>
                    </div>
                </div>
            );
        }
    });

    React.renderComponent(<App />, document.body);
}());
