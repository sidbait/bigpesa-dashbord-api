var appRoutes = express.Router();

var validate = require('../../auth/validate');

var appController = require('../../controller/master/topWinnerController');

appRoutes.get('/topWinner', function(req, res)
{
    appController.getAll(req, res);
});

appRoutes.post('/topWinner/add', function(req, res)
{ 
    appController.add(req, res);
});

appRoutes.post('/topWinner/update', function(req, res)
{
    appController.add(req, res);
});

appRoutes.post('/topWinner/search', function(req, res)
{
    appController.search(req, res);
});

module.exports = appRoutes;