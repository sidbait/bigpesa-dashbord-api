const config = require('config');
const logger = require('tracer').colorConsole();
const jwt = require('jsonwebtoken');

var sendResp = require('../service/sendResponse');

module.exports = {

    validateAccessToken: function (req, res, next) {

        var accessToken = req.headers["access-token"];
        return next();
        // if (accessToken == null || accessToken == undefined || accessToken == '') {
        //     sendResp.sendCustomJSON(null, req, res, false, [], "Please provide access-token!", 400)
        // }
        // else {

        //     jwt.verify(accessToken, config.jwt_sessions.private_key, 
        //         function (err, decoded) {
        //         if (err) {
        //             sendResp.sendCustomJSON(null, req, res, false, [], "Access token expired. Please login again!", 402)
        //         } else {
        //             req.userDetails = decoded;
        //             return next();
        //         }
        //     });            
        // }
    },

    validateAppSecret: function (req, res, next) {

        var appSecretKey = req.headers["app-secret-key"];
        return next();
        // if (appSecretKey == null || appSecretKey == undefined || appSecretKey == '') {
        //     sendResp.sendCustomJSON(null, req, res, false, [], "Please provide app-secret-key!", 400)
        // }
        // else if (config.app.app_key !== appSecretKey) {
        //     sendResp.sendCustomJSON(null, req, res, false, [], "Invalid app-secret-key!", 401)
        // } else {
        //     return next();
        // }
    }
}