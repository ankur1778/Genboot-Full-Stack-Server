const jwt = require("jsonwebtoken");
const {
  AdminMessage,
  TokenMessage,
  ServerErrorMessage,
} = require("../lib/statusMessage");

const adminAuth = (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    const roleId = req.roleId;
    
    if (!token) {
      return res.status(401).json({ msg: TokenMessage.MISSING_TOKEN });
    }

    if (!roleId || roleId !== process.env.ROLE_ADMIN) {
      return res.status(403).json({ msg: AdminMessage.NOT_AUTH });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ msg: TokenMessage.INVALID, error: err.message });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: ServerErrorMessage.SERVER_ERROR, error: error.message });
  }
};

module.exports = adminAuth;
