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

    // Set cookie thay vì trả trong body
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 phút
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      user: {
        id: user.user_id,
        email: user.user_email,
        username: user.user_name,
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

const register = async (req, res) => {
  try {
    const { email, username, password, phonenumber, age ,gender} = req.body;

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
        age: parseInt(age),
        gender
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
const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    await prisma.user.update({
      where: { user_id: decoded.id },
      data: { refresh_token: null }
    });

    // Xóa cả 2 cookie
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    // Dù token lỗi vẫn xóa cookie
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    return res.status(200).json({ message: "Logout successful" });
  }
};


const authRefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await prisma.user.findUnique({
      where: { user_id: decoded.id }
    });

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newAccessToken = jwt.sign(
      { id: user.user_id, email: user.user_email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    return res.status(200).json({ message: "Token refreshed" });

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
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 phút
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });

  await prisma.user.update({
    where: { user_id: req.user.user_id },
    data: { refresh_token: refreshToken },
  });
  return res.redirect(`${process.env.CLIENT_URL}/home`);
};

module.exports = { login, register, logout, authRefreshToken, googleCallback };