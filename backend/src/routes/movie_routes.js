const router = require("express").Router();
const { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie } = require("../controllers/movie_controllers");
const { accessToken, adminMiddleware} = require("../middlewares/auth_middlewares");

router.get("/", getAllMovies);
router.get("/:id", getMovieById);
router.post("/", accessToken, adminMiddleware, createMovie);
router.put("/:id", accessToken, adminMiddleware, updateMovie);
router.delete("/:id", accessToken, adminMiddleware, deleteMovie);

module.exports = router;