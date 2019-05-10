const pgConnection = require('../../model/pgConnection');
const mv = require('mv');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getAll: async function (req, res) {

        let _selectQuery = "Select * From tbl_app order by app_name"
        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            }
            else
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    bulkUpdateGameConf: async function (req, res) {

        let selectedGamesId = req.body.selectedGamesId ? req.body.selectedGamesId : null;

        let level = req.body.level ? req.body.level : null;

        let updateQueries = await getbulkUpdateGameConfQueries(selectedGamesId, level);

        let updateMasterQueries = await getbulkUpdateGameConfMasterQueries(selectedGamesId, level);

        // console.log(updateMasterQueries);

        Promise.all(updateQueries.map(async (query) => {
            return await pgConnection.executeQuery('rmg_dev_db', query);
        })).then((inresults) => {
            Promise.all(updateMasterQueries.map(async (query) => {
                return await pgConnection.executeQuery('rmg_dev_db', query);
            })).then((inresults) => {
                // console.log(inresults);
                services.sendResponse.sendWithCode(req, res, inresults, customMsgType, "ADD_SUCCESS");
            }).catch((err) => console.log(err))
            // services.sendResponse.sendWithCode(req, res, inresults, customMsgType, "ADD_SUCCESS");
        }).catch((err) => console.log(err))

        // res.send({'ok':'ok'})

    },

    add: async function (req, res) {

        let rules = {
            "app_name": 'required',
            // "app_secret": 'required',
            "app_code": 'required',
            "status": 'required'
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {


            let _app_id = req.body.app_id ? req.body.app_id : null;
            let _app_name = req.body.app_name ? req.body.app_name : null;
            let _app_secret = req.body.app_secret ? req.body.app_secret : null;
            let _app_code = req.body.app_code ? req.body.app_code : null;
            let _privacy_policy = req.body.privacy_policy ? req.body.privacy_policy : null;
            let _term_condition = req.body.term_condition ? req.body.term_condition : null;
            // let _app_icon = req.body.app_icon ? req.body.app_icon : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;
            let _callback_url = req.body.callback_url ? req.body.callback_url : null;
            let _ios_app_url = req.body.ios_app_url ? req.body.ios_app_url : null;
            let _android_app_url = req.body.android_app_url ? req.body.android_app_url : null;
            let _deep_link = req.body.deep_link ? req.body.deep_link : null;
            let _web_url = req.body.web_url ? req.body.web_url : null;
            let _app_priority = req.body.app_priority ? req.body.app_priority : null;
            let _app_type = req.body.app_type ? req.body.app_type : null;
            let _package_name = req.body.package_name ? req.body.package_name : null;
            let _filename = req.body.filename ? req.body.filename : null;
            let _send_params = req.body.send_params ? req.body.send_params : null;
            let _islive = req.body.islive ? req.body.islive : null;
            let _top_text = req.body.top_text ? req.body.top_text : null;

            let _query;
            let errMsgType = _app_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _app_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_app_id) {

                _query = {
                    text: "INSERT INTO tbl_app(app_name,app_secret,app_code,privacy_policy,term_condition,status,created_by,created_at,callback_url,ios_app_url,android_app_url,deep_link,web_url,app_priority,app_type,package_name,filename,send_params,islive,top_text) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now(),$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING *",
                    values: [
                        _app_name, _app_secret, _app_code, _privacy_policy, _term_condition, _status, _created_by, _callback_url, _ios_app_url, _android_app_url, _deep_link, _web_url, _app_priority, _app_type, _package_name, _filename, _send_params, _islive, _top_text
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_app SET app_name=$1,app_secret=$2,app_code=$3,privacy_policy=$4,term_condition=$5, top_text=$6, status=$7,updated_by=$8,updated_at=now(),callback_url=$9,ios_app_url=$10,android_app_url=$11,deep_link=$12,web_url=$13,app_priority=$14,app_type=$15,package_name=$16,filename=$17,send_params=$18,islive=$19 WHERE app_id=$20 RETURNING *",
                    values: [
                        _app_name, _app_secret, _app_code, _privacy_policy, _term_condition, _top_text, _status, _updated_by, _callback_url, _ios_app_url, _android_app_url, _deep_link, _web_url, _app_priority, _app_type, _package_name, _filename, _send_params, _islive, _app_id
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)

                // console.log(result);

                if (result.length > 0) {
                    if (req.files != null && req.files.length > 0) {
                        // let movePath = await uploadAppIcon(req, result[0].app_id);

                        let s3Path = await services.s3.upload(req, 'app_icon');

                        let mvQuery = {
                            text: "UPDATE tbl_app set app_icon_url = $1 WHERE app_id= $2 RETURNING app_icon_url",
                            values: [
                                s3Path,
                                result[0].app_id
                            ]
                        }

                        let mvResult = await pgConnection.executeQuery('rmg_dev_db', mvQuery)

                        console.log(mvResult);

                    }
                    services.sendResponse.sendWithCode(req, res, result[0], customMsgType, successMsgType);
                } else {
                    services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
                }
            }
            catch (error) {
                console.log(error);
                services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
            }
        }

        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    },

    search: async function (req, res) {

        let _app_id = req.body.app_id ? req.body.app_id : null;
        let _app_name = req.body.app_name ? req.body.app_name : null;
        let _app_type = req.body.app_type ? req.body.app_type : null;
        let _islive = req.body.islive ? req.body.islive : null;
        let _status = req.body.status ? req.body.status : null;
        let _orderBy = req.body.orderBy ? req.body.orderBy : 'app_name';

        let _selectQuery = 'Select * From tbl_app where 1=1'

        if (_app_id) {
            _selectQuery += " and app_id = " + _app_id
        }

        if (_app_name) {
            _selectQuery += " and app_name LIKE '%" + _app_name + "%'"
        }

        if (_app_type) {
            _selectQuery += " and app_type = '" + _app_type + "'"
        }

        if (_islive) {
            _selectQuery += " and islive = " + _islive
        }

        if (_status) {
            _selectQuery += " and status = '" + _status + "'"
        }

        _selectQuery += " order by " + _orderBy;


        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            }
            else
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    addGameConf: async function (req, res) {
        let rules = {
            // "conf_id": 'required|numeric',
            "app_id": 'required|numeric',
            "level": 'required',
            "game_conf": 'required',
        };

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _conf_id = req.body.conf_id ? req.body.conf_id : null;
            let _app_id = req.body.app_id ? req.body.app_id : null;
            let _level = req.body.level ? req.body.level : null;
            let _game_conf = req.body.game_conf ? req.body.game_conf : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;

            let _query;
            let _status = 'ACTIVE';
            let errMsgType = _conf_id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _conf_id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_conf_id) {
                let chklevel = `Select * From tbl_game_conf where app_id = ${_app_id} and level = '${_level}' and status != 'REMOVE'`

                try {

                    let result = await pgConnection.executeQuery('rmg_dev_db', chklevel)

                    if (result.length > 0) {
                        services.sendResponse.sendWithCode(req, res, result, customMsgType, 'LEVEL_EXIST');
                    } else {
                        // services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
                        _query = {
                            text: "INSERT INTO tbl_game_conf(app_id,level,game_conf,created_by,created_at,status) VALUES ($1,$2,$3,$4,now(),$5) RETURNING *",
                            values: [
                                _app_id, _level, _game_conf, _created_by, _status
                            ]
                        }
                    }
                }
                catch (error) {

                    services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
                }

            }
            else {

                _query = {
                    text: "UPDATE tbl_game_conf SET conf_id=$1,app_id=$2,level=$3,game_conf=$4,updated_by=$5,updated_at=now() WHERE conf_id=$6 RETURNING *",
                    values: [
                        _conf_id, _app_id, _level, _game_conf, _updated_by, _conf_id
                    ]
                }

            }

            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)


                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result[0], customMsgType, successMsgType);
                } else {
                    services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
                }
            }
            catch (error) {

                services.sendResponse.sendWithCode(req, res, error, customMsgType, errMsgType);
            }
        }

        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    },

    searchGameConf: async function (req, res) {

        let _conf_id = req.body.conf_id ? req.body.conf_id : null;
        let _app_id = req.body.app_id ? req.body.app_id : null;

        let _selectQuery = 'Select * From tbl_game_conf where 1=1'

        if (_conf_id) {
            _selectQuery += " and conf_id = " + _conf_id
        }

        if (_app_id) {
            _selectQuery += " and app_id = " + _app_id
        }

        _selectQuery += " and status != 'REMOVE'";


        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            }
            else
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    removeGameConf: async function (req, res) {

        let _conf_id = req.body.conf_id ? req.body.conf_id : null;

        if (_conf_id) {

            let _selectQuery = `UPDATE tbl_game_conf set status = 'REMOVE' where conf_id = ${_conf_id} RETURNING *`

            try {
                let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

                if (dbResult && dbResult.length > 0) {
                    services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "REMOVE_SUCCESS");
                }
                else
                    services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "REMOVE_FAILED");
            }
            catch (error) {
                services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
            }

        } else {
            services.sendResponse.sendWithCode(req, res, 'error', customMsgTypeCM, "VALIDATION_FAILED");
        }
    },

    setAppOrder: async function (req, res) {
        // console.log(req.body);

        let appOrder = req.body.appOrder ? req.body.appOrder : null;

        let appsWithPriority = req.body.appsWithPriority ? req.body.appsWithPriority : null;

        if (appOrder) {

            let updateQueries = await getUpdateQuerie(appOrder);

            // console.log(updateQueries);

            Promise.all(updateQueries.map(async (query) => {
                return await pgConnection.executeQuery('rmg_dev_db', query);
            })).then((inresults) => {
                // console.log(inresults);
                res.send({ "ok": inresults })
            })

        } else if (appsWithPriority) {
            // console.log(appsWithPriority)
            let updateQueries = await getAppsWithPriority(appsWithPriority);
            console.log(updateQueries);

            Promise.all(updateQueries.map(async (query) => {
                return await pgConnection.executeQuery('rmg_dev_db', query);
            })).then((inresults) => {
                // console.log(inresults);
                res.send({ "ok": inresults })
            })
        }


    },

}

