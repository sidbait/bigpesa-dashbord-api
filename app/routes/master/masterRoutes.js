const apiRoutes = express.Router();

//master routes

apiRoutes.use(require('./appRoute'));
apiRoutes.use(require('./contestRoute'));
apiRoutes.use(require('./rankRoute'));
apiRoutes.use(require('./spinBonusRoute'));
apiRoutes.use(require('./eventRoute'));
apiRoutes.use(require('./topWinnerRoute'));
apiRoutes.use(require('./appVersionRoute'));
apiRoutes.use(require('./feedbackRoute'));

module.exports = apiRoutes;
