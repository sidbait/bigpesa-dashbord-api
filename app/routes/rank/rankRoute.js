var rankRoutes = express.Router();

var rankController = require('../../controller/rank/rankController');

rankRoutes.get('/', function(req, res)
{
    rankController.getAll(req, res);
});

rankRoutes.post('/add', function(req, res)
{ 
    rankController.add(req, res);
});

rankRoutes.post('/bulkInsert', function(req, res)
{ 
    rankController.bulkInsert(req, res);
});

rankRoutes.post('/update', function(req, res)
{
    rankController.add(req, res);
});

rankRoutes.post('/search', function(req, res)
{
    rankController.search(req, res);
});

module.exports = rankRoutes;