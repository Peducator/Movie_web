const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { user_email: email }
    });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại." });
    }

    const isMatch = await bcrypt.compare(password, user.user_password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu." });
    }

    const accessToken = jwt.sign(
      { id: user.user_id, email: user.user_email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.user_id, email: user.user_email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { refresh_token: refreshToken }
    });

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      accessToken,
      user: {
        id: user.user_id,
        email: user.user_email,
        username: user.user_name,
        jwt: accessToken,
        refreshToken: refreshToken
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

const register = async (req, res) => {
  try {
    const { email, username, password, phonenumber, age } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { user_email: email }
    });
    if (existingUser) {
      return res.status(409).json({ message: "Email đã được sử dụng." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        user_email: email,
        user_name: username,
        user_password: hashedPassword,
        user_phone: phonenumber,
        age
      }
    });

    return res.status(201).json({
      message: "Đăng ký thành công!",
      user: {
        id: newUser.user_id,
        email: newUser.user_email,
        username: newUser.user_name,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await prisma.user.update({
      where: { user_id: decoded.id },
      data: { refresh_token: null }
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const authRefreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({
      where: { user_id: decoded.id }
    });
    const newAccessToken = jwt.sign(
      { id: user.user_id, email: user.user_email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const googleCallback = async (req, res) => {
  const accessToken = jwt.sign(
    { id: req.user.user_id, email: req.user.user_email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: req.user.user_id, email: req.user.user_email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await prisma.user.update({
    where: { user_id: req.user.user_id },
    data: { refresh_token: refreshToken },
  });

  return res.status(200).json({ accessToken, refreshToken });
};

module.exports = { login, register, logout, authRefreshToken, googleCallback };