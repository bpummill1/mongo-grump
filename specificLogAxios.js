
require('dotenv').load();
const axios = require('axios');
const prompt = require('prompt');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const mlabApiKey = process.env.MLAB_API_KEY;
const serverName = process.env.SERVER_NAME;
const mongoLogListUrl = 'https://logs.mlab.com/servers/' + serverName + '/logs?apiKey=' + mlabApiKey
let specificLogName = '';
let specificLogString = '';


function axiosMlabLogCollection(val) {
    axios.get(val)
    .then(response => {
        console.log('statusCode:', response.status);
        console.log (response.data);
        promptDesiredLog();
      })
      .catch(error => {
        console.log(error);
      });
};


function promptDesiredLog (){
    prompt.start();

    prompt.get(['specificLogName'], function (err, result) {
        if (err) { return onErr(err); }
        console.log('Command-line input received:');
        console.log('  Desired Log: ' + result.specificLogName);
        specificLogName = result.specificLogName;
        console.log(specificLogName);
        getSpecificLogAxios(specificLogName);
      });
    
      function onErr(err) {
        console.log(err);
        return 1;
      }
};

function getSpecificLogAxios (log) {
    let mongoSpecificLogUrl = 'https://logs.mlab.com/servers/s-ds049770-a1/logs/' + log + '?apiKey=' + mlabApiKey;
    axios.get(mongoSpecificLogUrl)
    .then(response => {
        console.log('statusCode:', response.status);
        specificLogString += response.data;
        uploadFileStream(specificLogName);
      })
      .catch(error => {
        console.log(error);
      });
};

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

axiosMlabLogCollection(mongoLogListUrl);
