var userRoutes = express.Router();

var validate = require('../../auth/validate');

var userProfileController = require('../../controller/userProfile/userProfileController');

userRoutes.post('/getUserDetails', userProfileController.getUserDetails);
userRoutes.post('/updateUserDetails', userProfileController.updateUserDetails);

module.exports = userRoutes;