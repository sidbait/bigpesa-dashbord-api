var jwt = require('jsonwebtoken');
const config = require('config');

module.exports = {

    generateToken: function (userDetails) {

        var claims = {
            sub: 'authentication',
            iss: 'http://bigpesa.com',
            permissions: 'all',
            identity: {
                source: 'bigpesa-CMS',
                userId: userDetails.user_id,
                emailId: userDetails.email,
                userTypeId: userDetails.role_id,
                userType: userDetails.role_title,
                date: new Date()
            }
        };

        var token = jwt.sign({ exp: Math.floor(Date.now() / 1000) + config.jwt_sessions.expires_in, data: claims }, config.jwt_sessions.private_key);

        return token;
    }
}; 