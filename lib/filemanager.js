var fs      = require('fs')
    , path  = require('path')
    , q     = require('q')
    , debug = require('debug')('filemanager')
    , _     = require('lodash');

function find(root, pattern) {
    if (_.isArray(pattern)) {
        pattern = new RegExp(pattern[0], pattern[1]);
    } else if (_.isString(pattern)) {
        pattern = new RegExp('^.*.(' + pattern + ')$');
    } else {
        pattern = new RegExp(pattern);
    }

    return q.nfcall(fs.readdir, root)
    .then(function (content) {
        var map = _.map(content, function (content) {
            content = path.resolve(root, content);

            return q.nfcall(fs.stat, content)
            .then(function (stat) {
                if (stat.isDirectory()) {
                    debug('walk subdir:', content);
                    return find(content, pattern);
                } else {
                    if (content.match(pattern)) {
                        debug('find match:', content);
                        return content;
                    } else {
                        return false;
                    }
                }
            });
        });

        return q.all(map)
        .then(function (content) {
            return _.flatten(_.filter(content, function (content) {
                return content;
            }));
        });
    });
}

module.exports.find = find;

function mkdir(root, mode) {
    return q.fcall(function () {
        var str = _.reduce(root.split(path.sep), function (prev, field) {
            var dir = path.resolve(prev, field);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, mode || '0755');
            }

            return dir;
        }, '/');

        return _.isEqual(root, str);
    });
}

module.exports.mkdir = mkdir;

function copy(src, dst) {
    var defer = q.defer();

    function onerror(err) {
        defer.reject(err);
    }

    if (fs.existsSync(src)) {
        mkdir(path.dirname(dst))
        .then(function (created) {
            if (created) {
                var rs = fs.createReadStream(src);
                rs.on('error', onerror);

                var ws = fs.createWriteStream(dst);
                ws.on('error', onerror);
                ws.on('close', function () {
                    defer.resolve(true);
                });

                debug('pipe [%s] into [%s]', src, dst);
                rs.pipe(ws);
            } else {
                defer.reject(new Error('Cannot perform copy operation, because cannot create destination directory!'));
            }
        });
    } else {
        defer.reject(new Error('Cannot perform copy operation, because source does not exists!'));
    }

    return defer.promise;
}

module.exports.copy = copy;
