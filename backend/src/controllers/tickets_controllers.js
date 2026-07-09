const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bookTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { showtime_id, seat_ids, transaction_amount } = req.body;

    // 1. Validate đầu vào
    if (!showtime_id || !Array.isArray(seat_ids) || seat_ids.length === 0 || transaction_amount == null) {
      return res.status(400).json({ message: "Vui lòng cung cấp showtime_id, seat_ids (mảng) và transaction_amount." });
    }

    const parsedShowtimeId = parseInt(showtime_id, 10);
    const parsedSeatIds = seat_ids.map((id) => parseInt(id, 10));

    // 2. Kiểm tra showtime tồn tại
    const showtime = await prisma.showtime.findUnique({ where: { showtime_id: parsedShowtimeId } });
    if (!showtime) {
      return res.status(404).json({ message: "Lịch chiếu không tồn tại." });
    }

    // 3. Kiểm tra tất cả seat tồn tại và thuộc đúng phòng
    const seats = await prisma.seat.findMany({ where: { seat_id: { in: parsedSeatIds } } });
    if (seats.length !== parsedSeatIds.length) {
      return res.status(404).json({ message: "Một hoặc nhiều ghế không tồn tại." });
    }
    const wrongRoom = seats.some((seat) => seat.room_id !== showtime.room_id);
    if (wrongRoom) {
      return res.status(400).json({ message: "Một hoặc nhiều ghế không thuộc phòng chiếu này." });
    }

    // 4. Kiểm tra ghế đã bị đặt chưa
    const existingTickets = await prisma.ticket.findMany({
      where: {
        showtime_id: parsedShowtimeId,
        seat_id: { in: parsedSeatIds },
        ticket_status: { not: "CANCELED" },
      },
    });
    if (existingTickets.length > 0) {
      const takenSeatIds = existingTickets.map((t) => t.seat_id);
      return res.status(409).json({ message: "Một hoặc nhiều ghế đã được đặt.", taken_seats: takenSeatIds });
    }

    // 5. Tạo transaction + nhiều ticket trong cùng 1 atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          transaction_amount: parseFloat(transaction_amount),
          transaction_status: "COMPLETED",
        },
      });

      const tickets = await Promise.all(
        parsedSeatIds.map((seatId) =>
          tx.ticket.create({
            data: {
              user_id: userId,
              showtime_id: parsedShowtimeId,
              seat_id: seatId,
              transaction_id: transaction.transaction_id,
              ticket_status: "BOOKED",
            },
          })
        )
      );

      return { transaction, tickets };
    });

    return res.status(201).json({ message: "Đặt vé thành công.", ...result });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const cancelTicket = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (Number.isNaN(ticketId)) {
      return res.status(400).json({ message: "ID vé không hợp lệ." });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { ticket_id: ticketId },
      include: { transaction: true },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Vé không tồn tại." });
    }

    if (ticket.user_id !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền hủy vé này." });
    }

    if (ticket.ticket_status === "CANCELED") {
      return res.status(400).json({ message: "Vé đã bị hủy trước đó." });
    }

    await prisma.ticket.update({
      where: { ticket_id: ticketId },
      data: { ticket_status: "CANCELED" },
    });

    await prisma.transaction.update({
      where: { transaction_id: ticket.transaction_id },
      data: { transaction_status: "REFUNDED" },
    });

    return res.status(200).json({ message: "Hủy vé thành công." });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;

    const tickets = await prisma.ticket.findMany({
      where: { user_id: userId },
      include: {
        showtime: {
          include: {
            movie: true,
            room: true,
          },
        },
        seat: true,
        transaction: true,
      },
      orderBy: { ticket_id: "desc" },
    });

    return res.status(200).json(tickets);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

module.exports = { bookTicket, cancelTicket, getUserTickets };
