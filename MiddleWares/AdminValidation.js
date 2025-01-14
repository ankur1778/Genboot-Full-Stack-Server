const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(process.env.JWT_SECRET);
        
        if (decoded.roleId !== process.env.ROLE_ADMIN) { 
            return res.status(403).json({ message: "Forbidden: Admin access only" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.error(error);
        res.status(403).json({ message: "Invalid token or access denied" });
    }
};

module.exports = adminAuth