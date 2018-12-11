
//require('rootpath')();
//require('express-group-routes');
const middleware = require('express-inject-middleware');

const app = express();
const sendResponse = require('../service/sendResponse');
const validate = require('../auth/validate');

const apiRoutes = express.Router();
const apiRoutes_user = express.Router();
const apiRoutes_login = express.Router();

//Login/Register Routes
const loginRoute = require('../routes/loginRoute');

//Module Wise Routes
const masterRoutes = require('../routes/master/masterRoutes.js');
const contestRoutes = require('../routes/contest/contestRoute.js');

apiRoutes.get('/', function (req, res) {
    sendResponse.sendWithCode(req, res, null, "COMMON_MESSAGE", "WELCOME");
});

app.use(middleware.injectMiddleware(
    [
        validate.validateAppSecret,
        validate.validateAccessToken,
    ],
    [
        apiRoutes_user.use('/master', masterRoutes),
        apiRoutes_user.use('/contest', contestRoutes)
    ]
));

app.use(middleware.injectMiddleware(
    [
        validate.validateAppSecret
    ],
    [
        apiRoutes_login.use(loginRoute)
    ]
));

app.use(apiRoutes)
app.use(apiRoutes_login)
app.use(apiRoutes_user)

module.exports = app;

