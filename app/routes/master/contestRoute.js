var contestRoutes = express.Router();

var validate = require('../../auth/validate');

var contestController = require('../../controller/master/contestController');

contestRoutes.get('/contest', function(req, res)
{
    contestController.getAll(req, res);
});

contestRoutes.post('/contest/add', function(req, res)
{ 
    contestController.add(req, res);
});

contestRoutes.post('/contest/addbulk', function(req, res)
{ 
    contestController.addBulk(req, res);
});

contestRoutes.post('/contest/update', function(req, res)
{
    contestController.add(req, res);
});

contestRoutes.post('/contest/search', function(req, res)
{
    contestController.search(req, res);
});

module.exports = contestRoutes;