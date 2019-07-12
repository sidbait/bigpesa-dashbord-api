var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/master/eventController');

appRoutes.get('/event', function(req, res)
{
    appController.getAll(req, res);
});

appRoutes.post('/event/add', function(req, res)
{ 
    appController.add(req, res);
});

appRoutes.post('/event/update', function(req, res)
{
    appController.add(req, res);
});

appRoutes.post('/event/search', function(req, res)
{
    appController.search(req, res);
});

module.exports = appRoutes;