const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_email: true,
        user_name: true,
        user_phone: true,
        age: true,
        gender: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    return res.status(200).json(user);
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
