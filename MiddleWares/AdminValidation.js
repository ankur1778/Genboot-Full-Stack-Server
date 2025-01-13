const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ msg: "Authorization token is missing" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .send({ msg: "Invalid token", error: err.message });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(403).json({ msg: "Access denied", error: error.message });
  }
};

module.exports = adminAuth;
