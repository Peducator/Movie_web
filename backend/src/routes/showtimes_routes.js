const router = require("express").Router();
const { getShowtimesByMovie, createShowtime, deleteShowtime } = require("../controllers/showtimes_controllers");
const { accessToken, adminMiddleware } = require("../middlewares/auth_middlewares");

router.get("/movies/:movieId", getShowtimesByMovie);
router.post("/movies", accessToken, adminMiddleware, createShowtime);
router.delete("/movies/:id", accessToken, adminMiddleware, deleteShowtime);

module.exports = router;