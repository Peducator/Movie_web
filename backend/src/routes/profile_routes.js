const router = require("express").Router();
const {getProfile, updateProfile} = require("../controllers/profile_controllers");
const { verifyToken } = require("../middlewares/auth_middlewares");

router.get("/profiles", verifyToken, getProfile);
router.put("/profiles", verifyToken, updateProfile);

module.exports = router;