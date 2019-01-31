var appRoutes = express.Router(); 
var playerReports = require('../../controller/reports/playerReports');

appRoutes.post('/playerreport',  playerReports.playerReport);
appRoutes.post('/playercontestjoined',  playerReports.playerContestJoinedReport);
appRoutes.post('/playercontestwin',  playerReports.playerContestWinReport);
appRoutes.post('/playerwallettransaction',  playerReports.walletTransactionReport);
appRoutes.post('/playerwithdrawdeposittransaction',  playerReports.withdrawDepositTransactionReport);
appRoutes.post('/playercontestreport',  playerReports.playerContestReport);
appRoutes.post('/playerfeedbackreport',  playerReports.playerFeedbackReport);
appRoutes.get('/activeplayerdata',  playerReports.activePlayerData);
appRoutes.get('/inactiveplayerdata',  playerReports.inActivePlayerData);
appRoutes.get('/verifiedplayerdata',  playerReports.verifiedPlayerData);
appRoutes.get('/verifiedbutnotplayedplayerdata',  playerReports.verifiedButNotPlayedPlayerData);
appRoutes.post('/bulksmsnotification',  playerReports.bulkSMSNotification);
module.exports = appRoutes;