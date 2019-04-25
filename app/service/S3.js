const AWS = require('aws-sdk');
const fs = require('fs');
const config = require('config');

AWS.config.update(config.s3_auth);

const s3 = new AWS.S3();

const myBucket = 'static.bigpesa.in';

module.exports = {


    upload: async function (req, s3path) {

        return new Promise((resolve, reject) => {

            let object = req.files;

            for (const key in object) {

                if (object.hasOwnProperty(key)) {

                    const element = object[key];

                    let fromPath = element.destination + element.filename;

                    let utc = new Date().toJSON().slice(0, 10);

                    // let s3path = `admin/uploads/${utc}/${Date.now()}_${element.originalname}`;

                    s3path = s3path ? `${s3path}/${element.originalname}` : `admin/uploads/${utc}/${Date.now()}_${element.originalname}`;

                    let extension = path.extname(fromPath)

                    if (extension.toLowerCase() == ".jpg" ||
                        extension.toLowerCase() == ".jpeg" ||
                        extension.toLowerCase() == ".png" ||
                        extension.toLowerCase() == ".gif") {

                        fs.readFile(fromPath, function (err, data) {
                            if (err) { throw err; }

                            params = { Bucket: myBucket, Key: s3path, Body: data, ACL: 'public-read' };                            

                            s3.upload(params, function (err, data) {

                                if (err) {
                                    reject(err)
                                    console.log(err)

                                } else {

                                    resolve(data.Location)
                                    console.log("Successfully uploaded");
                                    console.log(data);

                                }

                            });

                        });
                    }
                    else
                        reject("error - Invalid File Format")
                }
                else
                    reject("error - hasOwnProperty error")
            }
        });
    }
}