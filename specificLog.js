
require('dotenv').load();
const https = require('https');
const prompt = require('prompt');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const mlabApiKey = process.env.MLAB_API_KEY;
const serverName = process.env.SERVER_NAME;
const mongoLogListUrl = 'https://logs.mlab.com/servers/' + serverName + '/logs?apiKey=' + mlabApiKey
let logArray = [];
let specificLogName = '';
let specificLogString = '';


function mlabLogCollection(val) {
  https.get(val, getLogList);
}


function getLogList (response){
    console.log('statusCode:', response.statusCode);
    response.on('data', createLogListArray);
    response.on('end', getSingleLogFromList);
}


function createLogListArray (logList) {
    logArray += logList;
}


function getSingleLogFromList () {
    logArray = JSON.parse(logArray);
    showLogListArray(logArray);
    promptDesiredLog();
}


function showLogListArray(val){
    console.log(val);
};


function promptDesiredLog (){
    prompt.start();

    prompt.get(['specificLogName'], function (err, result) {
        if (err) { return onErr(err); }
        console.log('Command-line input received:');
        console.log('  Desired Log: ' + result.specificLogName);
        specificLogName = result.specificLogName;
        console.log(specificLogName);
        getSpecificLog(specificLogName, mlabApiKey);
      });
    
      function onErr(err) {
        console.log(err);
        return 1;
      }
};


function getSpecificLog (log) {
    let mongoSpecificLogUrl = 'https://logs.mlab.com/servers/s-ds049770-a1/logs/' + log + '?apiKey=' + mlabApiKey;
    https.get(mongoSpecificLogUrl, processLog);
}


function processLog(response) {
    console.log('statusCode:', response.statusCode);
    response.on('data', appendLogFile);
    response.on('end', () => uploadFileStream(specificLogName));
}


function appendLogFile(logFile) {
    try {
        specificLogString += logFile;
      } catch (err) {
          console.log(err);
      }         
}


function uploadFileStream (logName){
    const params = {
       Bucket: process.env.S3_UPLOAD_BUCKET,
       Key: logName,
       Body: specificLogString
    };
    s3.upload(params, function(s3Err){
        if (s3Err) throw s3Err
        console.log(`File streamed successfully.`)
    });
};

//Program start

mlabLogCollection(mongoLogListUrl);
