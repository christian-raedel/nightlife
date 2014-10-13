/** @jsx React.DOM */

(function () {
    'use strict';

    var Container = React.createClass({
        render: function () {
            return this.transferPropsTo(
                <div className="container-fluid">
                    {this.props.children}
                </div>
            );
        }
    });

    module.exports.Container = Container;

    var Row = React.createClass({
        render: function () {
            return this.transferPropsTo(
                <div className="row">
                    {this.props.children}
                </div>
            );
        }
    });

    module.exports.Row = Row;

    var Panel = React.createClass({
        render: function () {
            return this.transferPropsTo(
                <div className="panel panel-info">
                    <div className="panel-heading">
                        <span>{this.props.title}</span>
                        <span className="badge">{this.props.badge > 0 ? this.props.badge : null}</span>
                    </div>
                    <div className="panel-body">
                        {this.props.children}
                    </div>
                </div>
            );
        }
    });

    module.exports.Panel = Panel;
}());
