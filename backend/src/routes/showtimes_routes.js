const router = require("express").Router();
const { getShowtimesByMovie, createShowtime, deleteShowtime } = require("../controllers/showtimes_controllers");
const { accessToken, adminMiddleware } = require("../middlewares/auth_middlewares");

router.get("/movie/:movieId", getShowtimesByMovie);
router.post("/", accessToken, adminMiddleware, createShowtime);
router.delete("/:id", accessToken, adminMiddleware, deleteShowtime);

module.exports = router;