async function uploadAppIcon(req, app_id) {

    return new Promise((resolve, reject) => {

        let uploadFilepath = `./public/master/app/${app_id}/`;

        let object = req.files;
        for (const key in object) {
            if (object.hasOwnProperty(key)) {

                const element = object[key];

                let fromPath = element.destination + element.filename;

                let extension = path.extname(fromPath)

                if (extension.toLowerCase() == ".jpg" ||
                    extension.toLowerCase() == ".jpeg" ||
                    extension.toLowerCase() == ".png" ||
                    extension.toLowerCase() == ".gif") {

                    let movePath = uploadFilepath + element.filename;
                    movePath = movePath.toLowerCase();

                    console.log("fromPath - " + fromPath + "\n" +
                        "extension - " + extension + "\n" +
                        "movePath - " + movePath + "\n"
                    );

                    mv(fromPath, movePath, { mkdirp: true }, function (err) {

                        if (err) {
                            reject(err);
                        }
                        else
                            resolve(movePath)
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

async function getUpdateQuerie(appOrder) {

    return new Promise((resolve, reject) => {
        let updateQuerie = []

        for (let i = 0; i < appOrder.length; i++) {
            const x = appOrder[i].split("-");
            const priority = i;

            x[1] = x[1] ? x[1] : false;

            let _query = `update tbl_app set app_priority = ${priority},fixed_priority = ${x[1]} where app_id =${x[0]} RETURNING app_name,app_priority`;

            updateQuerie.push(_query)
        }

        resolve(updateQuerie)
    });
}


async function getAppsWithPriority(appsWithPriority) {

    return new Promise((resolve, reject) => {
        let updateQuerie = []

        for (const x of appsWithPriority) {
            // console.log(x.app_id,x.app_priority,x.fixed_priority);
            let _query = `update tbl_app set app_priority = ${x.app_priority},fixed_priority = ${x.fixed_priority} where app_id = ${x.app_id} RETURNING app_name,app_priority`;

            updateQuerie.push(_query)
        }

        resolve(updateQuerie)
    });
}

async function getbulkUpdateGameConfQueries(selectedGamesId, level) {

    return new Promise((resolve, reject) => {
        let updateQueries = []

        for (let i = 0; i < selectedGamesId.length; i++) {
            const app_id = selectedGamesId[i];

            let _query = `update tbl_contest set game_conf = tbl_game_conf.game_conf from tbl_game_conf where tbl_contest.app_id = tbl_game_conf.app_id and tbl_contest.app_id = ${app_id} and tbl_game_conf.level = '${level}' AND start_date > now() RETURNING tbl_contest.app_id,contest_id;`;

            updateQueries.push(_query)
        }

        resolve(updateQueries)
    });
}

async function getbulkUpdateGameConfMasterQueries(selectedGamesId, level) {

    return new Promise((resolve, reject) => {
        let updateQueries = []

        for (let i = 0; i < selectedGamesId.length; i++) {
            const app_id = selectedGamesId[i];

            let _query = `update tbl_contest_master set game_conf = tbl_game_conf.game_conf from tbl_game_conf where tbl_contest_master.app_id = tbl_game_conf.app_id and tbl_contest_master.app_id = ${app_id} and tbl_game_conf.level = '${level}' RETURNING tbl_contest_master.app_id,contest_master_id;`;

            updateQueries.push(_query)
        }

        resolve(updateQueries)
    });
}