const apiRoutes = express.Router();

//scratchCard routes

apiRoutes.use(require('./scratchBannerRoute'));
apiRoutes.use(require('./scratchBannerDetailsRoute'));
apiRoutes.use(require('./scratchCampaignRoute'));
apiRoutes.use(require('./scratchCampaignDetailsRoute'));
apiRoutes.use(require('./scratchEventRoute'));
apiRoutes.use(require('./scratchPrizeRoute'));
apiRoutes.use(require('./scratchPrizeDetailsRoute'));
apiRoutes.use(require('./scratchWinnerRoute'));
apiRoutes.use(require('./scratchReportRoute'));
apiRoutes.use(require('./scratchCampaignPrizesDetailsRoute'));

module.exports = apiRoutes;