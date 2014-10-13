var app             = require('app')
    , BrowserWindow = require('browser-window')
    , ipc           = require('ipc')
    , dialog        = require('dialog')
    , shortcut      = require('global-shortcut')
    , filemanager   = require('./lib/filemanager')
    , TvDB          = require('./lib/tvdb')
    , logger        = require('./client/js/util').logger
    , CConf         = require('node-cconf')
    , ConfigStore   = require('./client/js/stores/ConfigStore')
    , path          = require('path')
    , q             = require('q')
    , _             = require('lodash');

logger.info('arguments:', process.argv);
var config = new CConf('nightlife-options', ['config'], {
    'config': path.resolve(__dirname, 'config.yml')
})
.load(process.argv);
logger.info('configfile:', config.getValue('config'));

ConfigStore.load(config.getValue('config'));

app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

var mainWindow = null
    , tvdb     = new TvDB(ConfigStore.config);

process.chdir(__dirname);

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        center: true,
        'zoom-factor': ConfigStore.getValue('zoomLevel'),
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

ipc.on('choose-folders', function (ev, series) {
    logger.info('received choose-folders event...');
    dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']}, function (folders) {
        logger.info('choosen folders:', folders);
        var queue = [];

        _.forEach(folders, function (folder) {
            var find = filemanager.find(folder, ConfigStore.getValue('mediaFiles'));
            queue.push(find);
        });

        q.all(queue)
        .then(function (files) {
            files = _.flatten(files);
            logger.info('found files:', files);

            tvdb.getFilenames(files, series, ConfigStore.getValue('basedir'))
            .then(function (files) {
                logger.info('rename infos:', files);
                ev.returnValue = _.merge(series, {files: files});
            })
            .catch(function (err) {
                logger.error('cannot get rename infos!', err, err.stack);
                dialog.showMessageBox({
                    type: 'warning',
                    buttons: [
                        'Ok',
                        'Abbrechen'
                    ],
                    title: 'Fehler beim Ermitteln der neuen Dateinamen',
                    message: err.message,
                    detail: err.stack
                });
            })
            .done();
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
        ev.returnValue = series;
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
