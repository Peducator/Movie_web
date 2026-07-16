const router = require("express").Router();
const { getShowtimesByMovie, createShowtime, deleteShowtime, getAllShowtimes } = require("../controllers/showtimes_controllers");
const { verifyToken, adminMiddleware } = require("../middlewares/auth_middlewares");

router.get("/movies/getAll", getAllShowtimes);
router.get("/movies/:movieId", getShowtimesByMovie);
router.post("/movies", verifyToken, adminMiddleware, createShowtime);
router.delete("/movies/:id", verifyToken, adminMiddleware, deleteShowtime);

module.exports = router;