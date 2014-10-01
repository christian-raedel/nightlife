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
        filemanager.find(process.cwd(), /^.*\.js$/g)
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

describe('filemanager#mkdir', function () {
    it('should simulate mkdir -p', function (done) {
        filemanager.mkdir(path.resolve(__dirname, 'not', 'existent', 'directory'))
        .then(function (created) {
            expect(created).to.be.true;
            expect(fs.existsSync(path.resolve(__dirname, 'not', 'existent', 'directory'))).to.be.true;
            done();
        })
        .catch(function (err) {
            done(new Error(err));
        })
        .done();
    });
});

describe('filemanager#copy', function () {
    it('should rename and copy files', function (done) {
        var tvdb = new TvDB();

        tvdb.getSeries('Apartment 23', 'de')
        .then(function (serieslist) {
            filemanager.find(path.resolve(__dirname, 'content', 'Apartment 23'), 'txt')
            .then(function (fileslist) {
                tvdb.getFilenames(fileslist, serieslist[0], path.resolve(__dirname, 'renamed'))
                .then(function (fileslist) {
                    return _.map(fileslist, function (files) {
                        return filemanager.copy(files[0], files[1]);
                    });
                })
                .then(q.all)
                .then(function (copied) {
                    expect(copied).to.have.property('length', 3);
                    expect(copied).to.be.deep.equal([true, true, true]);
                    done();
                })
                .catch(function (err) {
                    done(new Error(err));
                })
                .done();
            })
            .catch(function (err) {
                done(new Error(err));
            })
            .done();
        })
        .catch(function (err) {
            done(new Error(err));
        })
        .done();
    });
});
