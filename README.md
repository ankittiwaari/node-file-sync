# NodeJS file sync
This app uses node-ftp and archiver npm packages to first create an archive of specified directory and then upload them to FTP server.

## Installation
1- Clone this repo or download the zip<br/>
2- Run npm i<br/>
3- Create a file `env.json` at root use following sample<br/>
```json
{
    "user": "FTP username",
    "password": "FTP password",
    "host": "FTP host",
    "path": "Relative path on the FTP server where the file is to be uploaded",
    "localDirectory": "Local directory whose contents are to be archived and uploaded"
}
```
## Using the app
1- Run `npm run upload` to upload the zip archive of the `localDirectory` to `path` on server.<br/>
2- Run `npm run download` to download the zip archive of files from `path` on server to `localDirectory` locally.
