var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/scratchCard/scratchReportController');


appRoutes.get('/scratchsummary', appController.getScratchSummary);
appRoutes.get('/scratchwonreport', appController.scratchWonReport);
//appRoutes.post('/scratchwondetailreport', appController.scratchWonDetailReport);
//appRoutes.post('/scratchsearchreport', appController.scratchSearchReport);

module.exports = appRoutes;