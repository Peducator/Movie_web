const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.$queryRaw`
        WITH total_seats_by_user AS (
            SELECT table1.user_id, SUM(table1.total_seats) AS total_seats
            FROM (
                SELECT users.user_id, COUNT(seats.seat_id) AS total_seats
                FROM users
                JOIN tickets ON users.user_id = tickets.user_id
                JOIN transactions ON transactions.transaction_id = tickets.transaction_id
                JOIN seats ON seats.seat_id = tickets.seat_id
                GROUP BY users.user_id
            ) AS table1
            GROUP BY table1.user_id
        ),
        total_amount_by_user AS (
            SELECT u.user_id, SUM(t.transaction_amount) AS total_amount
            FROM users u
            JOIN (
                SELECT DISTINCT tk.user_id, tr.transaction_id, tr.transaction_amount
                FROM tickets tk
                JOIN transactions tr ON tr.transaction_id = tk.transaction_id
            ) AS t ON t.user_id = u.user_id
            GROUP BY u.user_id
        )
        SELECT u.user_id, u.user_name, u.user_email, u.user_phone, u.age, u.gender,
               a.total_amount, s.total_seats
        FROM users AS u
        LEFT JOIN total_amount_by_user AS a ON u.user_id = a.user_id
        LEFT JOIN total_seats_by_user AS s ON u.user_id = s.user_id
        WHERE u.user_id = ${userId}
    `;

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    return res.status(200).json(user[0]);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, username, phonenumber, age, gender } = req.body;

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: {
        user_email: email,
        user_name: username,
        user_phone: phonenumber,
        age: age,
        gender: gender
      },
      select: {
        user_email: true,
        user_name: true,
        user_phone: true,
        age: true,
        gender: true,
      },
    });

    return res.status(200).json({ message: "Cập nhật thành công.", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server.", error: error.message });
  }
};


module.exports = {
  getProfile,
  updateProfile,
};
