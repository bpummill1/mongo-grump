
require('dotenv').load();
const https = require('https');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const mlabApiKey = process.env.MLAB_API_KEY;
const serverName = process.env.SERVER_NAME;
const s3UploadBucket = process.env.S3_UPLOAD_BUCKET;
const mongoLogListUrl = 'https://logs.mlab.com/servers/' + serverName + '/logs?apiKey=' + mlabApiKey
let logArray = [];
let recentLogName = '';
let recentLogString = '';


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
    recentLogName = logArray.pop();
    showRecentLog(recentLogName);
    getRecentLog(recentLogName);
}


function showRecentLog (val) {
    console.log(val);
}


function getRecentLog (log) {
    let mongoRecentLogUrl = 'https://logs.mlab.com/servers/' + serverName + '/logs/' + log + '?apiKey=' + mlabApiKey;
    https.get(mongoRecentLogUrl, processLog);
}


function processLog(response) {
    console.log('statusCode:', response.statusCode);
    response.on('data', appendLogFile);
    response.on('end', () => uploadFileStream(recentLogName));
}


function appendLogFile(logFile) {
    recentLogString += logFile;        
}


function uploadFileStream (logName){
    const params = {
       Bucket: s3UploadBucket,
       Key: logName,
       Body: recentLogString
    };
    s3.upload(params, (s3Err) => {
        if (s3Err) throw s3Err
        console.log(`File streamed successfully.`)
    });
};

//Program start

mlabLogCollection(mongoLogListUrl);



