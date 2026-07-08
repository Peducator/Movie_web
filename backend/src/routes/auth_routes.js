const router = require("express").Router();
const {register, login , authRefreshToken, logout, googleCallback} = require("../controllers/auth_controllers");
const { adminMiddleware, accessToken } = require("../middlewares/auth_middlewares");
const passport = require("../google_config/passport");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", authRefreshToken);
router.post("/logout", logout);
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

module.exports = router;