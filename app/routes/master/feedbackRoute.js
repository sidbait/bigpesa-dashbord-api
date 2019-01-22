var appRoutes = express.Router(); 
var feedbackController = require('../../controller/master/feedbackController');

appRoutes.get('/feedback',feedbackController.getAll);
appRoutes.post('/feedback/search',feedbackController.search);
appRoutes.post('/feedback/update',feedbackController.update);
appRoutes.get('/feedback/pendingcount',feedbackController.pendingcount);

module.exports = appRoutes;