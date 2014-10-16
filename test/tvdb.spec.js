var TvDB       = require('../lib/tvdb')
    , chai     = require('chai')
    , expect   = chai.expect
    , promised = require('chai-as-promised')
    , spies    = require('chai-spies')
    , fs       = require('fs.extra');

chai.use(promised).use(spies);

describe('TvDB#constructor', function () {
    it('should instantiate', function () {
        expect(new TvDB()).to.be.an.instanceof(TvDB);
    });
});

describe('TvDB#getter', function () {
    var tvdb = null, series = null;

    beforeEach(function () {
        tvdb = new TvDB(process.cwd() + '/config.yml');
    });

    it('should receive a mirrorlist', function (done) {
        tvdb.getMirrors()
        .then(function (mirrorlist) {
            expect(mirrorlist).to.be.an('array');
            done();
        })
        .catch(done)
        .done();
    });

    it('should receive a languagelist', function (done) {
        tvdb.getLanguages()
        .then(function (languagelist) {
            expect(languagelist).to.be.an('array');
            done();
        })
        .catch(done)
        .done();
    });

    it('should receive a series', function (done) {
        tvdb.getSeries('Apartment 23', 'de')
        .then(function (_series) {
            expect(_series).to.be.an('array');
            expect(_series[0]).to.have.property('id');
            series = _series[0];
            done();
        })
        .catch(done)
        .done();
    });

    it('should receive the episodes for a seriesid', function (done) {
        expect(series.id).to.be.a('number').and.above(0);
        expect(series.language).to.be.a('string').and.equal('de');

        tvdb.getEpisodes(series)
        .then(function (episodes) {
            expect(episodes).to.be.an('array');
            done();
        })
        .catch(done)
        .done();
    });

    it('should create filenames for a series', function (done) {
        expect(series).to.be.ok;

        tvdb.getFilenames([
            __dirname + '/S01E01 - wrong name.mkv',
            __dirname + '/1x02 - wrong name #2.mkv',
            __dirname + '/Apartment 23 - S1x03 - wrong name #3.mkv'
        ], series)
        .then(function (filenames) {
            expect(filenames.length).to.be.equal(3);
            done();
        })
        .catch(done)
        .done();
    });
});
