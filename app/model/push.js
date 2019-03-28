
var https = require('https');
const config = require('config');
const request = require('request');

module.exports = {
    sendNotification: function (mobile, title, message) {

        var data = {
            app_id: config.oneSignalAppId,
            'filters': [
                {
                    'field': 'tag',
                    'key': 'userId',
                    'relation': '=',
                    'value': mobile,
                },
            ],
            'headings': { 'en': title },
            'chrome_web_icon': config.iconUrl,
            'contents': { 'en': message }
        };

        var headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Basic " + config.Authorization
        };

        var options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        };

        var req = https.request(options, function (res) {
            res.on('data', function (data) {
                console.log("Response:");
                //console.log(mobile, title, message);
                console.log(JSON.parse(data));
            });
        });

        req.on('error', function (e) {
            console.log("ERROR:");
            console.log(e);
        });

        req.write(JSON.stringify(data));
        req.end();
    },

    pushSMS: function (numbers, message) {

        console.log(numbers);
        console.log(message);
        var options = {
            method: 'POST',
            url: 'http://203.115.112.8/CommonMTURLAllOperator/BulkSMS.aspx',
            headers:
            {
                'cache-control': 'no-cache',
                MSG: message
            },
            body: numbers
        };

        request(options, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the HTML for the Google homepage.
        });
    }

    //paid API
    // function pushSMS(numbers, message) {

    //     let pushSMSUrl = "http://182.18.143.11/api/mt/SendSMS?user=nazara&password=nazara&senderid=BGPESA&channel=Trans&DCS=0&flashsms=0&number=" + numbers + "&text=" + message + "&route=55";
    //     console.log(pushSMSUrl);
    //     request(pushSMSUrl, function (error, response, body) {
    //         console.log('error:', error); // Print the error if one occurred
    //         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //         console.log('body:', body); // Print the HTML for the Google homepage.

    //         let uploadFilepath = `./public/bulk/sms/report/` + getDateTime() + `.txt`;
    //         fs.writeFile(uploadFilepath, body, function (error) {
    //             if (error) {
    //                 console.error("write error:  " + error.message);
    //             } else {
    //                 console.log("Successful Write to " + uploadFilepath);
    //             }
    //         });
    //     });

    // }
}