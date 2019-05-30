const apiRoutes = express.Router();

//scratchCard routes

apiRoutes.use(require('./scratchBannerRoute'));
apiRoutes.use(require('./scratchCampaignRoute'));
apiRoutes.use(require('./scratchEventRoute'));
apiRoutes.use(require('./scratchPrizeRoute'));

module.exports = apiRoutes;