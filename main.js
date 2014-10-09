var app             = require('app')
    , BrowserWindow = require('browser-window')
    , ipc           = require('ipc')
    , dialog        = require('dialog')
    , shortcut      = require('global-shortcut')
    , filemanager   = require('./lib/filemanager')
    , TvDB          = require('./lib/tvdb')
    , CLogger       = require('node-clogger')
    , q             = require('q')
    , _             = require('lodash');

var mainWindow = null
    , tvdb     = new TvDB()
    , logger   = new CLogger({name: 'nightlife-app'});

app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        center: true,
        'zoom-factor': 1.5,
        title: 'Nightlife'
    });
    mainWindow.loadUrl('file://' + process.cwd() + '/client/index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    shortcut.register('F12', function () {
        BrowserWindow.getFocusedWindow().toggleDevTools();
    });

    shortcut.register('ctrl+r', function () {
        BrowserWindow.getFocusedWindow().reloadIgnoringCache();
    });
});

ipc.on('choose-folders', function (ev) {
    logger.info('received choose-folders event...');
    dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']}, function (folders) {
        logger.info('choosen folders:', folders);
        var queue = [];

        _.forEach(folders, function (folder) {
            var find = filemanager.find(folder, 'mkv|avi|mp4');
            queue.push(find);
        });

        q.all(queue)
        .then(function (files) {
            files = _.flatten(files);
            logger.info('found files:', files);

            ev.sender.send('choosen-files', files);
        })
        .catch(function (err) {
            logger.error('cannot find files!', err, err.stack);
        })
        .done();
    });
});

ipc.on('search-series', function (ev, query, lang) {
    logger.info('lookup series [%s]', query, lang);
    tvdb.getSeries(query, lang)
    .then(function (series) {
        ev.sender.send('found-series', series);
    })
    .progress(function (value) {
        ev.sender.send('progress', value);
    })
    .catch(function (err) {
        logger.error('cannot lookup series', err, err.stack);
    })
    .done();
});

ipc.on('get-languages', function (ev) {
    logger.info('get list of supported languages');
    tvdb.getLanguages()
    .then(function (languages) {
        logger.info('supported languages:', languages);
        ev.returnValue = languages;
    })
    .catch(function (err) {
        logger.error('cannot receive supported languages!', err, err.stack);
    })
    .done();
})
