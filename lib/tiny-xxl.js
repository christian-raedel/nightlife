var cheerio = require('cheerio')
    , debug = require('debug')('tiny-xxl')
    , _     = require('lodash');

function TinyXxl(mapping) {
    var self = this;

    if (_.isPlainObject(mapping)) {
        self.mapping = mapping;
    } else {
        throw new TypeError('TinyXxl requires a mapping object!');
    }

    self.xml = [];
    self.data = [];
}

TinyXxl.prototype.feed = function(chunk) {
    var self = this;
    self.xml.push(chunk);

    return self;
};

TinyXxl.prototype.end = function() {
    var self = this
        , xml = self.xml.join('')
        , mapping = self.mapping
        , data = self.data;

    debug('xml:', xml, 'mapping:', mapping);
    var $ = cheerio.load(xml);

    _.forOwn(mapping, function (mapping, selector) {
        $(selector).each(function (i, el) {
            var item = {};
            _.forOwn(mapping, function (field, mapping) {
                var value = $(this).find(mapping).text();
                var int = _.parseInt(value);
                item[field] = int || value;
            }, this);

            data.push(item);
            debug(item);
        })

        return false;
    });

    return data;
};

module.exports = TinyXxl;

function createBuilder(mapping) {
    return new TinyXxl(mapping);
}

module.exports.createBuilder = createBuilder;
