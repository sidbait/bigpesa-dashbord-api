var appRoutes = express.Router(); 
var contestReports = require('../../controller/reports/contestReports');

appRoutes.post('/contest',  contestReports.contestReport); 
appRoutes.post('/registered',contestReports.registered);
appRoutes.post('/userAcquisitionSummary',contestReports.userAcquisitionSummary);
appRoutes.post('/userAcquisitionDetail',contestReports.userAcquisitionDetail);
module.exports = appRoutes;