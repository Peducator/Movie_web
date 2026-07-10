const router = require("express").Router();
const { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require("../controllers/movie_controllers");
const { accessToken, adminMiddleware} = require("../middlewares/auth_middlewares");

router.get("/movies", getAllMovies);
router.get("/movies/:id", getMovieById);
router.post("/movies", accessToken, adminMiddleware, createMovie);
router.put("/movies/:id", accessToken, adminMiddleware, updateMovie);
router.delete("/movies/:id", accessToken, adminMiddleware, deleteMovie);

module.exports = router;