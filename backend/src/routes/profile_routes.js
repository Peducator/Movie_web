const router = require("express").Router();
const {getProfile, updateProfile} = require("../controllers/profile_controllers");
const { accessToken } = require("../middlewares/auth_middlewares");

router.get("/profile", accessToken, getProfile);
router.put("/profile", accessToken, updateProfile);

module.exports = router;