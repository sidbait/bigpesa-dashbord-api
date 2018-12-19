const apiRoutes = express.Router();

//master routes

apiRoutes.use(require('./appRoute'));
apiRoutes.use(require('./contestRoute'));
apiRoutes.use(require('./rankRoute'));
apiRoutes.use(require('./spinBonusRoute'));
apiRoutes.use(require('./eventRoute'));

module.exports = apiRoutes;
