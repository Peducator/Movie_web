const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getOrderByTransaction = async (req, res) => {
  try {
    const transactionId = parseInt(req.params.transactionId, 10)

    const tickets = await prisma.ticket.findMany({
      where: { transaction_id: transactionId },
      include: {
        seat: true,
        showtime: {
          include: {
            movie: true,
            room: true,
          }
        },
        transaction: true,
      }
    })

    if (tickets.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." })
    }

    const order = {
      transaction_id: tickets[0].transaction.transaction_id,
      transaction_status: tickets[0].transaction.transaction_status,
      total_amount: tickets[0].transaction.transaction_amount,
      showtime_id: tickets[0].showtime_id,
      movie_name: tickets[0].showtime.movie.movie_name,
      showtime_date: new Date(tickets[0].showtime.start_time).toLocaleDateString('vi-VN'),
      showtime_time: new Date(tickets[0].showtime.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      room_name: tickets[0].showtime.room.room_name,
      seats: tickets.map(t => ({
        seat_id: t.seat_id,
        seat_code: t.seat.seat_code,
        seat_type: t.seat.seat_type,
        price: t.seat.seat_type === 'standard' ? 75000 : t.seat.seat_type === 'vip' ? 110000 : 180000,
      })),
    }

    return res.status(200).json(order)
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message })
  }
}

  const completePayment = async (req, res) => {
    try {
      const { transaction_id } = req.params

      const transaction = await prisma.transaction.findUnique({
        where: { transaction_id: parseInt(transaction_id) }
      })

      if (!transaction) {
        return res.status(404).json({ message: "Giao dịch không tồn tại." })
      }

      if (transaction.transaction_status !== "pending") {
        return res.status(400).json({ message: "Giao dịch không hợp lệ." })
      }

      await prisma.$transaction([
        prisma.ticket.updateMany({
          where: { transaction_id: parseInt(transaction_id) },
          data: { ticket_status: "booked" }
        }),
        prisma.transaction.update({
          where: { transaction_id: parseInt(transaction_id) },
          data: { transaction_status: "completed" }
        })
      ])

      return res.status(200).json({ message: "Thanh toán thành công." })
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server.", error: error.message })
    }
  }

    const cancelTransaction = async (req, res) => {
      try {
        const transactionId = parseInt(req.params.transaction_id, 10)
        if (Number.isNaN(transactionId)) {
          return res.status(400).json({ message: "ID giao dịch không hợp lệ." })
        }
        // ← thêm đoạn này
        const ticket = await prisma.ticket.findFirst({
          where: { transaction_id: transactionId }
        })

        if (!ticket) {
          return res.status(404).json({ message: "Không tìm thấy giao dịch." })
        }

        await prisma.$transaction([
          // Đổi tất cả ticket trong transaction → cancelled
          prisma.ticket.updateMany({
            where: { transaction_id: transactionId },
            data: { ticket_status: 'cancelled' }
          }),
          // Đổi transaction → cancelled
          prisma.transaction.update({
            where: { transaction_id: transactionId },
            data: { transaction_status: 'cancelled' }
          }),
          prisma.user.update({
              where: { user_id: ticket.user_id },
              data: { cooldown_until: new Date(Date.now() + 60000) }
            })
        ])
        return res.status(200).json({ message: "Giao dịch đã được hủy." })
      } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Có lỗi xảy ra khi hủy giao dịch." })
      }
    }

module.exports = {
  getOrderByTransaction, completePayment, cancelTransaction
}