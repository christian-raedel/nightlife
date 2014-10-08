/** @jsx React.DOM */

(function () {
    'use strict';

    var React = require('react')
        , _   = require('lodash');

    var Boxes = React.createClass({
        getInitialState: function () {
            return {
                visible: false,
                color: 'brown',
                backgroundColor: 'khaki'
            };
        },
        handleMouseEnter: function (ev) {
            this.setState({
                color: 'white',
                backgroundColor: 'blueviolet'
            });
        },
        handleMouseLeave: function (ev) {
            this.setState({
                color: 'brown',
                backgroundColor: 'khaki'
            });
        },
        render: function () {
            var style = {display: 'flex', flexDirection: this.props.horizontal ? 'row' : 'column'};

            if (this.props.dimension) {
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
            } else {
                style.flex = '1 0 auto';
            }

            style.color = this.state.color;
            style.backgroundColor = this.state.backgroundColor;

            return (
                <div style={style} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} visible={this.state.visible}>
                    {this.props.children}
                </div>
            );
        }
    });

    module.exports = Boxes;
}());
