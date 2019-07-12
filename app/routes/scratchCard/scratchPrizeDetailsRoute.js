var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/scratchCard/scratchPrizeDetailsController');

appRoutes.post('/scratchprizedetails/getCampPrize', appController.getCampPrize);
appRoutes.post('/scratchprizedetails/mapCampPrizeStatus', appController.mapCampPrizeStatus);

module.exports = appRoutes;