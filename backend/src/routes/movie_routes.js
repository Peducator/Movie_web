const router = require("express").Router();
const { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require("../controllers/movie_controllers");
const { verifyToken, adminMiddleware} = require("../middlewares/auth_middlewares");

router.get("/movies", getAllMovies);
router.get("/movies/:id", getMovieById);
router.post("/movies", verifyToken, adminMiddleware, createMovie);
router.put("/movies/:id", verifyToken, adminMiddleware, updateMovie);
router.delete("/movies/:id", verifyToken, adminMiddleware, deleteMovie);

module.exports = router;