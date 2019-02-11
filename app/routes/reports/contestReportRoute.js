var appRoutes = express.Router(); 
var contestReports = require('../../controller/reports/contestReports');

appRoutes.post('/contest',  contestReports.contestReport);
appRoutes.post('/contestsummary',  contestReports.contestSummaryReport); 
appRoutes.post('/registered',contestReports.registered);
appRoutes.post('/userAcquisitionSummary',contestReports.userAcquisitionSummary);
appRoutes.post('/userAcquisitionDetail',contestReports.userAcquisitionDetail);
appRoutes.post('/Summary',contestReports.summary);
appRoutes.post('/dashboard',contestReports.dashboardReport);
appRoutes.post('/userfunnelsummary',contestReports.userFunnelSummary);
appRoutes.post('/downloadsummary',contestReports.downloadSummary);
appRoutes.post('/cashreport',contestReports.cashReport);
appRoutes.post('/paymentgatewayreport',contestReports.paymentgatewayReport);
appRoutes.post('/paymentgatewaydetailreport',contestReports.paymentgatewayDetailReport);
appRoutes.post('/topgamesummary',contestReports.topGameSummary);
appRoutes.post('/Hourly',contestReports.HourlyReport);
module.exports = appRoutes;