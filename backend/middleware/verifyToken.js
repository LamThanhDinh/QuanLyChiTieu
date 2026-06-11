const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token. Truy cập bị từ chối." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // gắn info người dùng vào req
    next(); // cho phép tiếp tục
  } catch (err) {
    res.status(403).json({ message: "Token không hợp lệ." });
  }
}

module.exports = verifyToken;
