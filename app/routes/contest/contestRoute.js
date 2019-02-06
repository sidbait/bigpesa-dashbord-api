var contestRoutes = express.Router();

var validate = require('../../auth/validate');

var contestController = require('../../controller/contest/contestController');

contestRoutes.get('/', function(req, res)
{
    contestController.getAll(req, res);
});

contestRoutes.post('/add', function(req, res)
{ 
    contestController.add(req, res);
});

contestRoutes.post('/addbulk', function(req, res)
{ 
    contestController.addBulk(req, res);
});

contestRoutes.post('/update', function(req, res)
{
    contestController.add(req, res);
});

contestRoutes.post('/search', function(req, res)
{
    contestController.search(req, res);
});

contestRoutes.post('/updateContestStatus', function(req, res)
{ 
    contestController.updateContestStatus(req, res);
});

module.exports = contestRoutes;