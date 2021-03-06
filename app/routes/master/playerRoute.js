var appRoutes = express.Router();
var playerController = require('../../controller/master/playerController');

appRoutes.post('/player/refundplayer', playerController.refundPlayer);
appRoutes.post('/player/getpendingrefund', playerController.getPending); 
appRoutes.post('/player/getpendingplayerList', playerController.getPendingPlayerList);
appRoutes.post('/player/playerrejectpproved', playerController.playerRejectApproved);
appRoutes.post('/player/refundarejectpproved', playerController.refundRejectApproved);
appRoutes.post('/player/unblockplayer', playerController.unblockPlayer);
appRoutes.post('/player/updateplayerstatus', playerController.updatePlayerStatus);
appRoutes.post('/player/getotp', playerController.getOTP);

module.exports = appRoutes;