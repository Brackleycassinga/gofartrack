const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Get token from header
  const token =
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied",
      details: "Please provide a valid authentication token",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({
      message: "Token is not valid",
      details: err.message,
    });
  }
};
