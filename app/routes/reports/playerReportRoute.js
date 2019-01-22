var appRoutes = express.Router(); 
var playerReports = require('../../controller/reports/playerReports');

appRoutes.post('/playerreport',  playerReports.playerReport);
appRoutes.post('/playercontestjoined',  playerReports.playerContestJoinedReport);
appRoutes.post('/playercontestwin',  playerReports.playerContestWinReport);
appRoutes.post('/playerwallettransaction',  playerReports.walletTransactionReport);
appRoutes.post('/playerfeedbackreport',  playerReports.playerFeedbackReport);
appRoutes.get('/verfiedplayerdata',  playerReports.verfiedPlayerData);

module.exports = appRoutes;