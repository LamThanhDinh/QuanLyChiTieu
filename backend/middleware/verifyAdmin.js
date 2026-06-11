const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function verifyAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token. Truy cập bị từ chối." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kiểm tra user có tồn tại và có role admin không
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Bạn không có quyền truy cập. Chỉ dành cho admin." });
    }

    req.user = decoded; // gắn info người dùng vào req
    next(); // cho phép tiếp tục
  } catch (err) {
    res.status(403).json({ message: "Token không hợp lệ." });
  }
}

module.exports = verifyAdmin;
