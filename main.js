var app             = require('app')
    , logger        = require('./client/js/util').logger
    , path          = require('path')
    , BrowserWindow = require('browser-window')
    , shortcut      = require('global-shortcut');

var mainWindow = null;
process.chdir(__dirname);

app.on('ready', function () {
    logger.info('create browser window');
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        center: true,
        title: 'Nightlife'
    });
    mainWindow.loadUrl('file://' + path.resolve(process.cwd(), 'client', 'index.html'));

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

app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});
