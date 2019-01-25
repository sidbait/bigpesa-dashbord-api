var appVersionRoutes = express.Router();

var validate = require('../../auth/validate');

var appVersionController = require('../../controller/master/appVersionController');

appVersionRoutes.get('/appVersion', function(req, res)
{
    appVersionController.getAll(req, res);
});

appVersionRoutes.post('/appVersion/add', function(req, res)
{ 
    appVersionController.add(req, res);
});

appVersionRoutes.post('/appVersion/update', function(req, res)
{
    appVersionController.add(req, res);
});

appVersionRoutes.post('/appVersion/search', function(req, res)
{
    appVersionController.search(req, res);
});

module.exports = appVersionRoutes;