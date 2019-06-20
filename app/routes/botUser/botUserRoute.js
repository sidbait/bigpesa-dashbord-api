var botUserRoutes = express.Router();

var validate = require('../../auth/validate');

var botUserController = require('../../controller/botUser/botUserController');

botUserRoutes.get('/getBots', botUserController.getBots);
botUserRoutes.post('/getLiveContests', botUserController.getLiveContests);
botUserRoutes.post('/updateScore', botUserController.updateScore);
botUserRoutes.post('/getScoreBoard', botUserController.getScoreBoard);
botUserRoutes.post('/searchPlayer', botUserController.searchPlayer);
botUserRoutes.post('/addNewBot', botUserController.addNewBot);
botUserRoutes.post('/getOldContests', botUserController.getOldContests);
botUserRoutes.post('/chkCanAdd', botUserController.chkCanAdd);
botUserRoutes.post('/getProfile', botUserController.getProfile);
botUserRoutes.post('/updateProfile', botUserController.updateProfile);



module.exports = botUserRoutes;