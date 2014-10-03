var app             = require('app')
    , BrowserWindow = require('browser-window')
    , ipc           = require('ipc')
    , dialog        = require('dialog')
    , shortcut      = require('global-shortcut')
    , filemanager   = require('./lib/filemanager')
    , TvDB          = require('./lib/tvdb')
    , q             = require('q')
    , _             = require('lodash');

var mainWindow = null
    , tvdb = new TvDB();

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

ipc.on('choose-folders', function () {
    console.log('received choose-folders event...');
    var folders = dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']});
    console.log('choosen folders:', folders);
});
