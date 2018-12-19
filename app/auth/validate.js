const config = require('config');
const logger = require('tracer').colorConsole();
const jwt = require('jsonwebtoken');

const services = require('../service/service.js');

module.exports = {

    validateAccessToken: function (req, res, next) {

        let rules = {
            "access-token": 'required',
        };

        let custom_message = {
            "required.access-token": "Please provide the Access Token!",
        }

        let validation = new services.validator(req.headers, rules, custom_message);

        if (validation.passes()) {

            var accessToken = req.headers["access-token"] ? req.headers["access-token"] : {};

            jwt.verify(accessToken, config.jwt_sessions.private_key,
                function (err, decoded) {
                    if (err) {
                        services.sendResponse.sendWithCode(req, res, null, "COMMON_MESSAGE", "INVALID_ACCESS_TOKEN");
                    } else {
                        req.userDetails = decoded;
                        return next();
                    }
                });
        }
        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, "COMMON_MESSAGE", "VALIDATION_FAILED");
        }
    },

    validateAppSecret: function (req, res, next) {

        let rules = {
            "app-secret-key": 'required',
        };

        let custom_message = {
            "required.app-secret-key": "Please provide the App Secret Key!",
        }

        let validation = new services.validator(req.headers, rules, custom_message);

        if (validation.passes()) {

            var appSecretKey = req.headers["app-secret-key"]?req.headers["app-secret-key"]:'';

            if (config.app.app_key !== appSecretKey) {
                services.sendResponse.sendWithCode(req, res, null, "COMMON_MESSAGE", "INVALID_APP_SECRET_KEY");
            } else {
                return next();
            }
        }
        else {
            services.sendResponse.sendWithCode(req, res, validation.errors.errors, "COMMON_MESSAGE", "VALIDATION_FAILED");
        }
    }
}