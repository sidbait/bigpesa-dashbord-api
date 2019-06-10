var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/scratchCard/scratchCampaignPrizesDetailsController');


appRoutes.post('/addScratchCampaignPrizesDetails', appController.addScratchCampaignPrizesDetails);
appRoutes.post('/getPrizeCount', appController.getPrizeCount);
appRoutes.post('/getPrizeDetails', appController.getPrizeDetails);
appRoutes.post('/addPrizeDetails', appController.addPrizeDetails);

module.exports = appRoutes;