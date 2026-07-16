const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getSeatsByShowtime = async (req, res) => {
  try {
    const showtimeId = parseInt(req.params.showtimeId, 10);
    if (Number.isNaN(showtimeId)) {
      return res.status(400).json({ message: "ID lịch chiếu không hợp lệ." });
    }

    const showtime = await prisma.showtime.findUnique({
      where: { showtime_id: showtimeId },
      include: {
        movie: true,
        room: {
          include: {
            seats: true,
          },
        },
        tickets: true,
      },
    });

    if (!showtime) {
      return res.status(404).json({ message: "Lịch chiếu không tồn tại." });
    }

    const reservedSeatIds = new Set(showtime.tickets.map((ticket) => ticket.seat_id));
    const seats = showtime.room.seats.map((seat) => ({
      seat_id: seat.seat_id,
      room_id: seat.room_id,
      seat_code: seat.seat_code,
      seat_type: seat.seat_type,
      isReserved: reservedSeatIds.has(seat.seat_id),
    }));

    return res.status(200).json({
      movie: {
        movie_id: showtime.movie.movie_id,
        movie_name: showtime.movie.movie_name,
      },
      showtime: {
        showtime_id: showtime.showtime_id,
        movie_id: showtime.movie_id,
        room_id: showtime.room_id,
        date: showtime.date,
        start_time: showtime.start_time,
        end_time: showtime.end_time,
      },
      room: {
        room_id: showtime.room.room_id,
        room_name: showtime.room.room_name,
        room_capacity: showtime.room.room_capacity,
      },
      seats,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const getBookedSeatsByShowtime = async (req, res) => {
  try {
    const showtimeId = parseInt(req.params.showtimeId, 10)
    if (Number.isNaN(showtimeId)) {
      return res.status(400).json({ message: "ID suất chiếu không hợp lệ." })
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        showtime_id: showtimeId,
        ticket_status: {
          in: ['booked', 'pending']
        }
      },
      include: {
        seat: {
          select: {
            seat_id: true,
            seat_code: true
          }
        }
      }
    })

    const bookedSeats = tickets.map(t => ({
      seat_id: t.seat.seat_id,
      seat_code: t.seat.seat_code
    }))

    return res.status(200).json(bookedSeats)
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message })
  }
}

module.exports = { getSeatsByShowtime, getBookedSeatsByShowtime };
