const apiRoutes = express.Router();

//master routes

apiRoutes.use(require('./appRoute'));
apiRoutes.use(require('./contestRoute'));
apiRoutes.use(require('./rankRoute'));
apiRoutes.use(require('./spinBonusRoute'));
apiRoutes.use(require('./eventRoute'));
apiRoutes.use(require('./visitBonusRoute'));
apiRoutes.use(require('./bannerRoute'));
apiRoutes.use(require('./topWinnerRoute'));
apiRoutes.use(require('./appVersionRoute'));
apiRoutes.use(require('./feedbackRoute'));
apiRoutes.use(require('./playerRoute'));

module.exports = apiRoutes;
