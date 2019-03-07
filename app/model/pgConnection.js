const pg = require('pg');
const logger = require('tracer').colorConsole();
const config = require('config');
const perf = require('execution-time')();
//const services = require('../service/service.js');
const consoleLog = require('../service/consoleLog.js');

const redis = require('./redisConnection');

const pool_private = new pg.Pool(config.db_connectionString.pg.private);
const pool_public = new pg.Pool(config.db_connectionString.pg.public);
const pool_pg_public = new pg.Pool(config.db_connectionString.pg.pg_public);

module.exports = {

    executeQuery: function (dataBase, dbQuery, isRedis = false, expiretime = 0) {

        perf.start();

        return new Promise(function (resolve, reject) {
            if (isRedis) {
                redis.GetRedis(dbQuery).then(redisResult => {
                    console.log('getting value from redis');
                    resolve(redisResult);
                }).catch(async x => {
                    executeQuery_db(dataBase, dbQuery, function (dbError, dbResult) {

                        let timeToExecute = perf.stop();

                        consoleLog.consoleQueryExecution(dataBase, dbQuery, dbError, dbResult, timeToExecute);

                        if (dbError) {
                            reject(dbError)
                        } else {
                            redis.SetRedis(dbQuery, dbResult, expiretime)
                                .then(x => console.log('value set in redis'))
                                .catch(x => console.log('error while setting value in redis'))
                            resolve(dbResult);
                        }
                    });
                });
            } else {
                executeQuery_db(dataBase, dbQuery, function (dbError, dbResult) {

                    let timeToExecute = perf.stop();

                    consoleLog.consoleQueryExecution(dataBase, dbQuery, dbError, dbResult, timeToExecute);

                    if (dbError) {
                        reject(dbError)
                    } else {
                        resolve(dbResult);
                    }
                });
            }
        })
    },
}

function executeQuery_db(dataBase, dbQuery, callback) {

    var pool = null;

    if (dataBase == "rmg_dev_db" && process.env.DB == 'public')
        pool = pool_public;
    else if (dataBase == "rmg_dev_db" && process.env.DB == 'pg_public')
        pool = pool_pg_public;
    else
        pool = pool_private;

    console.log('process.env.DB ==>', process.env.DB);

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