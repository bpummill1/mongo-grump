
const stream = {
    on: function(eventName, callback) {
        const message = `Processing some async operation for ${eventName}...`;
        callback(message);
    }
}

const HTTP_STATUS = "200";

const done = (msg) => {
    console.log(`Result: ${msg}`);
    console.log("All done!");
}

function httpDone () {
    done(HTTP_STATUS);
}
 

const stuff = [
    {
        name: "pul",
    },
    {
        name: "ben",
    }
]
