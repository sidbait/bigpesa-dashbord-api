const apiRoutes = express.Router();

//master routes

apiRoutes.use(require('./appRoute'));
apiRoutes.use(require('./rankRoute'));

apiRoutes.use(require('./countryRoute'));
apiRoutes.use(require('./operatorRoute'));
apiRoutes.use(require('./regionRoute'));
apiRoutes.use(require('./languageRoute'));
apiRoutes.use(require('./usertypeRoute'));
apiRoutes.use(require('./partnerRoute'));
apiRoutes.use(require('./menuRoute'));
apiRoutes.use(require('./rcoRoute'));

module.exports = apiRoutes;
