
require('dotenv').load();
const axios = require('axios');

function test (){
    axios.get('https://logs.mlab.com/servers/s-ds049770-a1/logs?apiKey=mS1sX4QvOdvnExq9IQfgrjCFeXduetDC')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.log(error);
  });
};

test ();