const router = require("express").Router();
const AuthController = require("../controllers/auth_controllers");
const { authMiddleware, authRefreshToken } = require("../middlewares/auth_middlewares");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.authRefreshToken);
router.post("/logout", AuthController.logout);

module.exports = router;