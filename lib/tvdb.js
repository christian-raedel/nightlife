var CConf     = require('node-cconf')
    , CLogger = require('node-clogger')
    , engine  = require('dna')
    , tinyxxl = require('./tiny-xxl')
    , Promise = require('bluebird')
    , http    = require('http')
    , url     = require('url')
    , path    = require('path')
    , _       = require('lodash');

function TvDB(opts) {
    var self = this;

    var config = new CConf('tvdb', ['api:baseurl', 'api:key'], {
        'api': {
            'baseurl': 'http://thetvdb.com/api/',
            'key': '66019AFB50EA6280'
        },
        'replace': ['^\\.|\\/|\\:|\\0|\\*|\\?|\\\\|\\"|<|>|\\|', 'g', '_'],
        'logger': new CLogger({name: 'the-tv-db'})
    })
    .load(opts || {});

    config.getValue('logger').extend(self);

    var dna = engine.createDNA();

    dna.use('escape', function (value) {
        var replace = self.config.getValue('replace');
        var re = new RegExp(replace[0], replace[1]);
        return value.toString().replace(re, replace[2]);
    });

    dna.use('number', function (value, length) {
        value = value.toString();
        while (value.length !== length) {
            value = '0' + value;
        }
        return value;
    });

    self.config = config;
    self.dna = dna;
}

TvDB.prototype.__defineGetter__('basepath', function () {
    var self = this;

    return self.config.getValue('api:baseurl') + self.config.getValue('api:key') + '/';
});

TvDB.prototype.getMirrors = function() {
    var self = this;

    return new Promise(function (resolve, reject) {
        http.get(url.parse(self.basepath + 'mirrors.xml'), function (res) {
            self.info('request mirrors, got status', res.statusCode);
            if (res.statusCode !== 200) {
                reject(new Error('response status: ' + res.statusCode));
            }

            var builder = tinyxxl.createBuilder({
                'Mirror': {
                    'id': 'id',
                    'mirrorpath': 'url',
                    'typemask': 'type'
                }
            });
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                builder.feed(chunk);
            });

            res.on('end', function () {
                var mirrors = builder.end();
                self.debug('mirrors', mirrors);
                resolve(mirrors);
            });
        })
        .on('error', function (err) {
            reject(err);
        });
    });
};

TvDB.prototype.getLanguages = function() {
    var self = this;

    return new Promise(function (resolve, reject) {
        http.get(url.parse(self.basepath + 'languages.xml'), function (res) {
            self.info('request languages, got status', res.statusCode);
            if (res.statusCode !== 200) {
                reject(new Error('response status: ' + res.statusCode));
            }

            var builder = tinyxxl.createBuilder({
                'Language': {
                    'id': 'id',
                    'name': 'name',
                    'abbreviation': 'abbreviation'
                }
            });
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                builder.feed(chunk);
            });

            res.on('end', function () {
                var languages = builder.end();
                self.debug('languages', languages);
                resolve(languages);
            });
        })
        .on('error', function (err) {
            reject(err);
        });
    });
};

TvDB.prototype.getSeries = function(name, language) {
    var self = this;

    return new Promise(function (resolve, reject) {
        if (_.isString(name)) {
            http.get(url.parse(self.config.getValue('api:baseurl') + 'GetSeries.php?seriesname=' +
                        name + '&language=' + language || 'all', true), function (res) {
                self.info('request series [%s] got status', name, res.statusCode);
                if (res.statusCode !== 200) {
                    reject(new Error('response status: ' + res.statusCode));
                }

                var builder = tinyxxl.createBuilder({
                    'Series': {
                        'seriesid': 'id',
                        'SeriesName': 'name',
                        'AliasNames': 'alias',
                        'language': 'language',
                        'banner': 'banner',
                        'Overview': 'overview',
                        'FirstAired': 'firstAired',
                        'Network': 'network',
                        'IMDB_ID': 'imdbId'
                    }
                });
                res.setEncoding('utf8');

                res.on('data', function (chunk) {
                    builder.feed(chunk);
                });

                res.on('end', function () {
                    var series = builder.end();
                    self.debug('series', series);
                    resolve(series);
                });
            })
            .on('error', function (err) {
                reject(err);
            });
        } else {
            reject(new TypeError('Seriesname must be a string!'));
        }
    });
};

TvDB.prototype.getEpisodes = function(series) {
    var self = this;

    return new Promise(function (resolve, reject) {
        if (_.isNumber(series.id)) {
            http.get(url.parse(self.basepath + 'series/' + series.id + '/all/' + (series.language || 'en') + '.xml'), function (res) {
                self.info('request episodes for seriesid [%s] got status', series.id, res.statusCode);
                if (res.statusCode !== 200) {
                    reject(new Error('response status: ' + res.statusCode));
                }

                var builder = tinyxxl.createBuilder({
                    'Episode': {
                        'id': 'id',
                        'EpisodeName': 'name',
                        'Combined_episodenumber': 'episode',
                        'Combined_season': 'season',
                        'seasonid': 'seasonid',
                        'seriesid': 'seriesid'
                    }
                });
                res.setEncoding('utf8');

                res.on('data', function (chunk) {
                    builder.feed(chunk);
                });

                res.on('end', function () {
                    var episodes = _.sortBy(builder.end(), ['season', 'episode']);
                    self.debug('episodes', episodes);
                    resolve(episodes);
                });
            })
            .on('error', function (err) {
                reject(err);
            })
        } else {
            reject(new TypeError('Cannot retrieve episodes without a valid series id!'));
        }
    })
};

TvDB.prototype.getFilenames = function(inputFiles, series, basedir) {
    var self = this
        , template = self.config.getValue('filename');

    return self.getEpisodes(series)
    .then(function (episodes) {
        var map = _.map(inputFiles, function (inputFile) {
            var episode = _.find(episodes, function (episode) {
                var map = _.map(inputFile.match(/\d+[a-zA-Z]{1}\d+/g)[0].split(/[a-zA-Z]{1}/), function (match) {
                    return _.parseInt(match);
                });
                return _.isEqual(map.slice(0, 2), [episode.season, episode.episode]);
            });
            self.debug(episode);
            if (episode) {
                var newFilename = self.dna.render(template, {
                    basedir: basedir || path.dirname(inputFile),
                    extension: path.extname(inputFile),
                    series: series,
                    episode: episode
                });

                return [inputFile, newFilename, episode];
            } else {
                return false;
            }
        });

        return filtered = _.filter(map, function (file) {
            return file;
        });
    });
};

module.exports = TvDB;
