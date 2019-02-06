var appRoutes = express.Router(); 
var playerController = require('../../controller/master/playerController');

appRoutes.post('/player/refundplayer',  playerController.refundPlayer);

module.exports = appRoutes;