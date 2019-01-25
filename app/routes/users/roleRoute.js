var roleRoutes = express.Router();

var roleController = require('../../controller/user/roleController');

roleRoutes.get('/', roleController.getAll);
roleRoutes.post('/add', roleController.add);
roleRoutes.post('/update', roleController.add);
roleRoutes.post('/search', roleController.search);

module.exports = roleRoutes;