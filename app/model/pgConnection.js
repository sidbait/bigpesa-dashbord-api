const pg = require('pg');
const logger = require('tracer').colorConsole();
const config = require('config');
const perf = require('execution-time')();
//const services = require('../service/service.js');
const consoleLog = require('../service/consoleLog.js');

const redis = require('./redisConnection');

const pool_pg_public = new pg.Pool(config.db_connectionString.pg.pg_public);
const pool_pg_private = new pg.Pool(config.db_connectionString.pg.pg_private);
const pool_pg_stg = new pg.Pool(config.db_connectionString.pg.pg_stg);

const pool_pg_readonly = new pg.Pool({
    "user": "support",
    "password": "Support@123",
    "database": "rmg_db",
    "host": "192.168.5.121",
    "port": 5432,
    "ssl": true,
    "max": 50,
    "min": 10,
    "idleTimeoutMillis": 500000
})

module.exports = {

    executeQuery: function (dataBase, dbQuery, isRedis = false, expiretime = 0, isReadOnly = false) {

        perf.start();

        return new Promise(function (resolve, reject) {
            if (isRedis) {
                redis.GetRedis(dbQuery).then(redisResult => {
                    console.log('getting value from redis');
                    resolve(redisResult);
                }).catch(async x => {
                    executeQuery_db(dataBase, dbQuery, isReadOnly, function (dbError, dbResult) {

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
                executeQuery_db(dataBase, dbQuery, isReadOnly, function (dbError, dbResult) {

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

function executeQuery_db(dataBase, dbQuery, isReadOnly, callback) {

    var pool = null;

    if (dataBase == "rmg_dev_db" && process.env.DB == 'pg_private')
        pool = pool_pg_private;
    else if (dataBase == "rmg_dev_db" && process.env.DB == 'pg_public')
        pool = pool_pg_public;
    else if (dataBase == "rmg_dev_db" && process.env.DB == 'pg_stg')
        pool = pool_pg_stg;
    else
        pool = pool_pg_private;

    if (isReadOnly)
        pool = pool_pg_readonly;

    console.log('process.env.DB ==>', process.env.DB);
    // console.log(pool);


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