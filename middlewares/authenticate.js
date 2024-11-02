const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware to authenticate the user
const authenticate = async (req, res, next) => {
  res.header("Vary", "Authorization");

  const authorizationHeader = req.headers.authorization;

  // If there is no Authorization header found, proceed with an anonymous user
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    // Verify the JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token, user not found" });
    }

    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authenticate;
