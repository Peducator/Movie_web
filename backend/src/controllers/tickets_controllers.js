const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const bookTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { showtime_id, seat_id, transaction_amount } = req.body;

    if (!showtime_id || !seat_id || transaction_amount == null) {
      return res.status(400).json({ message: "Vui lòng cung cấp showtime_id, seat_id và transaction_amount." });
    }

    const showtime = await prisma.showtime.findUnique({ where: { showtime_id: parseInt(showtime_id, 10) } });
    if (!showtime) {
      return res.status(404).json({ message: "Lịch chiếu không tồn tại." });
    }

    const seat = await prisma.seat.findUnique({ where: { seat_id: parseInt(seat_id, 10) } });
    if (!seat) {
      return res.status(404).json({ message: "Ghế không tồn tại." });
    }

    if (seat.room_id !== showtime.room_id) {
      return res.status(400).json({ message: "Ghế không thuộc phòng chiếu của lịch chiếu này." });
    }

    const existingTicket = await prisma.ticket.findFirst({
      where: {
        showtime_id: parseInt(showtime_id, 10),
        seat_id: parseInt(seat_id, 10),
        ticket_status: { not: "CANCELED" },
      },
    });
    if (existingTicket) {
      return res.status(409).json({ message: "Ghế đã được đặt cho lịch chiếu này." });
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          transaction_amount: parseFloat(transaction_amount),
          transaction_status: "COMPLETED",
        },
      });
      const ticket = await tx.ticket.create({
        data: {
          user_id: userId,
          showtime_id: parseInt(showtime_id, 10),
          seat_id: parseInt(seat_id, 10),
          transaction_id: transaction.transaction_id,
          ticket_status: "BOOKED",
        },
      });
      return { transaction, ticket };
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
