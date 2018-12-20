var appRoutes = express.Router(); 
var contestReports = require('../../controller/reports/contestReports');

appRoutes.post('/contest',  contestReports.contestReport); 
appRoutes.post('/registered',contestReports.registered);
appRoutes.post('/userAcquisitionSummary',contestReports.userAcquisitionSummary);
appRoutes.post('/userAcquisitionDetail',contestReports.userAcquisitionDetail);
appRoutes.post('/Summary',contestReports.summary);
appRoutes.post('/dashboard',contestReports.dashboardReport);
module.exports = appRoutes;