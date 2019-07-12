var userRoutes = express.Router();

var userController = require('../../controller/user/userController');

userRoutes.get('/', userController.getAll);
userRoutes.post('/add', userController.add);
userRoutes.post('/update', userController.add);
userRoutes.post('/search', userController.search);
userRoutes.post('/changePassword', userController.changePassword);

module.exports = userRoutes;