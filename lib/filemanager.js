var Promise = require('bluebird')
    , fs    = Promise.promisifyAll(require('fs.extra'))
    , path  = require('path')
    , _     = require('lodash');

function find(root, pattern) {
    pattern = pattern || '*';

    var re = new RegExp(pattern);
    return fs.readdirAsync(root)
    .then(function (content) {
        return Promise.all(_.map(content, function (content) {
            content = path.resolve(root, content);
            return fs.statAsync(content)
            .then(function (stat) {
                if (stat.isDirectory()) {
                    return find(content, re);
                } else {
                    if (content.match(re)) {
                        return Promise.resolve(content);
                    }
                }
            });
        }))
        .then(function (content) {
            return _.flatten(_.filter(content, function (content) {
                return content;
            }));
        });
    });
}

module.exports.find = find;

module.exports.mkdirp = fs.mkdirpAsync;

module.exports.copy = fs.copyAsync;

module.exports.move = fs.moveAsync;
