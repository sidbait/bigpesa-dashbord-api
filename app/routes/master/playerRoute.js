var appRoutes = express.Router();
var playerController = require('../../controller/master/playerController');

appRoutes.post('/player/refundplayer', playerController.refundPlayer);
appRoutes.post('/player/getpendingrefund', playerController.getPending); appRoutes.post('/player/refundapproved', playerController.refundApproved);
appRoutes.post('/player/unblockplayer', playerController.unblockPlayer);
appRoutes.post('/player/updateplayerstatus', playerController.updatePlayerStatus);
appRoutes.post('/player/getotp', playerController.getOTP);

module.exports = appRoutes;