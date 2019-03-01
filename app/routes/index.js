
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
const masterRoutes = require('../routes/master/masterRoutes');
const contestReportRoute = require('../routes/reports/contestReportRoute');
const contestRoutes = require('../routes/contest/contestRoute');
const rankRoutes = require('../routes/rank/rankRoute');
const userRoutes = require('../routes/users/userRoute');
const roleRoutes = require('../routes/users/roleRoute');
const dashboardRoutes = require('../routes/dashboard/dashboardRoute');
const playerReportRoute = require('../routes/reports/playerReportRoute');
const menuRoutes = require('../routes/menu/menuRoute');

apiRoutes.get('/', function (req, res) {
    sendResponse.sendWithCode(req, res, null, "COMMON_MESSAGE", "WELCOME");
});

app.use(middleware.injectMiddleware(
    [
       // validate.validateAppSecret,
       // validate.validateAccessToken,
    ],
    [
        apiRoutes_user.use('/master', masterRoutes),
        apiRoutes_user.use('/contest', contestRoutes),
        apiRoutes_user.use('/rank', rankRoutes),
        apiRoutes_user.use('/user', userRoutes),
        apiRoutes_user.use('/role', roleRoutes),
        apiRoutes_user.use('/dashboard', dashboardRoutes),
        apiRoutes_user.use('/menu', menuRoutes)
    ]
));
app.use(middleware.injectMiddleware(
    [
       // validate.validateAccessToken
    ],
    [
        apiRoutes_user.use('/reports', [contestReportRoute, playerReportRoute])
    ]
));

app.use(middleware.injectMiddleware(
    [
        // validate.validateAppSecret
    ],
    [
        apiRoutes_login.use(loginRoute)
    ]
));

app.use(apiRoutes)
app.use(apiRoutes_login)
app.use(apiRoutes_user)

module.exports = app;

