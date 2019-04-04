var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/master/appController');

appRoutes.get('/app', function(req, res)
{
    appController.getAll(req, res);
});

appRoutes.post('/app/add', function(req, res)
{ 
    appController.add(req, res);
});

appRoutes.post('/app/update', function(req, res)
{
    appController.add(req, res);
});

appRoutes.post('/app/search', function(req, res)
{
    appController.search(req, res);
});

appRoutes.post('/app/addGameConf', appController.addGameConf);
appRoutes.post('/app/searchGameConf', appController.searchGameConf);
appRoutes.post('/app/removeGameConf', appController.removeGameConf);
appRoutes.post('/app/setAppOrder', appController.setAppOrder);
module.exports = appRoutes;