const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: 'Không có token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('decoded:', decoded)
    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Không có quyền truy cập." });
  }
  next();
};

module.exports = { verifyToken, adminMiddleware };