[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/christian-raedel/nightlife?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

#Nightlife...#

... is an automatic file renamer for tv-shows, found on [thetvdb.com](http://thetvdb.com).
It copies or moves renamed files into your movie-collection. Its platform independent and
free to use.

##Installation##

1. Download a copy of [atom-shell](https://github.com/atom/atom-shell/releases) suit your needs.
2. Extract this downloaded file into your apps directory and put this directory into your **$PATH**.
3. Clone this repository...

``` Shell
$ git clone https://github.com/christian-raedel/nightlife
```

4. Run Nightlife...

``` Shell
$ cd path/to/nightlife
$ atom .
```

-OR, if you don't want to put **atom-shell** into your **$PATH**-

``` Shell
$ cd path/to/atom-shell
$ ./atom --config=/path/to/configfile.yml
```

##Usage##

1. Run Nightlife and goto settings page. Change settings to your needs (especially the base directory).
2. Goto search page and search a tv-show you want to rename on your harddisk.
3. View the search results and click on the **import button** at the correct entry.
4. Choose the folder on your harddisk holding the episodes to this show.
5. Check the rename-preview for correct settings and choose **copy** or **move**.
6. Wait until progress bar disappears.
7. Finished.

##Localization##

Currently the UI is only available in german. If you want help to localize, fork this repo and create
a pull request or file an issue.

##Contribute##

If you want to contribute, join us on [gitter.im](https://gitter.im/christian-raedel/nightlife).
