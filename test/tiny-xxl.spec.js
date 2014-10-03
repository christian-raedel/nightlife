var tinyxxl  = require('../lib/tiny-xxl')
    , http   = require('http')
    , chai   = require('chai')
    , expect = chai.expect;

describe('TinyXxl#constructor', function () {
    it('should instantiate', function () {
        expect(tinyxxl.createBuilder({})).to.be.an.instanceof(tinyxxl);
    });
});

describe('TinyXxl#API', function () {
    it('should be feeded until end', function (done) {
        var builder = tinyxxl.createBuilder({
            'Mirror': {
                'id': 'id',
                'mirrorpath': 'url',
                'typemask': 'type'
            }
        });

        var req = http.get('http://thetvdb.com/api/66019AFB50EA6280/mirrors.xml', function (res) {
            expect(res.statusCode).to.be.equal(200);
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                builder.feed(chunk);
            });

            res.on('end', function () {
                var mirrors = builder.end();
                expect(mirrors[0]).to.have.property('id');
                expect(mirrors[0]).to.have.property('url');
                expect(mirrors[0]).to.have.property('type');
                done();
            });
        });

        req.on('error', function (err) {
            done(err);
        });
    });
});
