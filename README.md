# Hubspot Sync

Sync local files with Hubspot (Hubapi). Hubapi uses **FTPS** (FTP with SSL). Note this is not the same as SFTP. I've found Hubapi works best with **FTPS with explicit SSL** vs the implicit version and the default settings reflect this.

The ultimate goal of this application is to provide a simple way to deploy local files to Hubspot using Hubapi. To support this it has the following features:

 - **Pull** (*Mirror Reverse* - Syncs your local directory to mirror a Hubspot remote directory recursively). This is a bulk process so feedback only occurs on error or when the process is complete.
 - **Push** (*Mirror* - Syncs Hubspot remote directory to mirror your local directory recursively). This is a bulk process so feedback only occurs on error or when the process is complete.
 - **PullSafe** Same as Pull but files are moved individually and there are overwrite options such as compare timestamps.
 - **PushSafe** Same as Push but files are moved individually and there are overwrite options such as compare timestamps.
 - **Deploy** (*TBD*)

**Notice: . Do not use this application in production as its in-progress. All commits will be squashed when working**

## Usage Commandline

```js
$ hubspot-sync --help

 Usage: hubspot-sync [command] [options]

 Options:

   -h, --help            output usage information
   -V, --version         output the version number
   -c, --config <>       Path to config file

example:

$ hubspot-sync pull -c '../config.yml'

```

## Usage API (es2015)

```js
import HubspotSync from 'hubspot-sync';

new HubspotSync('./config.yml').pull().then(
  (data) => {
    console.log(data); // list of files and directories synced
  },
  err => console.error('Pull failed', err),
);

```

## Config file

#### Step 1 - Create a configuration file

*config.yml*
**username and password are mandatory.**
```
---
remoteDir: "./"
localDir: "./"
username: anonymous@yourcompany.com
password: secret
additionalLftpCommands: 'set ftp:prefer-epsv off'
```
username and password are mandatory.
***additionalLftpCommands***: *for additional LFTP commands insert a string of semicolon delimited commands*

For all available configuration options please see the options available for [LFTP](https://lftp.yar.ru/lftp-man.html) . By default these LFTP options are used and have been tested to work with Hubapi's FTPS servers.

```js
const additional = [
  'set ftp:prefer-epsv off',
  'set ftp:passive-mode on',
  'set file:charset UTF-8',
  'set ftp:use-utf8 yes',
  'set ftp:ssl-protect-data on',
  'set ftp:ssl-allow on',
  'set ftp:ssl-protect-list no',
  'set ftp:ssl-force yes',
  'set ssl:verify-certificate no',
  'set cmd:fail-exit yes',
  'set ftp:list-options -la',
];
```
## Installation

This application uses LFTP for file transfer, for more information visit its [LFTP](https://lftp.yar.ru/)

**To install on a Mac.**
`$ brew install lftp`

**Install hubspot-sync**
```npm install hubspot-sync```

**globally**
```npm install -g hubspot-sync```

**using yarn**
```yarn add hubspot-sync```


