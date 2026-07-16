const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const COOLDOWN_MS = 60 * 1000
const EXPIRE_MS = 60 * 1000

const bookTicket = async (req, res) => {
  try {
    const { showtime_id, seat_ids, transaction_amount} = req.body
    const userId = req.user.id

    // 1. Validate đầu vào
    if (!showtime_id || !Array.isArray(seat_ids) || seat_ids.length === 0 || transaction_amount == null) {
      return res.status(400).json({ message: "Vui lòng cung cấp showtime_id, seat_ids (mảng) và transaction_amount." })
    }

    const parsedShowtimeId = parseInt(showtime_id, 10)
    const parsedSeatIds = seat_ids.map((id) => parseInt(id, 10))

    // 2. Kiểm tra cooldown
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { cooldown_until: true }
    })

    if (user.cooldown_until && new Date() < new Date(user.cooldown_until)) {
      const secondsLeft = Math.ceil((new Date(user.cooldown_until) - Date.now()) / 1000)
      return res.status(429).json({ message: `Vui lòng chờ ${secondsLeft} giây.`, secondsLeft })
    }

    // 3. Kiểm tra showtime tồn tại
    const showtime = await prisma.showtime.findUnique({ where: { showtime_id: parsedShowtimeId } })
    if (!showtime) {
      return res.status(404).json({ message: "Lịch chiếu không tồn tại." })
    }

    // 4. Kiểm tra seat tồn tại và đúng phòng
    const seats = await prisma.seat.findMany({ where: { seat_id: { in: parsedSeatIds } } })
    if (seats.length !== parsedSeatIds.length) {
      return res.status(404).json({ message: "Một hoặc nhiều ghế không tồn tại." })
    }
    if (seats.some((seat) => seat.room_id !== showtime.room_id)) {
      return res.status(400).json({ message: "Một hoặc nhiều ghế không thuộc phòng chiếu này." })
    }

    // 5. Kiểm tra ghế đã bị đặt chưa
    const existingTickets = await prisma.ticket.findMany({
      where: {
        showtime_id: parsedShowtimeId,
        seat_id: { in: parsedSeatIds },
        ticket_status: { not: 'cancelled' },
      },
    })
    if (existingTickets.length > 0) {
      return res.status(409).json({
        message: "Một hoặc nhiều ghế đã được đặt.",
        taken_seats: existingTickets.map((t) => t.seat_id)
      })
    }

    // 6. Tạo transaction + ticket (atomic)
    const { transaction } = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: { transaction_amount: parseFloat(transaction_amount), transaction_status: 'pending' }
      })

      await tx.ticket.createMany({
        data: parsedSeatIds.map((seatId) => ({
          user_id: userId,
          showtime_id: parsedShowtimeId,
          seat_id: seatId,
          transaction_id: transaction.transaction_id,
          ticket_status: 'pending',
        }))
      })

      return { transaction }
    })

    const expiredAt = new Date(Date.now() + EXPIRE_MS)

    res.status(201).json({
      message: "Đặt vé thành công.",
      transaction_id: transaction.transaction_id,
      expired_at: expiredAt
    })

    // Tự động hủy nếu hết hạn mà vẫn pending
    scheduleAutoCancel(transaction.transaction_id, EXPIRE_MS)

  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Lỗi server.", error: error.message })
  }
}

// Helper: tự động hủy transaction nếu hết hạn mà chưa thanh toán
async function scheduleAutoCancel(transactionId, delayMs) {
  setTimeout(async () => {
    const transaction = await prisma.transaction.findUnique({ where: { transaction_id: transactionId } })
    if (transaction?.transaction_status !== 'pending') return

    await prisma.$transaction([
      prisma.ticket.updateMany({
        where: { transaction_id: transactionId },
        data: { ticket_status: 'cancelled' }
      }),
      prisma.transaction.update({
        where: { transaction_id: transactionId },
        data: { transaction_status: 'cancelled' }
      })
    ])
  }, delayMs)
}

const cancelTicket = async (req, res) => {
  try {
    const { transaction_id } = req.params

    await prisma.ticket.updateMany({
      where: { 
        transaction_id: parseInt(transaction_id),
        ticket_status: "pending"
      },
      data: { ticket_status: "cancelled" }
    })

    await prisma.transaction.update({
      where: { transaction_id: parseInt(transaction_id) },
      data: { transaction_status: "cancelled" }
    })

    return res.status(200).json({ message: "Hủy vé thành công." })
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message })
  }
};

  const getUserTickets = async (req, res) => {
    try {
      const userId = req.user.id;

      const tickets = await prisma.$queryRaw`
          SELECT 
              t.ticket_id,
              t.ticket_status,
              m.movie_name,
              DATE_FORMAT(s.start_time, '%d/%m/%Y') AS showtime_date,
              DATE_FORMAT(s.start_time, '%H:%i') AS showtime_time,
              r.room_name,
              se.seat_code,
              se.seat_type,
              tr.transaction_amount,
              tr.transaction_status
          FROM tickets t
          JOIN showtimes s ON s.showtime_id = t.showtime_id
          JOIN movies m ON m.movie_id = s.movie_id
          JOIN rooms r ON r.room_id = s.room_id
          JOIN seats se ON se.seat_id = t.seat_id
          JOIN transactions tr ON tr.transaction_id = t.transaction_id
          WHERE t.user_id = ${userId}
          AND t.ticket_status IN ('booked', 'cancelled')
      `;

      if (!tickets || tickets.length === 0) {
        return res.status(404).json({ message: "Không có vé nào." });
      }

      return res.status(200).json(tickets);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server.", error: error.message });
    }
  };

module.exports = { bookTicket, cancelTicket, getUserTickets };
