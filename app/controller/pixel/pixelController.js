const pgConnection = require('../../model/pgConnection');
const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getpixelReport: async function (req, res) {

        let fromDate = req.body.frmdate;
        let toDate = req.body.todate;
        let source = req.body.source ? req.body.source : '';

        let _selectQuery = 'select source, event_name, count(1), status, created_at::DATE from tbl_pixel_fire_log where 1=1'

        if (fromDate && toDate) {
            _selectQuery += ` and (created_at + (330 * '1m'::interval))::date between '${fromDate}' and '${toDate}'`
        }
        if (source) {
            _selectQuery += ` AND source = '${source}'`
        }

        _selectQuery += "  group by source, event_name, created_at::DATE, status order by created_at desc; ";


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

    getPixelConfiguration: async function (req, res) {

        let id = req.body.id;
        let source = req.body.source;
        let event_type = req.body.event_type;

        let _selectQuery = 'select * from tbl_pixel_master where 1=1'

        if (source) {
            _selectQuery += ` AND source = '${source}'`
        }

        if (id) {
            _selectQuery += ` AND id = '${id}'`
        }

        if (event_type) {
            _selectQuery += ` AND event_type = '${event_type}'`
        }


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

    add: async (req, res) => {

        let rules = {
            "source": 'required',
            "pixel_url": 'required',
            "event_type": 'required',
            "pixel_block": 'required',
            "status": 'required|in:ACTIVE,DEACTIVE,PENDING',
        };

        let validation = new services.validator(req.body, rules);

        console.log(req.body);
        

        if (validation.passes()) {

            let _id = req.body.id;
            let _source = req.body.source ? req.body.source : null;
            let _pixel_url = req.body.pixel_url ? req.body.pixel_url : null;
            let _event_type = req.body.event_type ? req.body.event_type : null;
            let _pixel_block = req.body.pixel_block ? req.body.pixel_block : null;
            let _status = req.body.status ? req.body.status : null;
            let _created_by = req.body.userid ? req.body.userid : null;
            let _updated_by = req.body.userid ? req.body.userid : null;
            
            let _query;
            let errMsgType = _id ? 'UPDATE_FAILED' : 'ADD_FAILED'
            let successMsgType = _id ? 'UPDATE_SUCCESS' : 'ADD_SUCCESS'

            if (!_id) {

                _query = {
                    text: "INSERT INTO tbl_pixel_master(source,pixel_url,event_type,pixel_block,status,created_by,created_at) VALUES ($1,$2,$3,$4,$5,$6,now()) RETURNING *",
                    values: [
                        _source.toLowerCase(), _pixel_url, _event_type, _pixel_block, _status, _created_by
                    ]
                }
            }
            else {

                _query = {
                    text: "UPDATE tbl_pixel_master SET source=$1,pixel_url=$2,event_type=$3,pixel_block=$4,status=$5,updated_by=$6,updated_at=now() WHERE id=$7 RETURNING *",
                    values: [
                        _source.toLowerCase(), _pixel_url, _event_type, _pixel_block, _status, _updated_by, _id
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
    }



}
