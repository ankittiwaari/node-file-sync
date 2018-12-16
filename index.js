const fs = require('fs');
const argv = require('yargs').argv;
const Client = require('node-ftp');
const archiver = require('archiver');
const c = new Client();
const config = JSON.parse(require('./config'));

if (argv.upload || argv.u){
    console.log('Initiating upload!');
    uploadFilesToServer();
}else if(argv.download || argv.d){
    console.log('Initiating download!')
}else{
    console.log('Invalid or missing argument!');
}


function uploadFilesToServer(){
    
//create an archived file
const output = fs.createWriteStream(__dirname + '/files.zip');
const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function () {
    console.log('Total archive size :: ' + (archive.pointer() / (1024*1024)).toFixed(2) + ' MB');
    console.log('Archive created successfully. Proceeding with upload!');
    c.connect({
        user: config.user,
        password: config.password,
        host: config.host
    });
});

output.on('end', function () {
    console.log('Data has been drained');
});

archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
        // log warning
    } else {
        // throw error
        throw err;
    }
});
archive.on('error', function (err) {
    throw err;
});

archive.pipe(output);
archive.directory(config.localDirectory, false);
archive.finalize();

c.on('ready', function () {
    c.put(__dirname + '/files.zip', config.path + 'files.zip', (err) => {
        if (err) {
            throw err;
        }
        console.log('File uploaded, deleting local copy!');
        c.end();
        fs.unlink(__dirname + '/files.zip', (err) => {
            if (err){throw err}
            console.log('Local archive deleted!')
        })
    });
});
}

