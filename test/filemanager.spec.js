var filemanager = require('../lib/filemanager')
    , TvDB      = require('../lib/tvdb')
    , fs        = require('fs')
    , path      = require('path')
    , q         = require('q')
    , chai      = require('chai')
    , expect    = chai.expect
    , promised  = require('chai-as-promised')
    , spies     = require('chai-spies')
    , _         = require('lodash');

chai.use(promised).use(spies);

describe('filemanager#find', function () {
    it('should walk a directory', function (done) {
        filemanager.find(process.cwd() + '/client', /^.*\.jsx$/g)
        .then(function (content) {
            expect(content).to.be.ok;
            console.log('summary:', content);
            done();
        })
        .catch(function (err) {
            done(new Error(err));
        })
        .done();
    });
});
