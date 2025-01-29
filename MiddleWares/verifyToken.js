const jwt = require("jsonwebtoken");
const { TokenMessage } = require("../lib/statusMessage");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract token

  if (!token) {
    return res.status(403).json({ message: TokenMessage.MISSING_TOKEN });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: TokenMessage.INVALID, error: err.message });
    }

    req.user = decoded;
    next(); 
  });
};

module.exports = verifyToken