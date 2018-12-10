const pg = require('pg');
const logger = require('tracer').colorConsole();
const config = require('config');
const perf = require('execution-time')();
//const services = require('../service/service.js');
const consoleLog= require('../service/consoleLog.js');

const pool_cms = new pg.Pool(config.db_connectionString.pg.cms);

module.exports = {

    executeQuery: function (dataBase, dbQuery) {

        perf.start();

        return new Promise(function (resolve, reject) {

            executeQuery_db(dataBase, dbQuery, function (dbError, dbResult) {

                let timeToExecute = perf.stop();

                consoleLog.consoleQueryExecution(dataBase, dbQuery, dbError, dbResult, timeToExecute);
                
                if (dbError) {
                    reject(dbError)
                } else {
                    resolve(dbResult);
                }
            });
        })
    },
}

function executeQuery_db(dataBase, dbQuery, callback) {

    var pool = null;

    if (dataBase == "rmg_dev_db")
        pool = pool_cms;

    if (pool == null) {
        callback("DB Pool details not available for dataBase - " + dataBase, null);
    }
    else {
        pool.connect(function (connectError, client, done) {

            done();

            if (connectError) {
                callback(connectError, null);
            }
            else {
                client.query(dbQuery, function (dbError, dbResult) {

                    if (dbError) {
                        callback(dbError, null);
                    }
                    else if (!dbResult) {
                        callback(err, null);
                    } else {
                        callback(null, dbResult.rows);
                    }
                });
            }
        });
    }
}