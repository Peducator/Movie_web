const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getShowtimesByMovie = async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId, 10);
    if (Number.isNaN(movieId)) {
      return res.status(400).json({ message: "ID phim không hợp lệ." });
    }

    const showtimes = await prisma.showtime.findMany({
      where: { movie_id: movieId },
      include: {
        room: true,
        movie: true,
      },
      orderBy: { date: "asc" },
    });

    return res.status(200).json(showtimes);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const createShowtime = async (req, res) => {
  try {
    const { room_id, movie_id, date, start_time, end_time } = req.body;

    if (!room_id || !movie_id || !date || !start_time || !end_time) {
      return res.status(400).json({ message: "Vui lòng cung cấp room_id, movie_id, date, start_time và end_time." });
    }

    const room = await prisma.room.findUnique({ where: { room_id: parseInt(room_id, 10) } });
    if (!room) {
      return res.status(404).json({ message: "Phòng chiếu không tồn tại." });
    }

    const movie = await prisma.movie.findUnique({ where: { movie_id: parseInt(movie_id, 10) } });
    if (!movie) {
      return res.status(404).json({ message: "Phim không tồn tại." });
    }

    const showtimeDate = new Date(date);
    if (Number.isNaN(showtimeDate.getTime())) {
      return res.status(400).json({ message: "Ngày chiếu không hợp lệ." });
    }

    const showtime = await prisma.showtime.create({
      data: {
        room_id: parseInt(room_id, 10),
        movie_id: parseInt(movie_id, 10),
        date: showtimeDate,
        start_time,
        end_time,
      },
    });

    return res.status(201).json({ message: "Tạo lịch chiếu thành công.", showtime });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const deleteShowtime = async (req, res) => {
  try {
    const showtimeId = parseInt(req.params.id, 10);
    if (Number.isNaN(showtimeId)) {
      return res.status(400).json({ message: "ID lịch chiếu không hợp lệ." });
    }

    const showtime = await prisma.showtime.findUnique({ where: { showtime_id: showtimeId } });
    if (!showtime) {
      return res.status(404).json({ message: "Lịch chiếu không tồn tại." });
    }

    await prisma.showtime.delete({ where: { showtime_id: showtimeId } });
    return res.status(200).json({ message: "Xóa lịch chiếu thành công." });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

module.exports = { getShowtimesByMovie, createShowtime, deleteShowtime };
