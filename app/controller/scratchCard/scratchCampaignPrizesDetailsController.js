const mv = require('mv');
const excelToJson = require('convert-excel-to-json');
const pgConnection = require('../../model/pgConnection');

const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {


    addScratchCampaignPrizesDetails: async function (req, res) {

        let rules = {
            "camp_id": 'required'
        };

        let obj = req.body
        // deleting null value from req.body
        Object.keys(obj).forEach(k => (obj[k] === 'null') && delete obj[k]);

        let validation = new services.validator(req.body, rules);

        if (validation.passes()) {

            let _camp_id = req.body.camp_id ? req.body.camp_id : null;
            let uploadFilepath = `./public/bulk/ScratchCampaignPrizesDetails/${_camp_id}/`;

            if (req.files != null && req.files.length > 0) {
                let from_path = req.files[0].destination + req.files[0].filename;
                let splt = req.files[0].originalname.split('.');
                let ext = splt[splt.length - 1];

                if (ext.toLowerCase() == "xlsx") {
                    let dest_path = Date.now() + '_' + req.files[0].originalname;
                    let moveto = uploadFilepath + dest_path;
                    moveto = moveto.toLowerCase();

                    try {
                        const xlsxFilePath = await moveFile(from_path, moveto)
                        // console.log(xlsxFilePath);

                        const sheetData = await readSheet(xlsxFilePath)
                        // console.log(sheetData);

                        const sheetDataCounts = await countSheetData(sheetData, 'prize_id')
                        console.log(sheetDataCounts);

                        let queryDbCounts = `select prize_id,prize_count from tbl_scratch_campaign_prizes where camp_id = ${_camp_id}`;
                        const dbCounts = await pgConnection.executeQuery('rmg_dev_db', queryDbCounts);
                        console.log(dbCounts);

                        let queryExistingDbCounts = `select prize_id,count(prize_id) from tbl_scratch_campaign_prizes_details where camp_id = ${_camp_id} group by prize_id`;
                        const existingDbCounts = await pgConnection.executeQuery('rmg_dev_db', queryExistingDbCounts);
                        console.log(existingDbCounts);

                        let prize_ids = await validateData(dbCounts, existingDbCounts, sheetDataCounts)

                        // console.log(prize_ids);

                        let output = await insertData(prize_ids, sheetData);


                        services.sendResponse.sendWithCode(req, res, prize_ids, customMsgType, "ADD_SUCCESS");



                    } catch (error) {
                        console.log(error);
                        services.sendResponse.sendWithCode(req, res, error, customMsgType, "ADD_FAILED");
                    }

                } else {
                    console.log('Validation failed! Please provide proper xlsx file.');
                    services.sendResponse.sendWithCode(req, res, 'Validation failed! Please provide proper xlsx file.', customMsgType, "ADD_FAILED");

                }
            } else {
                services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

            }
        }

        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    },

    getPrizeCount: async (req, res) => {

        let _camp_id = req.body.camp_id ? req.body.camp_id : null;
        let _selectQuery = `select id,camp_id,scp.prize_id,prize_count,scp.status,spm.prize_description from tbl_scratch_campaign_prizes scp
        join tbl_scratch_prize_master spm on scp.prize_id = spm.prize_id
        where camp_id = ${_camp_id}`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    getPrizeDetails: async (req, res) => {

        let _id = req.body.id ? req.body.id : null;
        let _selectQuery = `select id,camp_id,scp.prize_id,prize_count,scp.status,spm.prize_description from tbl_scratch_campaign_prizes scp
        join tbl_scratch_prize_master spm on scp.prize_id = spm.prize_id where id = ${_id}`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    },

    addPrizeDetails: async (req, res) => {
        let _id = req.body.id ? req.body.id : null;
        let _prize_count = req.body.prize_count ? req.body.prize_count : null;

        let _selectQuery = `update tbl_scratch_campaign_prizes set prize_count = ${_prize_count} where id = ${_id} returning id`;

        try {
            let dbResult = await pgConnection.executeQuery('rmg_dev_db', _selectQuery)

            if (dbResult && dbResult.length > 0) {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_SUCCESS");
            } else {
                services.sendResponse.sendWithCode(req, res, dbResult, customMsgType, "GET_FAILED");
            }
        }
        catch (error) {
            services.sendResponse.sendWithCode(req, res, error, customMsgTypeCM, "DB_ERROR");
        }
    }


}


function moveFile(from_path, moveto) {
    return new Promise((resolve, reject) => {
        mv(from_path, moveto, { mkdirp: true }, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(moveto)
            }
        });
    });
}

function readSheet(xlsxFilePath) {
    return new Promise((resolve, reject) => {
        try {
            const result = excelToJson({
                sourceFile: xlsxFilePath,
                sheets: [{
                    name: 'Prize_Master',
                    columnToKey: {
                        A: 'camp_id',
                        B: 'prize_id',
                        C: 'prize_type',
                        D: 'from_date',
                        E: 'to_date',
                        F: 'is_win',
                        G: 'is_credited',
                        H: 'is_claim',
                        I: 'status',
                        J: 'amount'
                    }
                }],
                header: {
                    rows: 1 // 2, 3, 4, etc.
                }
            });
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
}

function mapToProp(data, prop) {
    return data
        .reduce((res, item) => Object
            .assign(res, {
                [item[prop]]: 1 + (res[item[prop]] || 0)
            }), Object.create(null))
        ;
}

function countSheetData(sheetData, prop) {
    return new Promise((resolve, reject) => {
        try {
            for (const key in sheetData) {
                if (sheetData.hasOwnProperty(key)) {
                    const element = sheetData[key];
                    // console.log(element);

                    let result = mapToProp(element, prop)

                    resolve(result);
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}

function validateData(dbCounts, existingDbCounts, sheetDataCounts) {
    console.log('inside validateData');

    return new Promise((resolve, reject) => {
        try {
            // dbCounts - existingDbCounts = sheetDataCounts
            let finalData = {};

            Promise.all(
                dbCounts.map(async a => {
                    if (existingDbCounts.length > 0) {
                        existingDbCounts.map(async b => {
                            if (a.prize_id == b.prize_id) {
                                let result = a.prize_count - b.count;
                                console.log(a.prize_id, a.prize_count, b.count, result);
                                finalData[a.prize_id] = result;
                            }
                        })
                    } else {
                        finalData[a.prize_id] = a.prize_count;
                    }
                })
            ).then(x => {
                var promises = [];

                console.log('validateData 2');

                for (const key in finalData) {
                    for (const xkey in sheetDataCounts) {

                        if (key == xkey) {
                            console.log('validateData 2 key match');

                            promises.push(chkIDs(key, finalData[key], sheetDataCounts[xkey]));
                        }
                    }
                }


                function chkIDs(key, a, b) {
                    if (a == b) {
                        console.log(`{ prize_id: ${key}, match: true }`);

                        return { prize_id: key, match: true }
                    } else {
                        console.log(`{ prize_id: ${key}, match: false }`);
                        return { prize_id: key, match: false }
                    }
                }

                Promise.all(promises).then((data) => {
                    resolve(data);
                }, (error) => {
                    return error;
                });
            })

        } catch (error) {
            reject(error);
        }
    });
}

async function insertData(prize_ids, sheetData) {
    for (const key in prize_ids) {
        if (prize_ids.hasOwnProperty(key)) {
            const element = prize_ids[key];

            try {
                if (element.match) {
                    console.log(element.match, element.prize_id);

                    // insert data for element.prize_id from sheet

                    let queries = await getQueriesData(sheetData, element.prize_id);

                    Promise.all(queries.map(async (query) => {
                        if (query != false) {
                            // return await pgConnection.executeQuery('rmg_dev_db', query);
                            let data = {
                                type: 'executeQueryKue',
                                query: query
                            }
                            services.kue.createkue('executeQueryKue', data)
                        }
                    }))

                }
            } catch (error) {
                console.log(error);

            }
        }
    }
}

function getQueriesData(sheetData, prize_id) {

    return new Promise((resolve, reject) => {
        if (sheetData && sheetData.Prize_Master) {
            let queries = sheetData.Prize_Master.map(object => {

                if (object['prize_id'] == prize_id) {
                    let count = 0;
                    let cols = [];
                    let values = [];
                    let dollcount = []

                    for (const key in object) {


                        const element = object[key];

                        cols.push(key)

                        values.push(element)
                        count = count + 1;

                        dollcount.push(`$${count}`)

                    }

                    query = {
                        text: `INSERT INTO tbl_scratch_campaign_prizes_details(${cols.toString()}) VALUES (${dollcount}) RETURNING id`,
                        values: values
                    }

                    return query;
                } else {
                    return false;
                }


            })

            resolve(queries)
        } else {
            reject('wrong sheetData or sheet name')
        }
    });
}