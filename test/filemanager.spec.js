var filemanager = require('../lib/filemanager')
    , path      = require('path')
    , chai      = require('chai')
    , expect    = chai.expect
    , _         = require('lodash');

describe('filemanager#find', function () {
    it('should find filenames', function (done) {
        filemanager.find(path.resolve(process.cwd(), 'client'), /^.*\.jsx$/g)
        .tap(console.log)
        .then(function (content) {
            expect(content).to.be.an('array');
            done();
        })
        .catch(done)
        .done();
    });
});
