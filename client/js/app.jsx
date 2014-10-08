/** @jsx React.DOM */

(function () {
    'use strict';

    var React          = require('react')
        , Boxes        = require('./components/Boxes')
        , MenuModel    = require('./stores/AppStore').getModel('menu')
        , _            = require('lodash');

    var CssResetStyle  = require('css-reset/reset.css')
        , BaseStyle    = require('../style/Base.less')
        , ButtonStyle  = require('../style/Button.less');

    var App = React.createClass({
        getInitialState: function () {
            return {
                page: MenuModel.find({id: {'$eq': '010'}})[0].page,
                items: MenuModel.data
            };
        },
        handleOnClick: function (id) {
            this.setState({
                page: MenuModel.find({id: {'$eq': id}})[0].page
            });
        },
        render: function () {
            var Page = require('./pages/' + this.state.page);

            return (
                <Boxes horizontal={true} dimension={window.innerHeight} style={_.merge(CssResetStyle, BaseStyle)}>
                    <Boxes dimension="20%">
                        {_.map(this.state.items, function (item) {
                            return (
                                <button key={item.id} style={ButtonStyle} onClick={this.handleOnClick.bind(this, item.id)}>
                                    {item.caption}
                                </button>
                            );
                        }, this)}
                    </Boxes>
                    <Boxes dimension="80%">
                        <Page />
                    </Boxes>
                </Boxes>
            );
        }
    });

    React.renderComponent(<App />, document.body);
}());
