var appRoutes = express.Router(); 
var playerReports = require('../../controller/reports/playerReports');

appRoutes.post('/playerreport',  playerReports.playerReport);
appRoutes.post('/playercontestjoined',  playerReports.playerContestJoinedReport);
appRoutes.post('/playercontestwin',  playerReports.playerContestWinReport);
appRoutes.post('/playercontestsummary',  playerReports.playerContestSummary);
appRoutes.post('/playerwallettransaction',  playerReports.walletTransactionReport);
appRoutes.post('/playerbonustransaction',  playerReports.bonusTransactionReport);
appRoutes.post('/playerwithdrawdeposittransaction',  playerReports.withdrawDepositTransactionReport);
appRoutes.post('/gettransactiondetails',  playerReports.getTransactionDetails);
appRoutes.post('/playercontestreport',  playerReports.playerContestReport);
appRoutes.post('/playerfeedbackreport',  playerReports.playerFeedbackReport);
appRoutes.get('/activeplayerdata',  playerReports.activePlayerData);
appRoutes.get('/inactiveplayerdata',  playerReports.inActivePlayerData);
appRoutes.get('/verifiedplayerdata',  playerReports.verifiedPlayerData);
appRoutes.get('/notverifiedplayerdata',  playerReports.notVerifiedPlayerData);
appRoutes.get('/withdrawreport',  playerReports.withdrawReport);
appRoutes.get('/verifiedbutnotplayedplayerdata',  playerReports.verifiedButNotPlayedPlayerData);
appRoutes.post('/bulksmsnotification',  playerReports.bulkSMSNotification);
appRoutes.post('/pushnotification',  playerReports.pushNotification);
appRoutes.post('/getwalletbalancelog',playerReports.getWalletBalanceLog);
appRoutes.get('/getrefundlist', playerReports.getRefundList);
module.exports = appRoutes;