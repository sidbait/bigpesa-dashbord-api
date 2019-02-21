var appRoutes = express.Router();
var playerController = require('../../controller/master/playerController');

appRoutes.post('/player/refundplayer', playerController.refundPlayer);
appRoutes.post('/player/getpendingrefund', playerController.getPending); appRoutes.post('/player/refundapproved', playerController.refundApproved);
appRoutes.post('/player/unblockplayer', playerController.unblockPlayer);

module.exports = appRoutes;