var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/scratchCard/scratchBannerDetailsController');

appRoutes.post('/scratchbannerDetails/getCampBanner', appController.getCampBanner);
appRoutes.post('/scratchbannerDetails/mapCampBannerStatus', appController.mapCampBannerStatus);

module.exports = appRoutes;