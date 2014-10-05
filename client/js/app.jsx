/** @jsx React.DOM */

(function () {
    'use strict';

    var React          = require('react')
        , _            = require('lodash');

    var CssResetStyle  = require('css-reset/reset.css')
        , BaseStyle    = require('../style/Base.less');

    var Boxes = React.createClass({
        getInitialState: function () {
            return {
                backgroundColor: 'khaki'
            };
        },
        handleMouseEnter: function (ev) {
            this.setState({backgroundColor: 'blueviolet'});
        },
        handleMouseLeave: function (ev) {
            this.setState({backgroundColor: 'khaki'});
        },
        render: function () {
            var style = {display: 'flex', flexDirection: this.props.horizontal ? 'row' : 'column'};

            if (this.props.dimension.toString().split(' ').length === 3 || this.props.dimension.toString().indexOf('%') > 0) {
                style.flex = this.props.dimension;
                if (this.props.horizontal) {
                    style.width = '100%';
                } else {
                    style.height = '100%';
                }
            } else {
                if (this.props.horizontal) {
                    style.width = '100%';
                    style.height = this.props.dimension;
                } else {
                    style.width = this.props.dimension;
                    style.height = '100%';
                }
            }

            style.border = '3px solid ' + this.props.horizontal ? 'limegreen' : 'grey';
            style.backgroundColor = this.state.backgroundColor;

            return (
                <div style={style} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                    {this.props.children}
                </div>
            );
        }
    });

    var App = React.createClass({
        render: function () {
            return (
                <div style={_.merge(CssResetStyle, BaseStyle)}>
                    <Boxes horizontal={true} dimension={window.innerHeight}>
                        <Boxes dimension="1 0 auto">
                            <h1>It works!</h1>
                        </Boxes>
                        <Boxes dimension="2 0 auto">
                            <p>Juchuuu?!? ;)</p>
                        </Boxes>
                        <Boxes dimension="1 0 auto">
                            <p>Juchuuu... :P</p>
                        </Boxes>
                    </Boxes>
                </div>
            );
        }
    });

    React.renderComponent(<App />, document.body);
}());
