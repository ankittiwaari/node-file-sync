const fs = require('fs');
const argv = require('yargs').argv;
const Spinner = require('cli-spinner').Spinner;
const Client = require('node-ftp');
const archiver = require('archiver');
const extract = require('extract-zip');
const c = new Client();
const config = JSON.parse(require('./config'));

const connectionData = {
  user: config.user,
  password: config.password,
  host: config.host
};
const spinner = new Spinner();
spinner.setSpinnerString(0);
spinner.start();

if (argv.upload || argv.u){
  console.log('Initiating upload!');
  uploadFilesToServer();
}else if(argv.download || argv.d){
  console.log('Initiating download!');
  downloadFromServer();
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
    c.connect(connectionData);
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
function downloadFromServer()
{
  c.on('ready', function() {
    c.get(config.path + 'files.zip', function(err, stream) {
      if (err) throw err;
      stream.once('close', function() {
        c.end();
        console.log("File downloaded at :: ", __dirname + '/files.zip');
        extractZip(__dirname + '/files.zip');
      });
      stream.pipe(fs.createWriteStream(__dirname + '/files.zip'));
    });
  });
  c.connect(connectionData);
}

function extractZip(source){
  if (!source){
    throw new Error('Source archive not found! Either the dowload failed or the path is not readable.');
  }

  extract(source, {dir: '/Applications/XAMPP/xamppfiles/htdocs/LEARN/node-file-sync/'}, function (err){
    console.log(source)
    if (err){
      throw err;
    }
    console.log('Download finished. You can find downloaded files at ' + __dirname + 'files');
  });
}
