const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get all movies
const getAllMovies = async (req, res) => {
  try {
    const movies = await prisma.movie.findMany();
    return res.status(200).json(movies);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

// get movie by id
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: { movie_id: parseInt(id) },
    });
    if (!movie) {
      return res.status(404).json({ message: "Phim không tồn tại." });
    }
    return res.status(200).json(movie);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

// create movie (admin)
const createMovie = async (req, res) => {
  try {
    const { movie_name, movie_duration, movie_genre, movie_poster_url, movie_description } = req.body;
    const movie = await prisma.movie.create({
      data: { movie_name, movie_duration, movie_genre, movie_poster_url, movie_description },
    });
    return res.status(201).json({ message: "Tạo phim thành công.", movie });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

// update movie (admin)
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const { movie_name, movie_duration, movie_genre, movie_poster_url, movie_description } = req.body;
    const movie = await prisma.movie.findUnique({
      where: { movie_id: parseInt(id) },
    });
    if (!movie) {
      return res.status(404).json({ message: "Phim không tồn tại." });
    }
    const updatedMovie = await prisma.movie.update({
      where: { movie_id: parseInt(id) },
      data: { movie_name, movie_duration, movie_genre, movie_poster_url, movie_description },
    });
    return res.status(200).json({ message: "Cập nhật thành công.", movie: updatedMovie });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

// delete movie (admin)
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: { movie_id: parseInt(id) },
    });
    if (!movie) {
      return res.status(404).json({ message: "Phim không tồn tại." });
    }
    await prisma.movie.delete({
      where: { movie_id: parseInt(id) },
    });
    return res.status(200).json({ message: "Xóa phim thành công." });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie };