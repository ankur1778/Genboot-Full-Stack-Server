const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const roleId = req.headers.roleid;

    if (!token) {
      return res.status(401).json({ msg: "Authorization token is missing" });
    }

    if (!roleId || roleId !== process.env.ROLE_ADMIN) {
      return res
        .status(403)
        .json({ msg: "Access denied: You are not an admin" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ msg: "Invalid token", error: err.message });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

module.exports = adminAuth;
