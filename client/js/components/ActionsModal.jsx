/** @jsx React.DOM */

(function () {
    'use strict';

     var ActionsModal = React.createClass({
        render: function () {
            return (
                <div className="modal fade" id={this.props.id} tabIndex="-1"
                    role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <h4 className="modal-title" id="modalLabel">{this.props.title}</h4>
                            </div>
                            <div className="modal-body">
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">Abbrechen</button>
                                <button type="button" className="btn btn-primary">Speichern</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    });

    module.exports = ActionsModal;
}());
