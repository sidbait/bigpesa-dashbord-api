var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/scratchCard/scratchCampaignDetailsController');


appRoutes.post('/scratchCampaignDetails/getCampEvent', appController.getCampEvent);
appRoutes.post('/scratchCampaignDetails/mapCampEventStatus', appController.mapCampEventStatus);

module.exports = appRoutes;