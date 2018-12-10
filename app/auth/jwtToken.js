var jwt = require('jsonwebtoken');

module.exports = {

    generateToken: function (userDetails) {

        var claims = {
            sub: 'authentication',
            iss: 'http://nazara.com',
            permissions: 'all',
            identity: {
                source: 'NAZARA-CMS',
                userId: userDetails.userid,
                emailId: userDetails.emailid,
                userTypeId: userDetails.usertypeid,
                userType:userDetails.usertype,
                date: new Date()
            }
        };

        var token = jwt.sign({ exp: Math.floor(Date.now() / 1000) + config.jwt_sessions.expires_in, data: claims }, config.jwt_sessions.private_key);

        return token;
    }
}; 