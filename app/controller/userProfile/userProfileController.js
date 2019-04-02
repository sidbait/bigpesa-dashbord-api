const pgConnection = require('../../model/pgConnection');
const services = require('../../service/service');

const customMsgType = "MASTER_MESSAGE";
const customMsgTypeCM = "COMMON_MESSAGE";

module.exports = {

    getUserDetails: async function (req, res) {

        let user_id = req.body.userId;

        let _selectQuery = 'select * from tbl_user where 1=1'

        if (user_id) {
            _selectQuery += ` AND user_id = '${user_id}'`
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

    updateUserDetails: async (req, res) => {

        let rules = {
            "fullname": 'required',
            "email": 'required',
            "user_id": 'required',
        };

        let validation = new services.validator(req.body, rules);

        console.log(req.body);


        if (validation.passes()) {

            let user_id = req.body.user_id;
            let fullname = req.body.fullname ? req.body.fullname : null;
            let email = req.body.email ? req.body.email : null;

            let _query = {
                text: "UPDATE tbl_user SET fullname=$1,email=$2,updated_by=$3,updated_at=now() WHERE user_id=$3 RETURNING *",
                values: [
                    fullname, email, user_id
                ]
            }



            try {

                let result = await pgConnection.executeQuery('rmg_dev_db', _query)


                if (result.length > 0) {
                    services.sendResponse.sendWithCode(req, res, result[0], customMsgType, 'UPDATE_SUCCESS');
                } else {
                    services.sendResponse.sendWithCode(req, res, error, customMsgType, 'UPDATE_FAILED');
                }
            }
            catch (error) {

                services.sendResponse.sendWithCode(req, res, error, customMsgType, 'UPDATE_FAILED');
            }
        }

        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, customMsgTypeCM, "VALIDATION_FAILED");

        }
    }



}
