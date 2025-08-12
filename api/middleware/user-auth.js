import jwt from "jsonwebtoken";
import User from "../models/user.js";

const userAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ error: "Authorization token required" });
    }
    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export default userAuth;
