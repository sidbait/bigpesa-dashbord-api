var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/master/eventController');

appRoutes.get('/spinbonus', function(req, res)
{
    appController.getAll(req, res);
});

appRoutes.post('/spinbonus/add', function(req, res)
{ 
    appController.add(req, res);
});

appRoutes.post('/spinbonus/update', function(req, res)
{
    appController.add(req, res);
});

appRoutes.post('/spinbonus/search', function(req, res)
{
    appController.search(req, res);
});

module.exports = appRoutes;