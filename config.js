const fs = require('fs');
try{
    const configData = fs.readFileSync('./env.json').toString();
    module.exports = configData;
} catch (err){
   throw new Error('env.json not found in root of application. Please create env.json and place config values in json format to proceed!');
}