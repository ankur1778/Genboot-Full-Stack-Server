const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract token

  if (!token) {
    return res.status(403).json({ message: "No token provided, authorization denied." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token, authorization denied.", error: err.message });
    }

    req.user = decoded;
    next(); // Proceed to the next middleware/route handler
  });
};

module.exports = verifyToken